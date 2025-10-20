import { Context } from 'aws-lambda';
import { CloudSightConfig } from './types';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

// Create SQS client outside handler for reuse
const sqsClient = new SQSClient({ 
  region: process.env.AWS_REGION || 'us-east-1' 
});

export class CloudSightAgent {
  private config: Required<CloudSightConfig>;
  private coldStart: boolean = true;

  constructor(config: CloudSightConfig = {}) {
    this.config = {
      enabled: true,
      sendMetrics: true,
      logLevel: 'info',
      customDimensions: {},
      ...config
    };
  }

  public wrapHandler<TEvent, TResult>(
    handler: (event: TEvent, context: Context) => Promise<TResult>
  ): (event: TEvent, context: Context) => Promise<TResult> {
    
    return async (event: TEvent, context: Context): Promise<TResult> => {
      if (!this.config.enabled) {
        return handler(event, context);
      }

      const startTime = new Date();
      
      // Record cold start
      if (this.coldStart) {
        await this.recordMetric('cold_start', 1, context);
        this.coldStart = false;
      }

      try {
        const result = await handler(event, context);
        const duration = Date.now() - startTime.getTime();
        
        await this.recordMetric('invocation_success', 1, context);
        await this.recordMetric('invocation_duration', duration, context);
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime.getTime();
        
        await this.recordMetric('invocation_error', 1, context);
        await this.recordMetric('invocation_duration', duration, context);
        
        throw error;
      }
    };
  }

  private async recordMetric(name: string, value: number, context: Context): Promise<void> {
    if (!this.config.sendMetrics) return;

    const metric = {
      name,
      value,
      unit: name.includes('duration') ? 'Milliseconds' : 'Count',
      timestamp: new Date().toISOString(),
      dimensions: {
        function_name: context.functionName,
        region: process.env.AWS_REGION || 'unknown',
        aws_request_id: context.awsRequestId,
        memory_size: context.memoryLimitInMB.toString(),
        ...this.config.customDimensions
      },
      _cloudsight: 'metric'
    };

    // Send to SQS if URL is provided
    const sqsUrl = process.env.CLOUDSIGHT_SQS_URL;
    if (sqsUrl) {
      try {
        await sqsClient.send(new SendMessageCommand({
          QueueUrl: sqsUrl,
          MessageBody: JSON.stringify(metric)
        }));
      } catch (error) {
        // Fallback to console if SQS fails
        console.error('Failed to send metric to SQS:', error);
        console.log(JSON.stringify(metric));
      }
    } else {
      // Fallback to console logging
      console.log(JSON.stringify(metric));
    }
  }
}

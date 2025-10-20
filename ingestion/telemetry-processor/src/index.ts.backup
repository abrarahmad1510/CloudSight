import { SQSEvent, Context } from 'aws-lambda';
import { TelemetryProcessor } from './processor';

// Initialize processor with configuration from environment variables
const processor = new TelemetryProcessor();

export const handler = async (event: SQSEvent, context: Context): Promise<void> => {
  console.log(`Processing ${event.Records.length} records from SQS`);

  try {
    const result = await processor.processBatch(event, context);

    console.log('Batch processing completed:', {
      successfulRecords: result.successfulRecords,
      failedRecords: result.failedRecords,
      lambdaRemainingTime: context.getRemainingTimeInMillis(),
    });

    if (result.failedRecords > 0) {
      console.error('Processing errors:', result.processingErrors);
      
      // In production, you might want to send failed records to a DLQ
      // or implement retry logic here
      if (result.failedRecords === event.Records.length) {
        throw new Error('All records failed processing');
      }
    }

  } catch (error) {
    console.error('Failed to process telemetry batch:', error);
    throw error; // This will trigger Lambda retry
  }
};

// Health check endpoint for container reuse
export const health = async (): Promise<{ status: string; dependencies: any }> => {
  const health = await processor.healthCheck();
  
  return {
    status: health.dependencies.clickhouse && health.dependencies.elasticsearch ? 'healthy' : 'degraded',
    dependencies: health.dependencies,
  };
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudSightAgent = void 0;
const client_sqs_1 = require("@aws-sdk/client-sqs");
// Create SQS client outside handler for reuse
const sqsClient = new client_sqs_1.SQSClient({
    region: process.env.AWS_REGION || 'us-east-1'
});
class CloudSightAgent {
    constructor(config = {}) {
        this.coldStart = true;
        this.config = {
            enabled: true,
            sendMetrics: true,
            logLevel: 'info',
            customDimensions: {},
            ...config
        };
    }
    wrapHandler(handler) {
        return async (event, context) => {
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
            }
            catch (error) {
                const duration = Date.now() - startTime.getTime();
                await this.recordMetric('invocation_error', 1, context);
                await this.recordMetric('invocation_duration', duration, context);
                throw error;
            }
        };
    }
    async recordMetric(name, value, context) {
        if (!this.config.sendMetrics)
            return;
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
                await sqsClient.send(new client_sqs_1.SendMessageCommand({
                    QueueUrl: sqsUrl,
                    MessageBody: JSON.stringify(metric)
                }));
            }
            catch (error) {
                // Fallback to console if SQS fails
                console.error('Failed to send metric to SQS:', error);
                console.log(JSON.stringify(metric));
            }
        }
        else {
            // Fallback to console logging
            console.log(JSON.stringify(metric));
        }
    }
}
exports.CloudSightAgent = CloudSightAgent;

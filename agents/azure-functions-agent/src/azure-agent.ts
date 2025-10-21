import { InvocationContext } from '@azure/functions';
import { Tracer, metrics, trace } from '@opentelemetry/api';
import { 
    CloudSightConfig, 
    CustomMetric,
    CloudProviderDetector,
    TelemetrySerializer
} from '@cloudsight/shared';
import { AzureInvocationContext, AzureAgentConfig } from './azure-types';

export class AzureFunctionsAgent {
    private tracer: Tracer;
    private meter: any;
    private coldStart: boolean = true;
    private config: AzureAgentConfig;

    constructor(config: Partial<AzureAgentConfig> = {}) {
        this.config = {
            enabled: true,
            sendMetrics: true,
            captureTraces: true,
            logLevel: 'info',
            captureHttpRequests: true,
            trackStorageOperations: false,
            cloudProvider: 'azure',
            ...config
        };

        this.tracer = trace.getTracer('cloudsight-azure-agent');
        this.meter = metrics.getMeter('cloudsight-azure-agent');
        this.initializeMetrics();
    }

    public wrapHandler<T>(
        handler: (context: InvocationContext, ...args: any[]) => Promise<T> | T
    ): (context: InvocationContext, ...args: any[]) => Promise<T> | T {
        return async (context: InvocationContext, ...args: any[]): Promise<T> => {
            if (!this.config.enabled) {
                return handler(context, ...args);
            }

            const invocationContext = this.captureInvocation(context);
            const trace = await this.startTrace(invocationContext);

            try {
                const result = await handler(context, ...args);
                await this.recordSuccess(trace, result, invocationContext);
                return result;
            } catch (error) {
                await this.recordError(trace, error as Error, invocationContext);
                throw error;
            } finally {
                this.endTrace(trace);
            }
        };
    }

    private captureInvocation(context: InvocationContext): AzureInvocationContext {
        const invocationContext: AzureInvocationContext = {
            functionName: context.functionName,
            functionVersion: context.invocationId, // Using invocationId as version placeholder
            invokedFunctionArn: context.invocationId,
            memoryLimitInMB: process.env.WEBSITE_MEMORY_LIMIT_MB || '1536',
            remainingTimeInMillis: this.calculateRemainingTime(context),
            coldStart: this.coldStart,
            startTime: new Date(),
            awsRequestId: context.invocationId,
            cloudProvider: 'azure',
            functionDirectory: '', // Not available in v4+
            invocationId: context.invocationId,
            log: context,
            executionContext: {
                functionName: context.functionName,
                functionDirectory: '',
                invocationId: context.invocationId
            }
        };

        if (this.coldStart) {
            this.recordMetric({
                name: 'cold_start',
                value: 1,
                unit: 'Count',
                timestamp: new Date(),
                dimensions: {
                    function_name: context.functionName,
                    region: CloudProviderDetector.getRegion()
                },
                cloudProvider: 'azure'
            });
            this.coldStart = false;
        }

        return invocationContext;
    }

    private calculateRemainingTime(context: InvocationContext): number {
        // Azure Functions v4+ doesn't have built-in timeout tracking
        // Default to 5 minutes (300000 ms) which is common for Azure Functions
        return 300000;
    }

    private async startTrace(invocationContext: AzureInvocationContext): Promise<any> {
        const span = this.tracer.startSpan(invocationContext.functionName, {
            startTime: invocationContext.startTime
        });

        const trace = {
            traceId: span.spanContext().traceId,
            spanId: span.spanContext().spanId,
            startTime: invocationContext.startTime,
            invocationContext: invocationContext,
            span: span
        };

        span.setAttribute('cloud.provider', 'azure');
        span.setAttribute('faas.name', invocationContext.functionName);
        span.setAttribute('faas.version', invocationContext.functionVersion);
        span.setAttribute('faas.instance', invocationContext.invocationId);

        return trace;
    }

    private async recordSuccess(trace: any, result: any, invocationContext: AzureInvocationContext): Promise<void> {
        trace.span.setStatus({ code: 1 }); // OK status
        trace.endTime = new Date();
        trace.duration = trace.endTime.getTime() - trace.startTime.getTime();

        this.recordMetric({
            name: 'invocation_success',
            value: 1,
            unit: 'Count',
            timestamp: new Date(),
            dimensions: {
                function_name: invocationContext.functionName,
                region: CloudProviderDetector.getRegion()
            },
            cloudProvider: 'azure'
        });

        this.recordMetric({
            name: 'invocation_duration',
            value: trace.duration,
            unit: 'Milliseconds',
            timestamp: new Date(),
            dimensions: {
                function_name: invocationContext.functionName,
                region: CloudProviderDetector.getRegion()
            },
            cloudProvider: 'azure'
        });

        await this.sendTelemetry(TelemetrySerializer.serializeTrace(trace));
    }

    private async recordError(trace: any, error: Error, invocationContext: AzureInvocationContext): Promise<void> {
        trace.span.setStatus({ code: 2, message: error.message }); // ERROR status
        trace.span.recordException(error);
        trace.error = error;
        trace.endTime = new Date();
        trace.duration = trace.endTime.getTime() - trace.startTime.getTime();

        this.recordMetric({
            name: 'invocation_error',
            value: 1,
            unit: 'Count',
            timestamp: new Date(),
            dimensions: {
                function_name: invocationContext.functionName,
                region: CloudProviderDetector.getRegion(),
                error_type: error.constructor.name
            },
            cloudProvider: 'azure'
        });

        await this.sendTelemetry(TelemetrySerializer.serializeTrace(trace));
    }

    private endTrace(trace: any): void {
        trace.span.end();
    }

    public recordMetric(metric: CustomMetric): void {
        if (!this.config.sendMetrics) return;
        console.log(TelemetrySerializer.serializeMetric(metric));
    }

    private async sendTelemetry(data: string): Promise<void> {
        console.log('Sending telemetry:', data);
    }

    private initializeMetrics(): void {
        console.log('Azure metrics initialized');
    }
}
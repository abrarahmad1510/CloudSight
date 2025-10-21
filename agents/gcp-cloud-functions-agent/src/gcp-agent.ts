import { Tracer, metrics, trace } from '@opentelemetry/api';
import { 
    CloudSightConfig, 
    CustomMetric,
    CloudProviderDetector,
    TelemetrySerializer
} from '@cloudsight/shared';
import { GCPInvocationContext, GCPAgentConfig, GCPHttpRequest, GCPHttpResponse } from './gcp-types';

export class GCPCloudFunctionsAgent {
    private tracer: Tracer;
    private meter: any;
    private coldStart: boolean = true;
    private config: GCPAgentConfig;

    constructor(config: Partial<GCPAgentConfig> = {}) {
        this.config = {
            enabled: true,
            sendMetrics: true,
            captureTraces: true,
            logLevel: 'info',
            cloudProvider: 'gcp',
            ...config
        };

        this.tracer = trace.getTracer('cloudsight-gcp-agent');
        this.meter = metrics.getMeter('cloudsight-gcp-agent');
        this.initializeMetrics();
    }

    // HTTP function wrapper (for HTTP-triggered Cloud Functions)
    public wrapHttpFunction(
        handler: (req: GCPHttpRequest, res: GCPHttpResponse) => Promise<any> | void
    ): (req: GCPHttpRequest, res: GCPHttpResponse) => Promise<any> | void {
        return async (req: GCPHttpRequest, res: GCPHttpResponse): Promise<any> => {
            if (!this.config.enabled) {
                return handler(req, res);
            }

            const invocationContext = this.captureHttpInvocation(req, res);
            const trace = await this.startTrace(invocationContext);

            try {
                const result = await handler(req, res);
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

    // Background function wrapper (for PubSub, Storage, etc.)
    public wrapBackgroundFunction(
        handler: (event: any, context: any) => Promise<any> | void
    ): (event: any, context: any) => Promise<any> | void {
        return async (event: any, context: any): Promise<any> => {
            if (!this.config.enabled) {
                return handler(event, context);
            }

            const invocationContext = this.captureBackgroundInvocation(event, context);
            const trace = await this.startTrace(invocationContext);

            try {
                const result = await handler(event, context);
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

    // Unified handler wrapper (maintains backward compatibility)
    public wrapHandler(
        handler: (req: any, res: any) => Promise<any> | void
    ): (req: any, res: any) => Promise<any> | void {
        // Cast to compatible types for wrapHttpFunction
        const httpHandler = handler as (req: GCPHttpRequest, res: GCPHttpResponse) => Promise<any> | void;
        return this.wrapHttpFunction(httpHandler);
    }

    private captureHttpInvocation(req: GCPHttpRequest, res: GCPHttpResponse): GCPInvocationContext {
        const invocationContext: GCPInvocationContext = {
            functionName: process.env.FUNCTION_TARGET || 'unknown',
            functionVersion: process.env.K_REVISION || 'unknown',
            invokedFunctionArn: this.generateRequestId(),
            memoryLimitInMB: process.env.FUNCTION_MEMORY_MB || '256',
            remainingTimeInMillis: this.calculateRemainingTime(),
            coldStart: this.coldStart,
            startTime: new Date(),
            awsRequestId: this.generateRequestId(),
            cloudProvider: 'gcp',
            region: process.env.FUNCTION_REGION || 'unknown',
            projectId: process.env.GCP_PROJECT || 'unknown',
            runtime: process.env.FUNCTION_RUNTIME || 'nodejs',
            executionId: this.generateRequestId(),
            functionType: 'http'
        };

        if (this.coldStart) {
            this.recordMetric({
                name: 'cold_start',
                value: 1,
                unit: 'Count',
                timestamp: new Date(),
                dimensions: {
                    function_name: invocationContext.functionName,
                    region: invocationContext.region ?? 'unknown'
                },
                cloudProvider: 'gcp'
            });
            this.coldStart = false;
        }

        return invocationContext;
    }

    private captureBackgroundInvocation(event: any, context: any): GCPInvocationContext {
        const invocationContext: GCPInvocationContext = {
            functionName: process.env.FUNCTION_TARGET || 'unknown',
            functionVersion: process.env.K_REVISION || 'unknown',
            invokedFunctionArn: this.generateRequestId(),
            memoryLimitInMB: process.env.FUNCTION_MEMORY_MB || '256',
            remainingTimeInMillis: this.calculateRemainingTime(),
            coldStart: this.coldStart,
            startTime: new Date(),
            awsRequestId: this.generateRequestId(),
            cloudProvider: 'gcp',
            region: process.env.FUNCTION_REGION || 'unknown',
            projectId: process.env.GCP_PROJECT || 'unknown',
            runtime: process.env.FUNCTION_RUNTIME || 'nodejs',
            executionId: this.generateRequestId(),
            functionType: 'background',
            eventType: event?.name || 'unknown'
        };

        if (this.coldStart) {
            this.recordMetric({
                name: 'cold_start',
                value: 1,
                unit: 'Count',
                timestamp: new Date(),
                dimensions: {
                    function_name: invocationContext.functionName,
                    region: invocationContext.region ?? 'unknown'
                },
                cloudProvider: 'gcp'
            });
            this.coldStart = false;
        }

        return invocationContext;
    }

    // Keep the original captureInvocation for backward compatibility
    private captureInvocation(req: any, res: any): GCPInvocationContext {
        return this.captureHttpInvocation(req as GCPHttpRequest, res as GCPHttpResponse);
    }

    private calculateRemainingTime(): number {
        // GCP Cloud Functions have a max timeout of 9 minutes (540000 ms)
        return 540000;
    }

    private generateRequestId(): string {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    private async startTrace(invocationContext: GCPInvocationContext): Promise<any> {
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

        span.setAttribute('cloud.provider', 'gcp');
        span.setAttribute('faas.name', invocationContext.functionName);
        span.setAttribute('faas.version', invocationContext.functionVersion);
        span.setAttribute('faas.instance', invocationContext.awsRequestId);
        span.setAttribute('faas.trigger', invocationContext.functionType || 'http');

        return trace;
    }

    private async recordSuccess(trace: any, result: any, invocationContext: GCPInvocationContext): Promise<void> {
        trace.span.setStatus({ code: 1 });
        trace.endTime = new Date();
        trace.duration = trace.endTime.getTime() - trace.startTime.getTime();

        this.recordMetric({
            name: 'invocation_success',
            value: 1,
            unit: 'Count',
            timestamp: new Date(),
            dimensions: {
                function_name: invocationContext.functionName,
                region: invocationContext.region ?? 'unknown',
                function_type: invocationContext.functionType || 'http'
            },
            cloudProvider: 'gcp'
        });

        this.recordMetric({
            name: 'invocation_duration',
            value: trace.duration,
            unit: 'Milliseconds',
            timestamp: new Date(),
            dimensions: {
                function_name: invocationContext.functionName,
                region: invocationContext.region ?? 'unknown',
                function_type: invocationContext.functionType || 'http'
            },
            cloudProvider: 'gcp'
        });

        await this.sendTelemetry(TelemetrySerializer.serializeTrace(trace));
    }

    private async recordError(trace: any, error: Error, invocationContext: GCPInvocationContext): Promise<void> {
        trace.span.setStatus({ code: 2, message: error.message });
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
                region: invocationContext.region ?? 'unknown',
                error_type: error.constructor.name,
                function_type: invocationContext.functionType || 'http'
            },
            cloudProvider: 'gcp'
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
        console.log('GCP metrics initialized');
    }
}

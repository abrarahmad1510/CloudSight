"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureFunctionsAgent = void 0;
const api_1 = require("@opentelemetry/api");
const shared_1 = require("@cloudsight/shared");
class AzureFunctionsAgent {
    constructor(config = {}) {
        this.coldStart = true;
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
        this.tracer = api_1.trace.getTracer('cloudsight-azure-agent');
        this.meter = api_1.metrics.getMeter('cloudsight-azure-agent');
        this.initializeMetrics();
    }
    wrapHandler(handler) {
        return async (context, ...args) => {
            if (!this.config.enabled) {
                return handler(context, ...args);
            }
            const invocationContext = this.captureInvocation(context);
            const trace = await this.startTrace(invocationContext);
            try {
                const result = await handler(context, ...args);
                await this.recordSuccess(trace, result, invocationContext);
                return result;
            }
            catch (error) {
                await this.recordError(trace, error, invocationContext);
                throw error;
            }
            finally {
                this.endTrace(trace);
            }
        };
    }
    captureInvocation(context) {
        const invocationContext = {
            functionName: context.functionName,
            functionVersion: context.invocationId,
            invokedFunctionArn: context.invocationId,
            memoryLimitInMB: process.env.WEBSITE_MEMORY_LIMIT_MB || '1536',
            remainingTimeInMillis: this.calculateRemainingTime(context),
            coldStart: this.coldStart,
            startTime: new Date(),
            awsRequestId: context.invocationId,
            cloudProvider: 'azure',
            functionDirectory: '',
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
                    region: shared_1.CloudProviderDetector.getRegion()
                },
                cloudProvider: 'azure'
            });
            this.coldStart = false;
        }
        return invocationContext;
    }
    calculateRemainingTime(context) {
        // Azure Functions v4+ doesn't have built-in timeout tracking
        // Default to 5 minutes (300000 ms) which is common for Azure Functions
        return 300000;
    }
    async startTrace(invocationContext) {
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
    async recordSuccess(trace, result, invocationContext) {
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
                region: shared_1.CloudProviderDetector.getRegion()
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
                region: shared_1.CloudProviderDetector.getRegion()
            },
            cloudProvider: 'azure'
        });
        await this.sendTelemetry(shared_1.TelemetrySerializer.serializeTrace(trace));
    }
    async recordError(trace, error, invocationContext) {
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
                region: shared_1.CloudProviderDetector.getRegion(),
                error_type: error.constructor.name
            },
            cloudProvider: 'azure'
        });
        await this.sendTelemetry(shared_1.TelemetrySerializer.serializeTrace(trace));
    }
    endTrace(trace) {
        trace.span.end();
    }
    recordMetric(metric) {
        if (!this.config.sendMetrics)
            return;
        console.log(shared_1.TelemetrySerializer.serializeMetric(metric));
    }
    async sendTelemetry(data) {
        console.log('Sending telemetry:', data);
    }
    initializeMetrics() {
        console.log('Azure metrics initialized');
    }
}
exports.AzureFunctionsAgent = AzureFunctionsAgent;
//# sourceMappingURL=azure-agent.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GCPCloudFunctionsAgent = void 0;
const api_1 = require("@opentelemetry/api");
const shared_1 = require("@cloudsight/shared");
class GCPCloudFunctionsAgent {
    constructor(config = {}) {
        this.coldStart = true;
        this.config = {
            enabled: true,
            sendMetrics: true,
            captureTraces: true,
            logLevel: 'info',
            cloudProvider: 'gcp',
            ...config
        };
        this.tracer = api_1.trace.getTracer('cloudsight-gcp-agent');
        this.meter = api_1.metrics.getMeter('cloudsight-gcp-agent');
        this.initializeMetrics();
    }
    // HTTP function wrapper (for HTTP-triggered Cloud Functions)
    wrapHttpFunction(handler) {
        return async (req, res) => {
            if (!this.config.enabled) {
                return handler(req, res);
            }
            const invocationContext = this.captureHttpInvocation(req, res);
            const trace = await this.startTrace(invocationContext);
            try {
                const result = await handler(req, res);
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
    // Background function wrapper (for PubSub, Storage, etc.)
    wrapBackgroundFunction(handler) {
        return async (event, context) => {
            if (!this.config.enabled) {
                return handler(event, context);
            }
            const invocationContext = this.captureBackgroundInvocation(event, context);
            const trace = await this.startTrace(invocationContext);
            try {
                const result = await handler(event, context);
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
    // Unified handler wrapper (maintains backward compatibility)
    wrapHandler(handler) {
        // Cast to compatible types for wrapHttpFunction
        const httpHandler = handler;
        return this.wrapHttpFunction(httpHandler);
    }
    captureHttpInvocation(req, res) {
        const invocationContext = {
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
    captureBackgroundInvocation(event, context) {
        const invocationContext = {
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
    captureInvocation(req, res) {
        return this.captureHttpInvocation(req, res);
    }
    calculateRemainingTime() {
        // GCP Cloud Functions have a max timeout of 9 minutes (540000 ms)
        return 540000;
    }
    generateRequestId() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
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
        span.setAttribute('cloud.provider', 'gcp');
        span.setAttribute('faas.name', invocationContext.functionName);
        span.setAttribute('faas.version', invocationContext.functionVersion);
        span.setAttribute('faas.instance', invocationContext.awsRequestId);
        span.setAttribute('faas.trigger', invocationContext.functionType || 'http');
        return trace;
    }
    async recordSuccess(trace, result, invocationContext) {
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
        await this.sendTelemetry(shared_1.TelemetrySerializer.serializeTrace(trace));
    }
    async recordError(trace, error, invocationContext) {
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
        console.log('GCP metrics initialized');
    }
}
exports.GCPCloudFunctionsAgent = GCPCloudFunctionsAgent;

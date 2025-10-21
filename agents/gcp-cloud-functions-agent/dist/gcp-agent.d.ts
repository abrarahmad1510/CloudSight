import { CustomMetric } from '@cloudsight/shared';
import { GCPAgentConfig, GCPHttpRequest, GCPHttpResponse } from './gcp-types';
export declare class GCPCloudFunctionsAgent {
    private tracer;
    private meter;
    private coldStart;
    private config;
    constructor(config?: Partial<GCPAgentConfig>);
    wrapHttpFunction(handler: (req: GCPHttpRequest, res: GCPHttpResponse) => Promise<any> | void): (req: GCPHttpRequest, res: GCPHttpResponse) => Promise<any> | void;
    wrapBackgroundFunction(handler: (event: any, context: any) => Promise<any> | void): (event: any, context: any) => Promise<any> | void;
    wrapHandler(handler: (req: any, res: any) => Promise<any> | void): (req: any, res: any) => Promise<any> | void;
    private captureHttpInvocation;
    private captureBackgroundInvocation;
    private captureInvocation;
    private calculateRemainingTime;
    private generateRequestId;
    private startTrace;
    private recordSuccess;
    private recordError;
    private endTrace;
    recordMetric(metric: CustomMetric): void;
    private sendTelemetry;
    private initializeMetrics;
}

import { InvocationContext } from '@azure/functions';
import { CustomMetric } from '@cloudsight/shared';
import { AzureAgentConfig } from './azure-types';
export declare class AzureFunctionsAgent {
    private tracer;
    private meter;
    private coldStart;
    private config;
    constructor(config?: Partial<AzureAgentConfig>);
    wrapHandler<T>(handler: (context: InvocationContext, ...args: any[]) => Promise<T> | T): (context: InvocationContext, ...args: any[]) => Promise<T> | T;
    private captureInvocation;
    private calculateRemainingTime;
    private startTrace;
    private recordSuccess;
    private recordError;
    private endTrace;
    recordMetric(metric: CustomMetric): void;
    private sendTelemetry;
    private initializeMetrics;
}
//# sourceMappingURL=azure-agent.d.ts.map
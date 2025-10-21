import { InvocationContext } from '@azure/functions';
import { CloudSightConfig } from '@cloudsight/shared';
export interface AzureAgentConfig extends CloudSightConfig {
    captureHttpRequests?: boolean;
    trackStorageOperations?: boolean;
}
export interface AzureInvocationContext {
    functionName: string;
    functionVersion: string;
    invokedFunctionArn: string;
    memoryLimitInMB: string;
    remainingTimeInMillis: number;
    coldStart: boolean;
    startTime: Date;
    awsRequestId: string;
    cloudProvider: 'azure';
    functionDirectory: string;
    invocationId: string;
    log: InvocationContext;
    executionContext: {
        functionName: string;
        functionDirectory: string;
        invocationId: string;
    };
}
export interface AzureContext extends InvocationContext {
    executionContext?: {
        functionName: string;
        functionDirectory: string;
        invocationId: string;
    };
}
//# sourceMappingURL=azure-types.d.ts.map
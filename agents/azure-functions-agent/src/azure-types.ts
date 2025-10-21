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
    log: InvocationContext; // Using InvocationContext directly for logging
    executionContext: {
        functionName: string;
        functionDirectory: string;
        invocationId: string;
    };
}

// Azure Functions v4+ specific context properties
export interface AzureContext extends InvocationContext {
    // In v4+, InvocationContext already has:
    // - invocationId: string
    // - functionName: string  
    // - log: Logger
    // - triggerMetadata: any
    // - options: InvocationContextOptions
    // We extend it if needed for additional properties
    executionContext?: {
        functionName: string;
        functionDirectory: string;
        invocationId: string;
    };
}
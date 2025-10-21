import { InvocationContext, CloudSightConfig } from '@cloudsight/shared';

export interface GCPInvocationContext extends InvocationContext {
    projectId: string;
    runtime: string;
    executionId: string;
    functionType?: 'http' | 'background';
    eventType?: string;
}

export interface GCPAgentConfig extends CloudSightConfig {
    captureHttpRequests?: boolean;
    trackPubSubMessages?: boolean;
    trackStorageOperations?: boolean;
}

export interface GCPColdStartEvent {
    platform: 'gcp';
    initializationDuration: number;
    functionLoadTime: number;
    runtime: string;
}

// GCP HTTP Request/Response interfaces
export interface GCPHttpRequest {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: any;
}

export interface GCPHttpResponse {
    statusCode: number;
    headers: Record<string, string>;
    body?: any;
    setHeader?: (name: string, value: string) => void;
    write?: (chunk: any) => void;
    end?: () => void;
}

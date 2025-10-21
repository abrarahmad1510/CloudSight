export interface CloudSightConfig {
    enabled: boolean;
    sendMetrics: boolean;
    captureTraces: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    customDimensions?: Record<string, string>;
    cloudProvider?: 'aws' | 'azure' | 'gcp';
}

export interface InvocationContext {
    functionName: string;
    functionVersion: string;
    invokedFunctionArn: string;
    memoryLimitInMB: string;
    remainingTimeInMillis: number;
    coldStart: boolean;
    startTime: Date;
    awsRequestId: string;
    cloudProvider: 'aws' | 'azure' | 'gcp';
    region?: string;
}

export interface Trace {
    traceId: string;
    spanId: string;
    parentTraceId?: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    invocationContext: InvocationContext;
    error?: Error;
    tags?: Record<string, string>;
}

export interface CustomMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: Date;
    dimensions: Record<string, string>;
    cloudProvider: 'aws' | 'azure' | 'gcp';
}

export interface ServiceDependency {
    sourceService: string;
    targetService: string;
    callCount: number;
    errorCount: number;
    avgLatency: number;
    cloudProvider: string;
    timestamp: Date;
}

export interface CrossCloudQuery {
    select: string[];
    from: 'metrics' | 'traces' | 'dependencies';
    where?: QueryCondition[];
    groupBy?: string[];
    orderBy?: string[];
    limit?: number;
    timeRange: TimeRange;
}

export interface QueryCondition {
    field: string;
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=';
    value: any;
}

export enum TimeRange {
    ONE_HOUR = 'ONE_HOUR',
    SIX_HOURS = 'SIX_HOURS',
    ONE_DAY = 'ONE_DAY',
    ONE_WEEK = 'ONE_WEEK',
    ONE_MONTH = 'ONE_MONTH'
}

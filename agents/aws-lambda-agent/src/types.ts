export interface CloudSightConfig {
    enabled?: boolean;
    sendMetrics?: boolean;
    logLevel?: string;
    customDimensions?: Record<string, any>;
}
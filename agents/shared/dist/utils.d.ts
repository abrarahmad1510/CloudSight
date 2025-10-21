import { CustomMetric, Trace } from './types';
export declare class CloudProviderDetector {
    static detectPlatform(): 'aws' | 'azure' | 'gcp';
    static getRegion(): string;
}
export declare class TelemetrySerializer {
    static serializeMetric(metric: CustomMetric): string;
    static serializeTrace(trace: Trace): string;
}

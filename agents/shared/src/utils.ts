import { CustomMetric, Trace } from './types';

export class CloudProviderDetector {
    static detectPlatform(): 'aws' | 'azure' | 'gcp' {
        if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
            return 'aws';
        }
        if (process.env.WEBSITE_SITE_NAME) {
            return 'azure';
        }
        if (process.env.K_SERVICE || process.env.FUNCTION_NAME) {
            return 'gcp';
        }
        throw new Error('Could not auto-detect cloud platform. Please set cloudProvider in config.');
    }

    static getRegion(): string {
        switch (this.detectPlatform()) {
            case 'aws':
                return process.env.AWS_REGION || 'unknown';
            case 'azure':
                return process.env.REGION_NAME || 'unknown';
            case 'gcp':
                return process.env.FUNCTION_REGION || 'unknown';
            default:
                return 'unknown';
        }
    }
}

export class TelemetrySerializer {
    static serializeMetric(metric: CustomMetric): string {
        return JSON.stringify({
            ...metric,
            _cloudsight: 'metric',
            _timestamp: metric.timestamp.toISOString(),
            _cloudProvider: metric.cloudProvider
        });
    }

    static serializeTrace(trace: Trace): string {
        return JSON.stringify({
            ...trace,
            _cloudsight: 'trace',
            _timestamp: trace.startTime.toISOString(),
            _cloudProvider: trace.invocationContext.cloudProvider
        });
    }
}

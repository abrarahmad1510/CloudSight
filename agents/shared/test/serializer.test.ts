import { TelemetrySerializer } from '../src/utils';
import { CustomMetric, Trace, InvocationContext } from '../src/types';

describe('TelemetrySerializer', () => {
    test('should serialize metric correctly', () => {
        const metric: CustomMetric = {
            name: 'test_metric',
            value: 42,
            unit: 'Count',
            timestamp: new Date('2023-01-01T00:00:00Z'),
            dimensions: { key: 'value' },
            cloudProvider: 'aws'
        };

        const result = TelemetrySerializer.serializeMetric(metric);
        const parsed = JSON.parse(result);

        expect(parsed.name).toBe('test_metric');
        expect(parsed.value).toBe(42);
        expect(parsed._cloudsight).toBe('metric');
        expect(parsed._cloudProvider).toBe('aws');
    });

    test('should serialize trace correctly', () => {
        const invocationContext: InvocationContext = {
            functionName: 'test-function',
            functionVersion: 'v1',
            invokedFunctionArn: 'arn:test',
            memoryLimitInMB: '128',
            remainingTimeInMillis: 5000,
            coldStart: false,
            startTime: new Date('2023-01-01T00:00:00Z'),
            awsRequestId: 'test-request-id',
            cloudProvider: 'aws',
            region: 'us-east-1'
        };

        const trace: Trace = {
            traceId: 'trace-123',
            spanId: 'span-456',
            startTime: new Date('2023-01-01T00:00:00Z'),
            invocationContext: invocationContext
        };

        const result = TelemetrySerializer.serializeTrace(trace);
        const parsed = JSON.parse(result);

        expect(parsed.traceId).toBe('trace-123');
        expect(parsed._cloudsight).toBe('trace');
        expect(parsed._cloudProvider).toBe('aws');
    });
});

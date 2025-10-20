import { TelemetryProcessor } from '../src/processor';
import { KinesisStreamEvent, Context } from 'aws-lambda';
import { ProcessingError } from '../src/utils/errorHandler';

// Industry-standard mock factory pattern
class MockClickHouseClient {
  public initialize = jest.fn();
  public insertMetrics = jest.fn();
  public healthCheck = jest.fn();
  public close = jest.fn();
}

class MockElasticsearchClient {
  public initialize = jest.fn();
  public bulkIndexTraces = jest.fn();
  public healthCheck = jest.fn();
  public close = jest.fn();
}

// Enterprise-level mock setup with dependency injection awareness
const createMockClients = () => {
  const mockClickHouse = new MockClickHouseClient();
  const mockElasticsearch = new MockElasticsearchClient();
  
  // Default successful behaviors
  mockClickHouse.initialize.mockResolvedValue(undefined);
  mockClickHouse.insertMetrics.mockResolvedValue(undefined);
  mockClickHouse.healthCheck.mockResolvedValue(true);
  mockClickHouse.close.mockResolvedValue(undefined);
  
  mockElasticsearch.initialize.mockResolvedValue(undefined);
  mockElasticsearch.bulkIndexTraces.mockResolvedValue(undefined);
  mockElasticsearch.healthCheck.mockResolvedValue(true);
  mockElasticsearch.close.mockResolvedValue(undefined);
  
  return { mockClickHouse, mockElasticsearch };
};

// Mock the actual implementations
jest.mock('../src/clients/clickhouse', () => ({
  ClickHouseClient: jest.fn().mockImplementation(() => createMockClients().mockClickHouse),
}));

jest.mock('../src/clients/elasticsearch', () => ({
  ElasticsearchClient: jest.fn().mockImplementation(() => createMockClients().mockElasticsearch),
}));

import { ClickHouseClient } from '../src/clients/clickhouse';
import { ElasticsearchClient } from '../src/clients/elasticsearch';

// Enterprise-grade test data factory
const createKinesisRecord = (data: any) => ({
  kinesis: {
    data: Buffer.from(JSON.stringify(data)).toString('base64'),
    approximateArrivalTimestamp: Date.now(),
    partitionKey: `partition-${Math.random().toString(36).substr(2, 9)}`,
    sequenceNumber: `seq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    kinesisSchemaVersion: '1.0'
  },
  eventID: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  eventSource: 'aws:kinesis',
  eventVersion: '1.0',
  eventName: 'aws:kinesis:record',
  eventSourceARN: 'arn:aws:kinesis:us-east-1:123456789012:stream/cloudsight-telemetry',
  awsRegion: 'us-east-1',
  invokeIdentityArn: 'arn:aws:iam::123456789012:role/CloudSightLambdaRole'
});

const createValidMetricRecord = () => createKinesisRecord({
  name: 'function_invocation',
  value: 1,
  unit: 'Count',
  timestamp: new Date().toISOString(),
  dimensions: {
    function_name: 'payment-processor',
    region: 'us-east-1',
    status: 'success',
    environment: 'production',
    version: '1.2.3'
  },
  _cloudsight: 'metric'
});

const createValidTraceRecord = () => createKinesisRecord({
  traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  spanId: `span-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  startTime: new Date().toISOString(),
  duration: 150.5,
  invocationContext: {
    functionName: 'payment-processor',
    awsRequestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    coldStart: false,
    memoryLimitInMB: '512'
  },
  _cloudsight: 'trace'
});

const createLambdaContext = (overrides: Partial<Context> = {}): Context => ({
  functionName: 'cloudsight-telemetry-processor',
  functionVersion: '$LATEST',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:cloudsight-telemetry-processor',
  memoryLimitInMB: '1024',
  getRemainingTimeInMillis: () => 30000,
  callbackWaitsForEmptyEventLoop: false,
  awsRequestId: `aws-req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  logGroupName: '/aws/lambda/cloudsight-telemetry-processor',
  logStreamName: `2023/01/01/[\$LATEST]${Math.random().toString(36).substr(2, 9)}`,
  done: (error?: Error, result?: any) => {},
  fail: (error: Error | string) => {},
  succeed: (messageOrObject: any) => {},
  ...overrides
});

describe('TelemetryProcessor - Enterprise Test Suite', () => {
  let processor: TelemetryProcessor;
  let mockContext: Context;
  let mockClickHouse: MockClickHouseClient;
  let mockElasticsearch: MockElasticsearchClient;

  beforeEach(() => {
    // Reset all mocks and create fresh instances
    jest.clearAllMocks();
    
    const mocks = createMockClients();
    mockClickHouse = mocks.mockClickHouse;
    mockElasticsearch = mocks.mockElasticsearch;
    
    // Reset the mock implementations to use our fresh mocks
    (ClickHouseClient as jest.Mock).mockImplementation(() => mockClickHouse);
    (ElasticsearchClient as jest.Mock).mockImplementation(() => mockElasticsearch);
    
    // Create processor with fewer retries for faster, more predictable tests
    processor = new TelemetryProcessor({ maxRetries: 2 });
    mockContext = createLambdaContext();
  });

  afterEach(async () => {
    await processor.close();
  });

  describe('Batch Processing Scenarios', () => {
    test('should process mixed telemetry records successfully', async () => {
      const event: KinesisStreamEvent = {
        Records: [
          createValidMetricRecord(),
          createValidTraceRecord(),
          createValidMetricRecord()
        ]
      };

      const result = await processor.processBatch(event, mockContext);

      expect(result.successfulRecords).toBe(3);
      expect(result.failedRecords).toBe(0);
      expect(result.processingErrors).toHaveLength(0);
      expect(mockClickHouse.insertMetrics).toHaveBeenCalledTimes(1);
      expect(mockElasticsearch.bulkIndexTraces).toHaveBeenCalledTimes(1);
    });

    test('should handle partial batch failures gracefully', async () => {
      const invalidRecord = createKinesisRecord({
        // Missing required fields
        _cloudsight: 'metric'
      });

      const event: KinesisStreamEvent = {
        Records: [
          createValidMetricRecord(),
          invalidRecord,
          createValidTraceRecord()
        ]
      };

      const result = await processor.processBatch(event, mockContext);

      expect(result.successfulRecords).toBe(2);
      expect(result.failedRecords).toBe(1);
      expect(result.processingErrors).toHaveLength(1);
      expect(result.processingErrors[0]).toHaveProperty('recordId');
      expect(result.processingErrors[0]).toHaveProperty('error');
    });

    test('should handle empty batch efficiently', async () => {
      const event: KinesisStreamEvent = { Records: [] };

      const result = await processor.processBatch(event, mockContext);

      expect(result.successfulRecords).toBe(0);
      expect(result.failedRecords).toBe(0);
      expect(result.processingErrors).toHaveLength(0);
      expect(mockClickHouse.insertMetrics).not.toHaveBeenCalled();
      expect(mockElasticsearch.bulkIndexTraces).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling Scenarios', () => {
    test('should handle ClickHouse insertion failures with retry logic', async () => {
      const insertError = new Error('Database connection timeout');
      mockClickHouse.insertMetrics
        .mockRejectedValueOnce(insertError) // First attempt fails
        .mockRejectedValueOnce(insertError) // Second attempt fails  
        .mockResolvedValueOnce(undefined);  // Third attempt succeeds

      const event: KinesisStreamEvent = {
        Records: [createValidMetricRecord(), createValidMetricRecord()]
      };

      const result = await processor.processBatch(event, mockContext);

      expect(result.successfulRecords).toBe(2);
      expect(result.failedRecords).toBe(0);
      expect(mockClickHouse.insertMetrics).toHaveBeenCalledTimes(3); // Retry logic invoked
    });

    test('should handle Elasticsearch bulk indexing failures', async () => {
      const bulkError = new Error('Elasticsearch cluster unavailable');
      mockElasticsearch.bulkIndexTraces
        .mockRejectedValueOnce(bulkError) // First attempt
        .mockRejectedValueOnce(bulkError) // Second attempt
        .mockRejectedValueOnce(bulkError); // Third attempt - final failure

      const event: KinesisStreamEvent = {
        Records: [createValidTraceRecord(), createValidTraceRecord()]
      };

      const result = await processor.processBatch(event, mockContext);

      expect(result.failedRecords).toBe(2); // Both trace records should fail
      expect(result.processingErrors).toHaveLength(2);
      expect(mockElasticsearch.bulkIndexTraces).toHaveBeenCalledTimes(3); // Verify retry attempts
    });

    test('should handle database initialization failures', async () => {
      const initError = new Error('Database connection refused');
      mockClickHouse.initialize.mockRejectedValueOnce(initError);

      const event: KinesisStreamEvent = {
        Records: [createValidMetricRecord()]
      };

      const result = await processor.processBatch(event, mockContext);

      expect(result.failedRecords).toBe(1);
      expect(result.successfulRecords).toBe(0);
    });

    test('should handle timeout scenarios with insufficient remaining time', async () => {
      const shortLivedContext = createLambdaContext({
        getRemainingTimeInMillis: () => 5000 // Only 5 seconds remaining
      });

      const event: KinesisStreamEvent = {
        Records: Array.from({ length: 1000 }, () => createValidMetricRecord()) // Large batch
      };

      const result = await processor.processBatch(event, shortLivedContext);

      // Should handle timeout gracefully - may have partial processing
      expect(result.processingErrors.length).toBeGreaterThan(0);
      expect(result.processingErrors[0].error).toContain('time');
    });
  });

  describe('Performance and Scaling', () => {
    test('should process large batches efficiently', async () => {
      const largeBatch = Array.from({ length: 500 }, () => 
        Math.random() > 0.5 ? createValidMetricRecord() : createValidTraceRecord()
      );

      const event: KinesisStreamEvent = { Records: largeBatch };

      const startTime = Date.now();
      const result = await processor.processBatch(event, mockContext);
      const processingTime = Date.now() - startTime;

      expect(result.successfulRecords + result.failedRecords).toBe(500);
      expect(processingTime).toBeLessThan(10000); // Should complete within 10 seconds
      expect(mockClickHouse.insertMetrics).toHaveBeenCalledWith(expect.any(Array));
      expect(mockElasticsearch.bulkIndexTraces).toHaveBeenCalledWith(expect.any(Array));
    });

    test('should handle concurrent processing correctly', async () => {
      const events = Array.from({ length: 5 }, () => ({
        Records: [createValidMetricRecord(), createValidTraceRecord()]
      }));

      // Process multiple batches concurrently
      const results = await Promise.all(
        events.map(event => processor.processBatch(event, mockContext))
      );

      results.forEach(result => {
        expect(result.successfulRecords).toBe(2);
        expect(result.failedRecords).toBe(0);
      });
    });
  });

  describe('Health Monitoring', () => {
    test('should return healthy status when all dependencies are operational', async () => {
      const health = await processor.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.dependencies.clickhouse).toBe(true);
      expect(health.dependencies.elasticsearch).toBe(true);
      expect(health.metrics).toHaveProperty('recordsProcessed');
    });

    test('should return degraded status when one dependency is failing', async () => {
      mockClickHouse.healthCheck.mockResolvedValueOnce(false);

      const health = await processor.healthCheck();

      expect(health.status).toBe('degraded');
      expect(health.dependencies.clickhouse).toBe(false);
      expect(health.dependencies.elasticsearch).toBe(true);
    });

    test('should return unhealthy status when all dependencies are failing', async () => {
      mockClickHouse.healthCheck.mockResolvedValueOnce(false);
      mockElasticsearch.healthCheck.mockResolvedValueOnce(false);

      const health = await processor.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.dependencies.clickhouse).toBe(false);
      expect(health.dependencies.elasticsearch).toBe(false);
    });
  });

  describe('Edge Cases and Resilience', () => {
    test('should handle malformed Kinesis records', async () => {
      const malformedRecord = {
        kinesis: {
          data: 'invalid-json-data', // This will fail JSON validation, not base64
          approximateArrivalTimestamp: Date.now(),
          partitionKey: 'test',
          sequenceNumber: '1',
          kinesisSchemaVersion: '1.0'
        },
        eventID: '1',
        eventSource: 'aws:kinesis',
        eventVersion: '1.0',
        eventName: 'aws:kinesis:record',
        eventSourceARN: 'arn:aws:kinesis:us-east-1:123456789012:stream/test',
        awsRegion: 'us-east-1',
        invokeIdentityArn: 'arn:aws:iam:123456789012:role/lambda-role'
      };

      const event: KinesisStreamEvent = {
        Records: [malformedRecord, createValidMetricRecord()]
      };

      const result = await processor.processBatch(event, mockContext);

      expect(result.successfulRecords).toBe(1);
      expect(result.failedRecords).toBe(1);
      // Expect JSON validation error, not base64
      expect(result.processingErrors[0].error).toContain('Invalid JSON payload');
    });

    test('should handle records with unknown telemetry types', async () => {
      const unknownTypeRecord = createKinesisRecord({
        _cloudsight: 'unknown_type', // Not 'metric' or 'trace'
        someField: 'someValue'
      });

      const event: KinesisStreamEvent = {
        Records: [unknownTypeRecord, createValidMetricRecord()]
      };

      const result = await processor.processBatch(event, mockContext);

      expect(result.successfulRecords).toBe(1);
      expect(result.failedRecords).toBe(1);
      expect(result.processingErrors[0].error).toContain('Unknown telemetry type');
    });

    test('should maintain data consistency during partial failures', async () => {
      // Simulate a scenario where ClickHouse succeeds but Elasticsearch fails after ALL retries
      const indexingError = new Error('Indexing failed');
      mockElasticsearch.bulkIndexTraces
        .mockRejectedValueOnce(indexingError)  // First attempt
        .mockRejectedValueOnce(indexingError)  // Second attempt
        .mockRejectedValueOnce(indexingError); // Third attempt - final failure

      const event: KinesisStreamEvent = {
        Records: [createValidMetricRecord(), createValidTraceRecord()]
      };

      const result = await processor.processBatch(event, mockContext);

      // Metric should succeed, trace should fail after all retries
      expect(result.successfulRecords).toBe(1);
      expect(result.failedRecords).toBe(1);
      expect(mockClickHouse.insertMetrics).toHaveBeenCalled(); // Metrics still processed
      expect(mockElasticsearch.bulkIndexTraces).toHaveBeenCalledTimes(3); // All retry attempts made
    });
  });
});
// ingestion/telemetry-processor/test/clients/elasticsearch.test.ts
import { ElasticsearchClient } from '../../src/clients/elasticsearch';

// Mock the actual elasticsearch module
jest.mock('@elastic/elasticsearch', () => {
  const mockClient = {
    indices: {
      exists: jest.fn().mockResolvedValue(false),
      create: jest.fn().mockResolvedValue(undefined),
    },
    index: jest.fn().mockResolvedValue({ _id: 'test-id' }),
    bulk: jest.fn().mockResolvedValue({ errors: false, items: [] }),
    cluster: {
      health: jest.fn().mockResolvedValue({ status: 'green' }),
    },
    close: jest.fn().mockResolvedValue(undefined),
  };
  
  return {
    Client: jest.fn(() => mockClient),
  };
});

const mockConfig = {
  node: 'http://localhost:9200',
  username: 'test',
  password: 'test',
  maxRetries: 3,
  requestTimeout: 30000
};

describe('ElasticsearchClient', () => {
  let client: ElasticsearchClient;

  beforeEach(() => {
    client = new ElasticsearchClient(mockConfig);
  });

  afterEach(async () => {
    await client.close();
    jest.clearAllMocks();
  });

  test('should handle bulk index errors', async () => {
    await client.initialize();
    
    // Get the mock client instance - FIX: Use mock.results[0].value
    const { Client } = require('@elastic/elasticsearch');
    const mockClientInstance = Client.mock.results[0].value;
    mockClientInstance.bulk.mockRejectedValueOnce(new Error('Bulk operation failed'));

    const traces = [{
      traceId: 'trace-1',
      spanId: 'span-1',
      startTime: new Date().toISOString(),
      invocationContext: {
        functionName: 'test-function',
        coldStart: false,
        awsRequestId: 'test-request-1',
        memoryLimitInMB: '128'
      },
      _cloudsight: 'trace' as const,
    }];

    await expect(client.bulkIndexTraces(traces)).rejects.toThrow('Bulk operation failed');
  });

  test('should handle index errors', async () => {
    await client.initialize();

    // Get the mock client instance - FIX: Use mock.results[0].value
    const { Client } = require('@elastic/elasticsearch');
    const mockClientInstance = Client.mock.results[0].value;
    mockClientInstance.index.mockRejectedValueOnce(new Error('Index failed'));

    const trace = {
      traceId: 'trace-123',
      spanId: 'span-456',
      startTime: new Date().toISOString(),
      invocationContext: {
        functionName: 'test-function',
        coldStart: false,
        awsRequestId: 'test-request-id',
        memoryLimitInMB: '128'
      },
      _cloudsight: 'trace' as const,
    };

    await expect(client.indexTrace(trace)).rejects.toThrow('Index failed');
  });

  test('should handle health check failures', async () => {
    await client.initialize();

    // Get the mock client instance - FIX: Use mock.results[0].value
    const { Client } = require('@elastic/elasticsearch');
    const mockClientInstance = Client.mock.results[0].value;
    mockClientInstance.cluster.health.mockRejectedValueOnce(new Error('Health check failed'));

    const health = await client.healthCheck();
    expect(health).toBe(false);
  });
});
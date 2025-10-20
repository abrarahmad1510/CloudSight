// ingestion/telemetry-processor/test/clients/clickhouse.test.ts
import { ClickHouseClient } from '../../src/clients/clickhouse';

// Mock the actual clickhouse client module
jest.mock('@clickhouse/client', () => {
  const mockClient = {
    exec: jest.fn().mockResolvedValue(undefined),
    insert: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue([{ health: 1 }])
    }),
    close: jest.fn().mockResolvedValue(undefined),
  };
  
  return {
    createClient: jest.fn(() => mockClient),
  };
});

const mockConfig = {
  url: 'http://localhost:8123',
  username: 'test',
  password: 'test',
  database: 'test',
  maxRetries: 3,
  requestTimeout: 30000
};

describe('ClickHouseClient', () => {
  let client: ClickHouseClient;

  beforeEach(() => {
    client = new ClickHouseClient(mockConfig);
  });

  afterEach(async () => {
    await client.close();
    jest.clearAllMocks();
  });

  test('should handle insert errors', async () => {
    await client.initialize();

    // Get the mock client instance - FIX: Use mock.results[0].value
    const { createClient } = require('@clickhouse/client');
    const mockClientInstance = createClient.mock.results[0].value;
    mockClientInstance.insert.mockRejectedValueOnce(new Error('Insert failed'));

    const metrics = [{
      name: 'test_metric',
      value: 1,
      unit: 'Count',
      timestamp: new Date(),
      function_name: 'test-function',
      region: 'us-east-1'
    }];

    await expect(client.insertMetrics(metrics)).rejects.toThrow('Insert failed');
  });

  test('should handle health check failures', async () => {
    await client.initialize();

    // Get the mock client instance - FIX: Use mock.results[0].value
    const { createClient } = require('@clickhouse/client');
    const mockClientInstance = createClient.mock.results[0].value;
    mockClientInstance.query.mockRejectedValueOnce(new Error('Health check failed'));

    const health = await client.healthCheck();
    expect(health).toBe(false);
  });
});
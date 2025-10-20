import { getConfig } from '../src/config';

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('should return config object', () => {
    const config = getConfig();

    expect(config).toHaveProperty('clickhouse');
    expect(config).toHaveProperty('elasticsearch');
  });

  test('should use environment variables for ClickHouse URL', () => {
    process.env.CLICKHOUSE_URL = 'http://test:8123';
    process.env.CLICKHOUSE_USERNAME = 'user';
    process.env.CLICKHOUSE_PASSWORD = 'pass';
    process.env.CLICKHOUSE_DATABASE = 'db';

    const config = getConfig();

    expect(config.clickhouse.url).toBe('http://test:8123');
    expect(config.clickhouse.username).toBe('user');
    expect(config.clickhouse.password).toBe('pass');
    expect(config.clickhouse.database).toBe('db');
  });

  test('should use environment variables for Elasticsearch node', () => {
    process.env.ELASTICSEARCH_NODE = 'http://test:9200';
    process.env.ELASTICSEARCH_USERNAME = 'user';
    process.env.ELASTICSEARCH_PASSWORD = 'pass';

    const config = getConfig();

    expect(config.elasticsearch.node).toBe('http://test:9200');
    expect(config.elasticsearch.username).toBe('user');
    expect(config.elasticsearch.password).toBe('pass');
  });
});
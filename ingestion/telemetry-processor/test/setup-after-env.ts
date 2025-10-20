import { jest } from '@jest/globals';

// Set test environment variables
process.env.CLICKHOUSE_URL = 'http://localhost:8123';
process.env.ELASTICSEARCH_NODE = 'http://localhost:9200';
process.env.CLICKHOUSE_USERNAME = 'test';
process.env.CLICKHOUSE_PASSWORD = 'test';
process.env.ELASTICSEARCH_USERNAME = 'test';
process.env.ELASTICSEARCH_PASSWORD = 'test';

// Global mocks to prevent real database connections
jest.mock('@clickhouse/client');
jest.mock('@elastic/elasticsearch');
// Mock implementation for Elasticsearch client testing
export const ElasticsearchClient = jest.fn().mockImplementation(() => ({
  initialize: jest.fn().mockResolvedValue(undefined),
  indexTrace: jest.fn().mockResolvedValue(undefined),
  bulkIndexTraces: jest.fn().mockResolvedValue(undefined),
  healthCheck: jest.fn().mockResolvedValue(true),
  close: jest.fn().mockResolvedValue(undefined),
}));

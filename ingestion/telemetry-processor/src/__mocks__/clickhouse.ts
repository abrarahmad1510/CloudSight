// Mock implementation for ClickHouse client testing
export const ClickHouseClient = jest.fn().mockImplementation(() => ({
  initialize: jest.fn().mockResolvedValue(undefined),
  insertMetrics: jest.fn().mockResolvedValue(undefined),
  healthCheck: jest.fn().mockResolvedValue(true),
  close: jest.fn().mockResolvedValue(undefined),
}));

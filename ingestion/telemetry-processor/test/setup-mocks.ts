// ingestion/telemetry-processor/test/setup-mocks.ts
// Force Jest to use our mocks
jest.mock('../src/clients/clickhouse');
jest.mock('../src/clients/elasticsearch');
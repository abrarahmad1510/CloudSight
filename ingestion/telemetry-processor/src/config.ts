export interface ClickHouseConfig {
  url: string;
  username: string;
  password: string;
  database: string;
  maxRetries: number;
  requestTimeout: number;
}

export interface ElasticsearchConfig {
  node: string;
  username: string;
  password: string;
  maxRetries: number;
  requestTimeout: number;
}

export interface DatabaseConfig {
  clickhouse: ClickHouseConfig;
  elasticsearch: ElasticsearchConfig;
}

export function getConfig(): DatabaseConfig {
  return {
    clickhouse: {
      url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
      username: process.env.CLICKHOUSE_USERNAME || 'default',
      password: process.env.CLICKHOUSE_PASSWORD || '',
      database: process.env.CLICKHOUSE_DATABASE || 'default',
      maxRetries: parseInt(process.env.CLICKHOUSE_MAX_RETRIES || '3'),
      requestTimeout: parseInt(process.env.CLICKHOUSE_REQUEST_TIMEOUT || '30000'),
    },
    elasticsearch: {
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
      username: process.env.ELASTICSEARCH_USERNAME || '',
      password: process.env.ELASTICSEARCH_PASSWORD || '',
      maxRetries: parseInt(process.env.ELASTICSEARCH_MAX_RETRIES || '3'),
      requestTimeout: parseInt(process.env.ELASTICSEARCH_REQUEST_TIMEOUT || '30000'),
    },
  };
}
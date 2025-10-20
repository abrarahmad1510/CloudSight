import { createClient, ClickHouseClient as ClickHouseJSClient } from '@clickhouse/client';
import { ProcessedMetric } from '../types';

export interface ClickHouseConfig {
  url: string;
  username: string;
  password: string;
  database: string;
  maxRetries: number;
  requestTimeout: number;
}

export class ClickHouseClient {
  private client: ClickHouseJSClient;
  private config: ClickHouseConfig;
  private isInitialized: boolean = false;

  constructor(config: ClickHouseConfig) {
    this.config = config;
    this.client = createClient({
      url: config.url,
      username: config.username,
      password: config.password,
      database: config.database,
      clickhouse_settings: {
        async_insert: 1,
        wait_for_async_insert: 1,
        async_insert_max_data_size: '1000000',
        async_insert_busy_timeout_ms: 10000,
      },
      compression: {
        response: true, 
        request: true,
      },
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create database if not exists
      await this.client.exec({
        query: `
          CREATE DATABASE IF NOT EXISTS ${this.config.database}
          ENGINE = Atomic
        `,
      });

      // Create distributed table for scalability
      await this.client.exec({
        query: `
          CREATE TABLE IF NOT EXISTS ${this.config.database}.metrics
          (
            timestamp DateTime64(3, 'UTC'),
            name String,
            value Float64,
            unit String,
            function_name String,
            region String,
            status LowCardinality(String),
            cold_start Boolean,
            aws_request_id String,
            memory_size UInt32,
            environment LowCardinality(String),
            version LowCardinality(String),
            date Date DEFAULT toDate(timestamp)
          )
          ENGINE = MergeTree()
          PARTITION BY toYYYYMM(date)
          ORDER BY (function_name, name, timestamp)
          SETTINGS index_granularity = 8192,
                   storage_policy = 'default'
        `,
      });

      // Create materialized views for real-time aggregations
      await this.client.exec({
        query: `
          CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.config.database}.metrics_1m_aggregations
          ENGINE = AggregatingMergeTree()
          PARTITION BY toYYYYMM(date)
          ORDER BY (function_name, name, timestamp)
          AS SELECT
            function_name,
            name,
            toStartOfMinute(timestamp) as timestamp,
            date,
            countState() as count,
            avgState(value) as avg_value,
            maxState(value) as max_value,
            minState(value) as min_value,
            quantileState(0.95)(value) as p95_value,
            quantileState(0.99)(value) as p99_value
          FROM ${this.config.database}.metrics
          GROUP BY function_name, name, timestamp, date
        `,
      });

      // Create cold start analysis view
      await this.client.exec({
        query: `
          CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.config.database}.cold_start_analysis
          ENGINE = AggregatingMergeTree()
          PARTITION BY toYYYYMM(date)
          ORDER BY (function_name, date)
          AS SELECT
            function_name,
            date,
            countIf(name = 'cold_start') as cold_starts,
            countIf(name = 'invocation_success' OR name = 'invocation_error') as total_invocations,
            cold_starts / total_invocations as cold_start_rate
          FROM ${this.config.database}.metrics
          WHERE name IN ('cold_start', 'invocation_success', 'invocation_error')
          GROUP BY function_name, date
        `,
      });

      this.isInitialized = true;
      console.log('ClickHouse database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ClickHouse:', error);
      throw error;
    }
  }

  async insertMetrics(metrics: ProcessedMetric[]): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const rows = metrics.map(metric => ({
        timestamp: metric.timestamp.toISOString().replace('T', ' ').replace('Z', ''),
        name: metric.name,
        value: metric.value,
        unit: metric.unit,
        function_name: metric.function_name,
        region: metric.region,
        status: metric.status || '',
        cold_start: metric.cold_start || false,
        aws_request_id: metric.aws_request_id || '',
        memory_size: metric.memory_size || 0,
        environment: metric.environment || 'unknown',
        version: metric.version || 'unknown',
      }));

      await this.client.insert({
        table: 'metrics',
        values: rows,
        format: 'JSONEachRow',
      });

      console.log(`Inserted ${rows.length} metrics into ClickHouse`);
    } catch (error) {
      console.error('Failed to insert metrics into ClickHouse:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.client.query({
        query: 'SELECT 1 as health',
      });
      const data = await result.json();
      return Array.isArray(data) && data.length > 0;
    } catch (error) {
      console.error('ClickHouse health check failed:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}
import { Client } from '@elastic/elasticsearch';
import { TraceRecord } from '../types';

export interface ElasticsearchConfig {
  node: string;
  username: string;
  password: string;
  maxRetries: number;
  requestTimeout: number;
}

export class ElasticsearchClient {
  private client: Client;
  private config: ElasticsearchConfig;
  private isInitialized: boolean = false;

  constructor(config: ElasticsearchConfig) {
    this.config = config;
    this.client = new Client({
      node: config.node,
      auth: {
        username: config.username,
        password: config.password,
      },
      maxRetries: config.maxRetries,
      requestTimeout: config.requestTimeout,
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if index exists - in v8, the response is the boolean directly
      const indexExists = await this.client.indices.exists({
        index: 'cloudsight-traces',
      });

      if (!indexExists) {
        await this.client.indices.create({
          index: 'cloudsight-traces',
          mappings: {
            dynamic: 'strict',
            properties: {
              traceId: { type: 'keyword' },
              spanId: { type: 'keyword' },
              startTime: { type: 'date' },
              endTime: { type: 'date' },
              duration: { type: 'float' },
              functionName: { type: 'keyword' },
              awsRequestId: { type: 'keyword' },
              coldStart: { type: 'boolean' },
              memoryLimitInMB: { type: 'keyword' },
              status: { type: 'keyword' },
              error: {
                properties: {
                  message: { type: 'text' },
                  stack: { type: 'text' },
                  type: { type: 'keyword' },
                },
              },
              '@timestamp': { type: 'date' },
            },
          },
          settings: {
            number_of_shards: 2,
            number_of_replicas: 1,
            'index.mapping.ignore_malformed': true,
          },
        });
      }

      this.isInitialized = true;
      console.log('Elasticsearch indices initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Elasticsearch:', error);
      throw error;
    }
  }

  async indexTrace(trace: TraceRecord): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const document = {
        traceId: trace.traceId,
        spanId: trace.spanId,
        startTime: trace.startTime,
        endTime: trace.endTime,
        duration: trace.duration,
        functionName: trace.invocationContext.functionName,
        awsRequestId: trace.invocationContext.awsRequestId,
        coldStart: trace.invocationContext.coldStart,
        memoryLimitInMB: trace.invocationContext.memoryLimitInMB,
        status: trace.error ? 'error' : 'success',
        error: trace.error,
        '@timestamp': new Date().toISOString(),
      };

      await this.client.index({
        index: 'cloudsight-traces',
        document,
        refresh: false,
      });

      console.log(`Indexed trace ${trace.traceId} in Elasticsearch`);
    } catch (error) {
      console.error('Failed to index trace in Elasticsearch:', error);
      throw error;
    }
  }

  async bulkIndexTraces(traces: TraceRecord[]): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const operations = traces.flatMap(trace => [
        { index: { _index: 'cloudsight-traces' } },
        {
          traceId: trace.traceId,
          spanId: trace.spanId,
          startTime: trace.startTime,
          endTime: trace.endTime,
          duration: trace.duration,
          functionName: trace.invocationContext.functionName,
          awsRequestId: trace.invocationContext.awsRequestId,
          coldStart: trace.invocationContext.coldStart,
          memoryLimitInMB: trace.invocationContext.memoryLimitInMB,
          status: trace.error ? 'error' : 'success',
          error: trace.error,
          '@timestamp': new Date().toISOString(),
        },
      ]);

      const response = await this.client.bulk({
        operations,
        refresh: false,
      });

      if (response.errors) {
        const errors = response.items.filter((item: any) => item.index?.error);
        console.error(`Elasticsearch bulk index errors: ${errors.length}`);
        errors.forEach((error: any) => {
          console.error('Bulk index error:', error.index?.error);
        });
      }

      console.log(`Bulk indexed ${traces.length} traces in Elasticsearch`);
    } catch (error) {
      console.error('Failed to bulk index traces in Elasticsearch:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const health = await this.client.cluster.health();
      return health.status !== 'red';
    } catch (error) {
      console.error('Elasticsearch health check failed:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}
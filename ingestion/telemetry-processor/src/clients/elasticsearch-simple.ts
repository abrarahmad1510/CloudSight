import { Client } from '@elastic/elasticsearch';

export class ElasticsearchClient {
  public client: Client;

  constructor() {
    const node = process.env.ELASTICSEARCH_NODE;

    console.log('Initializing Elasticsearch client for node:', node);

    this.client = new Client({
      node,
      maxRetries: parseInt(process.env.ELASTICSEARCH_MAX_RETRIES || '3'),
      requestTimeout: parseInt(process.env.ELASTICSEARCH_REQUEST_TIMEOUT || '30000'),
    });
  }

  async initialize(): Promise<void> {
    try {
      // Test connection with cluster health
      const health = await this.client.cluster.health();
      console.log('Elasticsearch cluster health:', health.status);
      
      // Try to create index if it doesn't exist
      try {
        const indexExists = await this.client.indices.exists({
          index: 'cloudsight-traces'
        });

        if (!indexExists) {
          await this.client.indices.create({
            index: 'cloudsight-traces',
            body: {
              mappings: {
                properties: {
                  traceId: { type: 'keyword' },
                  spanId: { type: 'keyword' },
                  startTime: { type: 'date' },
                  duration: { type: 'float' },
                  functionName: { type: 'keyword' },
                  status: { type: 'keyword' },
                  coldStart: { type: 'boolean' }
                }
              }
            }
          });
          console.log('Created Elasticsearch index: cloudsight-traces');
        } else {
          console.log('Elasticsearch index cloudsight-traces already exists');
        }
      } catch (indexError) {
        console.log('Note: Could not create Elasticsearch index, but continuing:', indexError.message);
      }
    } catch (error) {
      console.error('Failed to initialize Elasticsearch:', error.message);
      // Don't throw the error - let the function continue without Elasticsearch
      console.log('Continuing without Elasticsearch...');
    }
  }

  async indexTrace(trace: any): Promise<void> {
    try {
      await this.client.index({
        index: 'cloudsight-traces',
        body: trace
      });
    } catch (error) {
      console.error('Failed to index trace in Elasticsearch:', error.message);
      // Don't throw - we don't want to fail the whole batch because of one trace
    }
  }
}

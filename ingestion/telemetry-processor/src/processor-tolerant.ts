// This is a more tolerant version that won't fail the entire batch if one database fails
import { ClickHouseClient } from './clients/clickhouse';
import { ElasticsearchClient } from './clients/elasticsearch-simple';

export class TelemetryProcessor {
  private clickhouse: ClickHouseClient;
  private elasticsearch: ElasticsearchClient;
  private databasesInitialized = false;

  constructor() {
    this.clickhouse = new ClickHouseClient();
    this.elasticsearch = new ElasticsearchClient();
  }

  async initializeDatabases(): Promise<void> {
    if (this.databasesInitialized) return;

    try {
      // Initialize ClickHouse (required)
      await this.clickhouse.initialize();
      
      // Try to initialize Elasticsearch (optional)
      try {
        await this.elasticsearch.initialize();
      } catch (esError) {
        console.log('Elasticsearch initialization failed, but continuing:', esError.message);
      }
      
      this.databasesInitialized = true;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  async processBatch(records: any[]): Promise<void> {
    await this.initializeDatabases();

    const processingPromises = records.map(async (record) => {
      try {
        const body = JSON.parse(record.body);
        
        switch (body._cloudsight) {
          case 'metric':
            await this.processMetric(body);
            break;
          case 'trace':
            await this.processTrace(body);
            break;
          default:
            console.warn('Unknown record type:', body._cloudsight);
        }
      } catch (error) {
        console.error('Error processing record:', error);
        throw error; // Re-throw to mark this record as failed
      }
    });

    const results = await Promise.allSettled(processingPromises);
    
    const failedRecords = results.filter(result => result.status === 'rejected');
    if (failedRecords.length === records.length) {
      throw new Error('All records failed processing');
    } else if (failedRecords.length > 0) {
      console.warn(`${failedRecords.length} records failed processing`);
    }
  }

  private async processMetric(metric: any): Promise<void> {
    await this.clickhouse.insertMetric(metric);
  }

  private async processTrace(trace: any): Promise<void> {
    // Don't await this - if Elasticsearch fails, we don't want to block
    this.elasticsearch.indexTrace(trace).catch(error => {
      console.error('Failed to index trace in Elasticsearch:', error.message);
    });
  }
}

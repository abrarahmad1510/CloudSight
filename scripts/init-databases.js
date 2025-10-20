const { createClient } = require('@clickhouse/client');
const { Client: OpenSearchClient } = require('@opensearch-project/opensearch');

const clickhouseConfig = {
  url: 'https://vhk3qnfk91.us-east-1.aws.clickhouse.cloud:8443',
  username: 'default',
  password: '2OLrj~O4wp3hU'
};

const opensearchConfig = {
  node: 'https://search-cloudsight-dev-eccfq3z7p7uh4zp4wlvszjhoji.us-east-1.es.amazonaws.com'
};

async function initializeDatabases() {
  console.log('Initializing Databases...');

  // Initialize ClickHouse - FIXED: Create database first
  try {
    const clickhouse = createClient(clickhouseConfig);
    
    // First create the database
    await clickhouse.exec({
      query: 'CREATE DATABASE IF NOT EXISTS cloudsight'
    });

    // Now use the database
    const clickhouseWithDB = createClient({
      ...clickhouseConfig,
      database: 'cloudsight'
    });

    await clickhouseWithDB.exec({
      query: `
        CREATE TABLE IF NOT EXISTS cloudsight.metrics (
          timestamp DateTime64(3),
          name String,
          value Float64,
          unit String,
          function_name String,
          region String,
          dimensions String,
          date Date DEFAULT toDate(timestamp)
        ) ENGINE = MergeTree()
        PARTITION BY date
        ORDER BY (function_name, name, timestamp)
        SETTINGS index_granularity = 8192;
      `
    });

    console.log('✅ ClickHouse Schema Initialized');
  } catch (error) {
    console.error('❌ ClickHouse Initialization Failed:', error);
  }

  // Initialize OpenSearch - FIXED: Use OpenSearch client instead of Elasticsearch
  try {
    const opensearch = new OpenSearchClient(opensearchConfig);
    
    await opensearch.indices.create({
      index: 'cloudsight-traces',
      body: {
        mappings: {
          properties: {
            traceId: { type: 'keyword' },
            spanId: { type: 'keyword' },
            startTime: { type: 'date' },
            duration: { type: 'float' },
            functionName: { type: 'keyword' },
            coldStart: { type: 'boolean' },
            status: { type: 'keyword' }
          }
        }
      }
    });

    console.log('✅ OpenSearch Schema Initialized');
  } catch (error) {
    console.error('❌ OpenSearch Initialization Failed:', error);
  }

  console.log('Database Initialization Complete!');
}

initializeDatabases().catch(console.error);

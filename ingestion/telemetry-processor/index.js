const { createClient } = require('@clickhouse/client');

// Initialize ClickHouse client
const clickhouse = createClient({
  url: process.env.CLICKHOUSE_URL,
  username: process.env.CLICKHOUSE_USERNAME,
  password: process.env.CLICKHOUSE_PASSWORD,
  database: process.env.CLICKHOUSE_DATABASE,
});

let initialized = false;

async function initialize() {
  if (initialized) return;
  
  try {
    // Test connection
    await clickhouse.ping();
    console.log('ClickHouse connection successful');
    
    // Create table if it doesn't exist
    await clickhouse.exec({
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
      `
    });
    console.log('ClickHouse table ready');
    initialized = true;
  } catch (error) {
    console.error('Initialization failed:', error);
    throw error;
  }
}

exports.handler = async (event) => {
  console.log('Processing records:', event.Records?.length || 0);
  
  try {
    await initialize();
    
    const records = event.Records || [];
    let successful = 0;
    let failed = 0;
    
    for (const record of records) {
      try {
        const body = JSON.parse(record.body);
        
        if (body._cloudsight === 'metric') {
          await clickhouse.insert({
            table: 'cloudsight.metrics',
            values: [{
              timestamp: new Date(body.timestamp || Date.now()),
              name: body.name,
              value: body.value,
              unit: body.unit || 'Count',
              function_name: body.dimensions?.function_name || 'unknown',
              region: body.dimensions?.region || 'unknown',
              dimensions: JSON.stringify(body.dimensions || {})
            }],
            format: 'JSONEachRow'
          });
          console.log('Successfully processed metric:', body.name);
          successful++;
        } else {
          console.log('Skipping non-metric record:', body._cloudsight);
          successful++; // Not a failure, just not processed
        }
      } catch (recordError) {
        console.error('Failed to process record:', recordError);
        failed++;
      }
    }
    
    console.log(`Processing complete: ${successful} successful, ${failed} failed`);
    
    if (failed === records.length) {
      throw new Error('All records failed processing');
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Processing completed',
        successfulRecords: successful,
        failedRecords: failed
      })
    };
  } catch (error) {
    console.error('Batch processing failed:', error);
    throw error;
  }
};

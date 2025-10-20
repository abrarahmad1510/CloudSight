import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { ClickHouseClient } from '../src/clients/clickhouse';
import { ElasticsearchClient } from '../src/clients/elasticsearch';

let clickhouseContainer: StartedTestContainer;
let elasticsearchContainer: StartedTestContainer;

export const setupIntegrationTest = async (): Promise<{
  clickhouseClient: ClickHouseClient;
  elasticsearchClient: ElasticsearchClient;
}> => {
  // Start ClickHouse container
  clickhouseContainer = await new GenericContainer('clickhouse/clickhouse-server:latest')
    .withExposedPorts(8123)
    .withEnvironment({
      CLICKHOUSE_USER: 'default',
      CLICKHOUSE_PASSWORD: '',
      CLICKHOUSE_DB: 'test'
    })
    .start();

  // Start Elasticsearch container
  elasticsearchContainer = await new GenericContainer('docker.elastic.co/elasticsearch/elasticsearch:8.11.0')
    .withExposedPorts(9200)
    .withEnvironment({
      'discovery.type': 'single-node',
      'xpack.security.enabled': 'false',
      'ES_JAVA_OPTS': '-Xms512m -Xmx512m'
    })
    .start();

  const clickhouseConfig = {
    url: `http://${clickhouseContainer.getHost()}:${clickhouseContainer.getMappedPort(8123)}`,
    username: 'default',
    password: '',
    database: 'test',
    maxRetries: 3,
    requestTimeout: 30000
  };

  const elasticsearchConfig = {
    node: `http://${elasticsearchContainer.getHost()}:${elasticsearchContainer.getMappedPort(9200)}`,
    username: '',
    password: '',
    maxRetries: 3,
    requestTimeout: 30000
  };

  const clickhouseClient = new ClickHouseClient(clickhouseConfig);
  const elasticsearchClient = new ElasticsearchClient(elasticsearchConfig);

  return { clickhouseClient, elasticsearchClient };
};

export const teardownIntegrationTest = async (): Promise<void> => {
  if (clickhouseContainer) {
    await clickhouseContainer.stop();
  }
  if (elasticsearchContainer) {
    await elasticsearchContainer.stop();
  }
};
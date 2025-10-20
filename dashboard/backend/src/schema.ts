export const typeDefs = `#graphql
  type Query {
    # Dashboard metrics
    dashboardMetrics(timeRange: TimeRange!): DashboardMetrics!
    
    # Function queries
    functions: [Function!]!
    function(id: ID!): Function
    
    # Trace queries
    traces(limit: Int = 20): [Trace!]!
    trace(traceId: ID!): Trace
    
    # Metrics over time
    metrics(timeRange: TimeRange!): MetricsData!
  }

  enum TimeRange {
    ONE_HOUR
    SIX_HOURS
    ONE_DAY
    ONE_WEEK
    ONE_MONTH
  }

  type DashboardMetrics {
    totalInvocations: Int!
    totalErrors: Int!
    errorRate: Float!
    avgDuration: Float!
    coldStartRate: Float!
    activeFunctions: Int!
  }

  type Function {
    id: ID!
    name: String!
    runtime: String!
    memorySize: Int!
    invocations: Int!
    errors: Int!
    errorRate: Float!
    avgDuration: Float!
    coldStartRate: Float!
    lastInvocation: String!
  }

  type Trace {
    traceId: ID!
    startTime: String!
    duration: Float!
    serviceName: String!
    status: TraceStatus!
    spanCount: Int!
    spans: [Span!]!
  }

  type Span {
    spanId: ID!
    traceId: ID!
    parentSpanId: String
    serviceName: String!
    operationName: String!
    startTime: String!
    duration: Float!
    status: SpanStatus!
    tags: [KeyValue!]!
  }

  type KeyValue {
    key: String!
    value: String!
  }

  enum TraceStatus {
    SUCCESS
    ERROR
  }

  enum SpanStatus {
    OK
    ERROR
  }

  type MetricsData {
    invocations: [DataPoint!]!
    errors: [DataPoint!]!
    duration: [DataPoint!]!
    coldStarts: [DataPoint!]!
  }

  type DataPoint {
    timestamp: String!
    value: Float!
  }
`;

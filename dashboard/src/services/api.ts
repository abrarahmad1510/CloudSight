// Mock API service for GraphQL queries
// In production, replace with actual Apollo Client queries

import { FunctionSummary, Trace, MetricDataPoint } from '../types';
import {
  generateMockFunctions,
  generateMockTraces,
  generateTimeSeriesData,
  generateErrorRateData,
  generateDurationData,
  generateColdStartData,
} from '../utils/mockData';

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Fetch all functions
  async getFunctions(): Promise<FunctionSummary[]> {
    await delay(500);
    return generateMockFunctions();
  },

  // Fetch single function by ID
  async getFunction(id: string): Promise<FunctionSummary | null> {
    await delay(300);
    const functions = generateMockFunctions();
    return functions.find(f => f.id === id) || null;
  },

  // Fetch invocation metrics
  async getInvocationMetrics(hours: number): Promise<MetricDataPoint[]> {
    await delay(400);
    return generateTimeSeriesData(hours);
  },

  // Fetch error rate metrics
  async getErrorRateMetrics(hours: number): Promise<MetricDataPoint[]> {
    await delay(400);
    return generateErrorRateData(hours);
  },

  // Fetch duration metrics
  async getDurationMetrics(hours: number): Promise<MetricDataPoint[]> {
    await delay(400);
    return generateDurationData(hours);
  },

  // Fetch cold start metrics
  async getColdStartMetrics(hours: number): Promise<MetricDataPoint[]> {
    await delay(400);
    return generateColdStartData(hours);
  },

  // Fetch all traces
  async getTraces(): Promise<Trace[]> {
    await delay(600);
    return generateMockTraces(20);
  },

  // Fetch single trace by ID
  async getTrace(traceId: string): Promise<Trace | null> {
    await delay(400);
    const traces = generateMockTraces(20);
    return traces.find(t => t.traceId === traceId) || null;
  },

  // Fetch function-specific metrics
  async getFunctionMetrics(functionId: string, hours: number): Promise<{
    invocations: MetricDataPoint[];
    errors: MetricDataPoint[];
    duration: MetricDataPoint[];
    coldStarts: MetricDataPoint[];
  }> {
    await delay(500);
    return {
      invocations: generateTimeSeriesData(hours),
      errors: generateErrorRateData(hours),
      duration: generateDurationData(hours),
      coldStarts: generateColdStartData(hours),
    };
  },
};

// GraphQL queries (placeholders for Apollo Client integration)
export const QUERIES = {
  GET_FUNCTIONS: `
    query GetFunctions {
      functions {
        id
        name
        runtime
        memorySize
        invocations
        errors
        errorRate
        avgDuration
        coldStartRate
        lastInvocation
      }
    }
  `,
  
  GET_FUNCTION: `
    query GetFunction($id: ID!) {
      function(id: $id) {
        id
        name
        runtime
        memorySize
        invocations
        errors
        errorRate
        avgDuration
        coldStartRate
        lastInvocation
      }
    }
  `,
  
  GET_TRACES: `
    query GetTraces($limit: Int) {
      traces(limit: $limit) {
        traceId
        startTime
        duration
        serviceName
        status
        spanCount
      }
    }
  `,
  
  GET_TRACE: `
    query GetTrace($traceId: ID!) {
      trace(traceId: $traceId) {
        traceId
        startTime
        duration
        status
        spans {
          spanId
          traceId
          parentSpanId
          serviceName
          operationName
          startTime
          duration
          status
          tags
          logs {
            timestamp
            fields
          }
        }
      }
    }
  `,
  
  GET_METRICS: `
    query GetMetrics($timeRange: TimeRange!) {
      metrics(timeRange: $timeRange) {
        invocations {
          timestamp
          value
        }
        errors {
          timestamp
          value
        }
        duration {
          timestamp
          value
        }
        coldStarts {
          timestamp
          value
        }
      }
    }
  `,
};

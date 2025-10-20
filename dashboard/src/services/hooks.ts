// Correct imports for Apollo Client 4.0.7
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { getGraphQLTimeRange } from '../components/common/TimeRangeSelector';

// GraphQL Queries
const GET_DASHBOARD_METRICS = gql`
  query GetDashboardMetrics($timeRange: TimeRange!) {
    dashboardMetrics(timeRange: $timeRange) {
      totalInvocations
      totalErrors
      errorRate
      avgDuration
      coldStartRate
      activeFunctions
    }
  }
`;

const GET_FUNCTIONS = gql`
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
`;

const GET_FUNCTION = gql`
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
`;

const GET_METRICS = gql`
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
`;

const GET_TRACES = gql`
  query GetTraces {
    traces {
      traceId
      startTime
      duration
      serviceName
      status
      spanCount
    }
  }
`;

const GET_TRACE = gql`
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
        tags {
          key
          value
        }
      }
    }
  }
`;

// Custom hook for fetching functions
export function useFunctions() {
  const { data, loading, error } = useQuery(GET_FUNCTIONS);
  return {
    functions: data?.functions || [],
    loading,
    error
  };
}

export function useFunction(id: string) {
  const { data, loading, error } = useQuery(GET_FUNCTION, {
    variables: { id }
  });
  return {
    functionData: data?.function || null,
    loading,
    error
  };
}

export function useTraces() {
  const { data, loading, error } = useQuery(GET_TRACES);
  return {
    traces: data?.traces || [],
    loading,
    error
  };
}

export function useTrace(traceId: string) {
  const { data, loading, error } = useQuery(GET_TRACE, {
    variables: { traceId }
  });
  return {
    trace: data?.trace || null,
    loading,
    error
  };
}

export function useMetrics(timeRange: string) {
  const graphQLTimeRange = getGraphQLTimeRange(timeRange as any);
  const { data, loading, error } = useQuery(GET_METRICS, {
    variables: { timeRange: graphQLTimeRange }
  });
  return {
    metrics: data?.metrics || {
      invocations: [],
      errors: [],
      duration: [],
      coldStarts: []
    },
    loading,
    error
  };
}

export function useDashboardMetrics(timeRange: string) {
  const graphQLTimeRange = getGraphQLTimeRange(timeRange as any);
  const { data, loading, error } = useQuery(GET_DASHBOARD_METRICS, {
    variables: { timeRange: graphQLTimeRange }
  });
  return {
    dashboardMetrics: data?.dashboardMetrics || {
      totalInvocations: 0,
      totalErrors: 0,
      errorRate: 0,
      avgDuration: 0,
      coldStartRate: 0,
      activeFunctions: 0
    },
    loading,
    error
  };
}

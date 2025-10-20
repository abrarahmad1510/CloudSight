import { ClickHouseClient } from './clickhouse-client.js';

const clickhouse = new ClickHouseClient();

export const resolvers = {
  Query: {
    dashboardMetrics: async (_: any, { timeRange }: { timeRange: string }) => {
      console.log('Fetching dashboard metrics for time range:', timeRange);
      try {
        return await clickhouse.getDashboardMetrics(timeRange);
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        return {
          totalInvocations: 0,
          totalErrors: 0,
          errorRate: 0,
          avgDuration: 0,
          coldStartRate: 0,
          activeFunctions: 0
        };
      }
    },

    functions: async () => {
      console.log('Fetching functions');
      try {
        return await clickhouse.getFunctions();
      } catch (error) {
        console.error('Error fetching functions:', error);
        return [];
      }
    },

    function: async (_: any, { id }: { id: string }) => {
      console.log('Fetching function:', id);
      try {
        const functions = await clickhouse.getFunctions();
        return functions.find((fn: any) => fn.name === id) || null;
      } catch (error) {
        console.error('Error fetching function:', error);
        return null;
      }
    },

    metrics: async (_: any, { timeRange }: { timeRange: string }) => {
      console.log('Fetching metrics for time range:', timeRange);
      try {
        const [invocations, errors, duration, coldStarts] = await Promise.all([
          clickhouse.getTimeSeriesData(timeRange, 'invocation_success'),
          clickhouse.getTimeSeriesData(timeRange, 'invocation_error'),
          clickhouse.getTimeSeriesData(timeRange, 'invocation_duration'),
          clickhouse.getTimeSeriesData(timeRange, 'cold_start')
        ]);

        return {
          invocations,
          errors,
          duration,
          coldStarts
        };
      } catch (error) {
        console.error('Error fetching metrics:', error);
        return {
          invocations: [],
          errors: [],
          duration: [],
          coldStarts: []
        };
      }
    },

    traces: async () => {
      console.log('Fetching traces');
      return [];
    },

    trace: async (_: any, { traceId }: { traceId: string }) => {
      console.log('Fetching trace:', traceId);
      return null;
    }
  }
};

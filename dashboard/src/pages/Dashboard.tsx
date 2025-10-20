import { Activity, AlertCircle, Timer, Zap, Server, TrendingUp } from 'lucide-react';
import { MetricCard } from '../components/metrics/MetricCard';
import { InvocationChart } from '../components/metrics/InvocationChart';
import { ErrorRateChart } from '../components/metrics/ErrorRateChart';
import { ColdStartChart } from '../components/metrics/ColdStartChart';
import { DurationChart } from '../components/metrics/DurationChart';
import { RealtimeEventsFeed } from '../components/events/RealtimeEventsFeed';
import { useDashboard } from '../contexts/DashboardContext';
import { useDashboardMetrics, useMetrics } from '../services/hooks';
import { Skeleton } from '../components/ui/skeleton';

export function Dashboard() {
  const { timeRange, realtimeEvents } = useDashboard();
  const { dashboardMetrics, loading: metricsLoading, error: metricsError } = useDashboardMetrics(timeRange);
  const { metrics, loading: chartsLoading, error: chartsError } = useMetrics(timeRange);

  if (metricsError || chartsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-medium">Error loading dashboard data</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Please check if the GraphQL server is running on port 4000
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricsLoading ? (
          // Loading skeletons for metrics cards
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))
        ) : (
          <>
            <MetricCard
              title="Total Invocations"
              value={dashboardMetrics.totalInvocations}
              icon={Activity}
              change={5.2}
              trend="up"
            />
            <MetricCard
              title="Total Errors"
              value={dashboardMetrics.totalErrors}
              icon={AlertCircle}
              change={-2.1}
              trend="down"
            />
            <MetricCard
              title="Error Rate"
              value={dashboardMetrics.errorRate}
              icon={TrendingUp}
              format="percentage"
              change={-1.5}
              trend="down"
            />
            <MetricCard
              title="Avg Duration"
              value={dashboardMetrics.avgDuration}
              icon={Timer}
              format="duration"
              change={-3.2}
              trend="down"
            />
            <MetricCard
              title="Cold Start Rate"
              value={dashboardMetrics.coldStartRate}
              icon={Zap}
              format="percentage"
              change={1.8}
              trend="up"
            />
            <MetricCard
              title="Active Functions"
              value={dashboardMetrics.activeFunctions}
              icon={Server}
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[380px]" />
          ))
        ) : (
          <>
            <InvocationChart
              data={metrics.invocations}
              title="Invocations Over Time"
              color="oklch(0.60 0.24 260)"
            />
            <ErrorRateChart data={metrics.errors} />
            <DurationChart data={metrics.duration} />
            <ColdStartChart data={metrics.coldStarts} />
          </>
        )}
      </div>

      {/* Real-time Events Feed */}
      <RealtimeEventsFeed events={realtimeEvents} />
    </div>
  );
}

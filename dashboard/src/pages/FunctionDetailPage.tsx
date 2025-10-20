import { useFunction } from '../services/hooks';
import { useMetrics } from '../services/hooks';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { ArrowLeft, Activity, AlertCircle, Timer, Zap } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { InvocationChart } from '../components/metrics/InvocationChart';
import { ErrorRateChart } from '../components/metrics/ErrorRateChart';
import { DurationChart } from '../components/metrics/DurationChart';
import { ColdStartChart } from '../components/metrics/ColdStartChart';
import { formatNumber, formatDuration, formatPercentage, formatBytes } from '../utils/formatters';

interface FunctionDetailPageProps {
  functionId: string;
  onBack: () => void;
}

export function FunctionDetailPage({ functionId, onBack }: FunctionDetailPageProps) {
  const { functionData, loading: functionLoading } = useFunction(functionId);
  const { metrics, loading: metricsLoading } = useMetrics(24); // 24 hours of data

  if (functionLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!functionData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Function not found</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Functions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Functions
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h2>{functionData.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{functionData.runtime}</Badge>
              <span className="text-muted-foreground">
                {formatBytes(functionData.memorySize * 1024 * 1024)} Memory
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground">Invocations</p>
              <p className="text-2xl">{formatNumber(functionData.invocations)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-destructive/10 p-2 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-muted-foreground">Errors</p>
              <p className="text-2xl">{formatNumber(functionData.errors)}</p>
              <p className="text-destructive">{formatPercentage(functionData.errorRate)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <Timer className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-muted-foreground">Avg Duration</p>
              <p className="text-2xl">{formatDuration(functionData.avgDuration)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/10 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-muted-foreground">Cold Starts</p>
              <p className="text-2xl">{formatPercentage(functionData.coldStartRate)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      {metricsLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[380px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InvocationChart
            data={metrics.invocations}
            title="Invocations (24h)"
            color="#8b5cf6"
          />
          <ErrorRateChart data={metrics.errors} />
          <DurationChart data={metrics.duration} />
          <ColdStartChart data={metrics.coldStarts} />
        </div>
      )}
    </div>
  );
}

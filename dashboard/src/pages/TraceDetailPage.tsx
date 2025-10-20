import { useTrace } from '../services/hooks';
import { SpanHierarchy } from '../components/traces/SpanHierarchy';
import { TraceTimeline } from '../components/traces/TraceTimeline';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { formatDuration, formatDateTime } from '../utils/formatters';

interface TraceDetailPageProps {
  traceId: string;
  onBack: () => void;
}

export function TraceDetailPage({ traceId, onBack }: TraceDetailPageProps) {
  const { trace, loading } = useTrace(traceId);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!trace) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Trace not found</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Traces
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Traces
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h2>Trace Details</h2>
            <p className="text-muted-foreground">
              {trace.serviceName} - {formatDateTime(trace.startTime)}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant={trace.status === 'error' ? 'destructive' : 'default'}>
              {trace.status}
            </Badge>
            <span className="text-muted-foreground">
              Duration: {formatDuration(trace.duration)}
            </span>
          </div>
        </div>
        
        <code className="block mt-2 text-muted-foreground">
          Trace ID: {trace.traceId}
        </code>
      </div>

      <TraceTimeline spans={trace.spans} totalDuration={trace.duration} />
      <SpanHierarchy spans={trace.spans} />
    </div>
  );
}

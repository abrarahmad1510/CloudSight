import { Trace } from '../../types';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatDuration, formatDateTime } from '../../utils/formatters';
import { AlertCircle, CheckCircle, Activity } from 'lucide-react';

interface TraceListProps {
  traces: Trace[];
  onTraceClick: (traceId: string) => void;
}

export function TraceList({ traces, onTraceClick }: TraceListProps) {
  return (
    <div className="space-y-3">
      {traces.map((trace) => (
        <Card
          key={trace.traceId}
          className="p-4 cursor-pointer hover:border-primary transition-colors"
          onClick={() => onTraceClick(trace.traceId)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {trace.status === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                )}
                <span className="truncate">{trace.serviceName}</span>
                <Badge variant="outline" className="ml-auto flex-shrink-0">
                  <Activity className="w-3 h-3 mr-1" />
                  {trace.spanCount} spans
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>{formatDateTime(trace.startTime)}</span>
                <span>Duration: {formatDuration(trace.duration)}</span>
                <code className="text-xs bg-muted px-2 py-0.5 rounded">
                  {trace.traceId.substring(0, 16)}...
                </code>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

import { Span } from '../../types';
import { Card } from '../ui/card';
import { formatDuration } from '../../utils/formatters';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface TraceTimelineProps {
  spans: Span[];
  totalDuration: number;
}

export function TraceTimeline({ spans, totalDuration }: TraceTimelineProps) {
  const startTime = Math.min(...spans.map(s => s.startTime));

  return (
    <Card className="p-4">
      <h3 className="mb-4">Timeline</h3>
      <div className="space-y-2">
        {spans.map((span) => {
          const relativeStart = span.startTime - startTime;
          const leftPercent = (relativeStart / totalDuration) * 100;
          const widthPercent = (span.duration / totalDuration) * 100;

          return (
            <TooltipProvider key={span.spanId}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative h-8 bg-muted rounded-md overflow-hidden">
                    <div
                      className={`absolute h-full rounded ${
                        span.status === 'error'
                          ? 'bg-destructive'
                          : 'bg-primary'
                      }`}
                      style={{
                        left: `${leftPercent}%`,
                        width: `${Math.max(widthPercent, 0.5)}%`,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center px-3">
                      <span className="truncate">
                        {span.serviceName} - {span.operationName}
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p>{span.serviceName}</p>
                    <p>{span.operationName}</p>
                    <p>Duration: {formatDuration(span.duration)}</p>
                    <p>Start: +{formatDuration(relativeStart)}</p>
                    {span.status === 'error' && (
                      <p className="text-destructive">Status: Error</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      
      <div className="mt-4 flex justify-between text-muted-foreground">
        <span>0ms</span>
        <span>{formatDuration(totalDuration)}</span>
      </div>
    </Card>
  );
}

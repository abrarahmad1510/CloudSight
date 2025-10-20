import { RealtimeEvent } from '../../types';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { formatTime } from '../../utils/formatters';
import { AlertCircle, Info, AlertTriangle, Clock } from 'lucide-react';

interface RealtimeEventsFeedProps {
  events: RealtimeEvent[];
}

export function RealtimeEventsFeed({ events }: RealtimeEventsFeedProps) {
  const getEventIcon = (type: RealtimeEvent['type']) => {
    switch (type) {
      case 'error':
      case 'timeout':
        return AlertCircle;
      case 'coldstart':
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const getSeverityColor = (severity: RealtimeEvent['severity']) => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200 border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Real-time Events</h3>
        <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">{events.length} events</Badge>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {events.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>Waiting for events...</p>
            </div>
          )}

          {events.map((event) => {
            const Icon = getEventIcon(event.type);
            
            return (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 hover:bg-accent/50 transition-all border border-transparent hover:border-border/50"
              >
                <div className="mt-0.5 p-1.5 bg-gradient-to-br from-primary/10 to-primary/5">
                  <Icon className={`w-4 h-4 ${
                    event.severity === 'error' ? 'text-destructive' :
                    event.severity === 'warning' ? 'text-orange-500' :
                    'text-primary'
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="truncate">{event.functionName}</span>
                    <Badge variant={getSeverityColor(event.severity)} className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{event.message}</p>
                </div>
                
                <span className="text-muted-foreground flex-shrink-0">
                  {formatTime(event.timestamp)}
                </span>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}

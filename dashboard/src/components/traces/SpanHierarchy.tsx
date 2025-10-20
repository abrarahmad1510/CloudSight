import { Span } from '../../types';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatDuration } from '../../utils/formatters';
import { ChevronRight, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface SpanHierarchyProps {
  spans: Span[];
}

interface SpanNodeProps {
  span: Span;
  children: Span[];
  depth: number;
}

function SpanNode({ span, children, depth }: SpanNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);

  return (
    <div>
      <div
        className={`flex items-center gap-2 p-3 hover:bg-accent/50 cursor-pointer rounded-md ${
          span.status === 'error' ? 'bg-destructive/5' : ''
        }`}
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {children.length > 0 && (
          <ChevronRight
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        )}
        {children.length === 0 && <div className="w-4" />}
        
        {span.status === 'error' && (
          <AlertCircle className="w-4 h-4 text-destructive" />
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate">{span.operationName}</span>
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {span.serviceName}
            </Badge>
          </div>
        </div>
        
        <span className="text-muted-foreground flex-shrink-0">
          {formatDuration(span.duration)}
        </span>
      </div>

      {isExpanded && children.length > 0 && (
        <div className="border-l border-border ml-4">
          {children.map((childSpan) => {
            const grandChildren = spans.filter(s => s.parentSpanId === childSpan.spanId);
            return (
              <SpanNode
                key={childSpan.spanId}
                span={childSpan}
                children={grandChildren}
                depth={depth + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SpanHierarchy({ spans }: SpanHierarchyProps) {
  const rootSpans = spans.filter(s => !s.parentSpanId);

  return (
    <Card className="p-4">
      <h3 className="mb-4">Span Hierarchy</h3>
      <div className="space-y-1">
        {rootSpans.map((rootSpan) => {
          const children = spans.filter(s => s.parentSpanId === rootSpan.spanId);
          return (
            <SpanNode
              key={rootSpan.spanId}
              span={rootSpan}
              children={children}
              depth={0}
            />
          );
        })}
      </div>
    </Card>
  );
}

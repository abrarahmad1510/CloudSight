// Core Types for CloudSight Dashboard

export interface LambdaMetrics {
  functionName: string;
  invocations: number;
  errors: number;
  duration: number;
  coldStarts: number;
  timestamp: number;
}

export interface MetricDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

export interface FunctionSummary {
  id: string;
  name: string;
  runtime: string;
  memorySize: number;
  invocations: number;
  errors: number;
  errorRate: number;
  avgDuration: number;
  coldStartRate: number;
  lastInvocation: number;
}

export interface Span {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  serviceName: string;
  operationName: string;
  startTime: number;
  duration: number;
  status: 'ok' | 'error';
  tags: Record<string, string>;
  logs: SpanLog[];
}

export interface SpanLog {
  timestamp: number;
  fields: Record<string, string>;
}

export interface Trace {
  traceId: string;
  startTime: number;
  duration: number;
  spans: Span[];
  serviceName: string;
  status: 'ok' | 'error';
  spanCount: number;
}

export interface RealtimeEvent {
  id: string;
  type: 'invocation' | 'error' | 'coldstart' | 'timeout';
  functionName: string;
  timestamp: number;
  message: string;
  severity: 'info' | 'warning' | 'error';
  metadata?: Record<string, any>;
}

export type TimeRange = '1h' | '6h' | '1d' | '1w' | '1m';

export interface TimeRangeOption {
  label: string;
  value: TimeRange;
  hours: number;
}

export interface DashboardMetrics {
  totalInvocations: number;
  totalErrors: number;
  errorRate: number;
  avgDuration: number;
  coldStartRate: number;
  activeConnections: number;
}

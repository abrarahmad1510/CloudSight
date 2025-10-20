import { FunctionSummary, Trace, Span, RealtimeEvent, MetricDataPoint, DashboardMetrics } from '../types';

// Mock function names
const functionNames = [
  'user-authentication',
  'data-processor',
  'image-upload',
  'notification-service',
  'analytics-tracker',
  'payment-gateway',
];

const runtimes = ['nodejs18.x', 'python3.11', 'nodejs20.x', 'java17'];

// Generate mock function summaries
export function generateMockFunctions(): FunctionSummary[] {
  return functionNames.map((name, index) => ({
    id: `fn-${index + 1}`,
    name,
    runtime: runtimes[index % runtimes.length],
    memorySize: [128, 256, 512, 1024][index % 4],
    invocations: Math.floor(Math.random() * 10000) + 1000,
    errors: Math.floor(Math.random() * 100),
    errorRate: Math.random() * 5,
    avgDuration: Math.random() * 500 + 50,
    coldStartRate: Math.random() * 15,
    lastInvocation: Date.now() - Math.random() * 3600000,
  }));
}

// Generate time series data
export function generateTimeSeriesData(
  hours: number,
  points: number = 50
): MetricDataPoint[] {
  const now = Date.now();
  const interval = (hours * 3600000) / points;
  
  return Array.from({ length: points }, (_, i) => ({
    timestamp: now - (points - i) * interval,
    value: Math.floor(Math.random() * 1000) + 200,
  }));
}

// Generate error rate data
export function generateErrorRateData(hours: number): MetricDataPoint[] {
  const now = Date.now();
  const points = Math.min(hours * 6, 100);
  const interval = (hours * 3600000) / points;
  
  return Array.from({ length: points }, (_, i) => ({
    timestamp: now - (points - i) * interval,
    value: Math.random() * 5,
  }));
}

// Generate duration data
export function generateDurationData(hours: number): MetricDataPoint[] {
  const now = Date.now();
  const points = Math.min(hours * 6, 100);
  const interval = (hours * 3600000) / points;
  
  return Array.from({ length: points }, (_, i) => ({
    timestamp: now - (points - i) * interval,
    value: Math.random() * 300 + 100,
  }));
}

// Generate cold start data
export function generateColdStartData(hours: number): MetricDataPoint[] {
  const now = Date.now();
  const points = Math.min(hours * 6, 100);
  const interval = (hours * 3600000) / points;
  
  return Array.from({ length: points }, (_, i) => ({
    timestamp: now - (points - i) * interval,
    value: Math.random() * 20,
  }));
}

// Generate mock spans
function generateSpans(traceId: string, count: number): Span[] {
  const spans: Span[] = [];
  const now = Date.now();
  
  // Root span
  const rootSpan: Span = {
    spanId: `span-root-${Math.random().toString(36).substr(2, 9)}`,
    traceId,
    serviceName: 'api-gateway',
    operationName: 'HTTP GET /api/users',
    startTime: now - 5000,
    duration: 450,
    status: Math.random() > 0.9 ? 'error' : 'ok',
    tags: {
      'http.method': 'GET',
      'http.url': '/api/users',
      'http.status_code': Math.random() > 0.9 ? '500' : '200',
    },
    logs: [],
  };
  spans.push(rootSpan);
  
  // Child spans
  for (let i = 1; i < count; i++) {
    const parentSpan = spans[Math.floor(Math.random() * spans.length)];
    const startOffset = Math.random() * (parentSpan.duration - 100);
    
    const span: Span = {
      spanId: `span-${i}-${Math.random().toString(36).substr(2, 9)}`,
      traceId,
      parentSpanId: parentSpan.spanId,
      serviceName: functionNames[i % functionNames.length],
      operationName: ['database.query', 'cache.get', 'http.request', 's3.upload'][i % 4],
      startTime: parentSpan.startTime + startOffset,
      duration: Math.random() * (parentSpan.duration - startOffset - 10) + 10,
      status: Math.random() > 0.95 ? 'error' : 'ok',
      tags: {
        'db.type': 'postgresql',
        'db.statement': 'SELECT * FROM users',
      },
      logs: [],
    };
    spans.push(span);
  }
  
  return spans;
}

// Generate mock traces
export function generateMockTraces(count: number = 20): Trace[] {
  return Array.from({ length: count }, (_, i) => {
    const traceId = `trace-${Date.now()}-${i}`;
    const spanCount = Math.floor(Math.random() * 8) + 3;
    const spans = generateSpans(traceId, spanCount);
    const hasError = spans.some(s => s.status === 'error');
    
    return {
      traceId,
      startTime: spans[0].startTime,
      duration: Math.max(...spans.map(s => s.startTime + s.duration)) - spans[0].startTime,
      spans,
      serviceName: spans[0].serviceName,
      status: hasError ? 'error' : 'ok',
      spanCount,
    };
  });
}

// Generate realtime events
export function generateRealtimeEvent(): RealtimeEvent {
  const types: RealtimeEvent['type'][] = ['invocation', 'error', 'coldstart', 'timeout'];
  const severities: RealtimeEvent['severity'][] = ['info', 'warning', 'error'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  let severity: RealtimeEvent['severity'] = 'info';
  if (type === 'error' || type === 'timeout') severity = 'error';
  else if (type === 'coldstart') severity = 'warning';
  
  return {
    id: `event-${Date.now()}-${Math.random()}`,
    type,
    functionName: functionNames[Math.floor(Math.random() * functionNames.length)],
    timestamp: Date.now(),
    message: getEventMessage(type),
    severity,
    metadata: {
      duration: Math.random() * 1000,
      memoryUsed: Math.random() * 512,
    },
  };
}

function getEventMessage(type: RealtimeEvent['type']): string {
  switch (type) {
    case 'invocation':
      return 'Function invoked successfully';
    case 'error':
      return 'Function execution failed';
    case 'coldstart':
      return 'Cold start detected';
    case 'timeout':
      return 'Function execution timeout';
  }
}

// Generate dashboard metrics
export function generateDashboardMetrics(): DashboardMetrics {
  return {
    totalInvocations: Math.floor(Math.random() * 100000) + 50000,
    totalErrors: Math.floor(Math.random() * 1000) + 100,
    errorRate: Math.random() * 3 + 0.5,
    avgDuration: Math.random() * 300 + 150,
    coldStartRate: Math.random() * 10 + 5,
    activeConnections: Math.floor(Math.random() * 50) + 10,
  };
}

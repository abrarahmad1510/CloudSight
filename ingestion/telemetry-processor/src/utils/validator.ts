import { CloudSightMetric, TraceRecord } from '../types';
import { ValidationError } from './errorHandler';

export class TelemetryValidator {
  private readonly requiredMetricFields = ['name', 'value', 'unit', 'timestamp', 'dimensions'];
  private readonly requiredTraceFields = ['traceId', 'spanId', 'startTime', 'invocationContext'];

  validateMetric(metric: any): CloudSightMetric {
    // Check required fields
    for (const field of this.requiredMetricFields) {
      if (!metric[field]) {
        throw new ValidationError(`Missing required field: ${field}`, { metric });
      }
    }

    // Validate field types
    if (typeof metric.name !== 'string') {
      throw new ValidationError('Metric name must be a string', { metric });
    }

    if (typeof metric.value !== 'number' || !isFinite(metric.value)) {
      throw new ValidationError('Metric value must be a finite number', { metric });
    }

    if (typeof metric.unit !== 'string') {
      throw new ValidationError('Metric unit must be a string', { metric });
    }

    if (typeof metric.timestamp !== 'string' || isNaN(Date.parse(metric.timestamp))) {
      throw new ValidationError('Metric timestamp must be a valid ISO string', { metric });
    }

    if (typeof metric.dimensions !== 'object' || metric.dimensions === null) {
      throw new ValidationError('Metric dimensions must be an object', { metric });
    }

    // Validate CloudSight identifier
    if (metric._cloudsight !== 'metric') {
      throw new ValidationError('Invalid CloudSight metric identifier', { metric });
    }

    // Validate specific metric types
    this.validateMetricType(metric);

    return metric as CloudSightMetric;
  }

  validateTrace(trace: any): TraceRecord {
    for (const field of this.requiredTraceFields) {
      if (!trace[field]) {
        throw new ValidationError(`Missing required trace field: ${field}`, { trace });
      }
    }

    if (typeof trace.traceId !== 'string') {
      throw new ValidationError('Trace ID must be a string', { trace });
    }

    if (typeof trace.spanId !== 'string') {
      throw new ValidationError('Span ID must be a string', { trace });
    }

    if (typeof trace.startTime !== 'string' || isNaN(Date.parse(trace.startTime))) {
      throw new ValidationError('Trace startTime must be a valid ISO string', { trace });
    }

    if (trace._cloudsight !== 'trace') {
      throw new ValidationError('Invalid CloudSight trace identifier', { trace });
    }

    return trace as TraceRecord;
  }

  private validateMetricType(metric: CloudSightMetric): void {
    const name = metric.name;

    // Validate cold_start metrics
    if (name === 'cold_start' && metric.value !== 1) {
      throw new ValidationError('Cold start metric value must be 1', { metric });
    }

    // Validate duration metrics
    if (name.includes('duration') && metric.unit !== 'Milliseconds') {
      throw new ValidationError('Duration metrics must use Milliseconds unit', { metric });
    }

    // Validate count metrics
    if ((name.includes('success') || name.includes('error') || name.includes('cold_start')) && 
        metric.unit !== 'Count') {
      throw new ValidationError('Count metrics must use Count unit', { metric });
    }

    // Validate value ranges
    if (name.includes('duration') && (metric.value < 0 || metric.value > 900000)) { // 15 minutes max
      throw new ValidationError('Duration metric value out of valid range', { metric });
    }

    if ((name.includes('success') || name.includes('error')) && metric.value !== 1) {
      throw new ValidationError('Success/error metric value must be 1', { metric });
    }
  }

  isValidJSON(payload: string): boolean {
    try {
      JSON.parse(payload);
      return true;
    } catch {
      return false;
    }
  }
}
import { ProcessingMetrics } from '../../src/utils/metrics';

describe('ProcessingMetrics', () => {
  let metrics: ProcessingMetrics;

  beforeEach(() => {
    metrics = new ProcessingMetrics();
  });

  test('should record batch processing', () => {
    metrics.recordBatchProcessing(10, 100, 8, 2, []);

    const result = metrics.getMetrics();
    expect(result.recordsProcessed).toBe(8);
    expect(result.recordsFailed).toBe(2);
    expect(result.avgProcessingTime).toBe(100);
  });

  test('should calculate average processing time across multiple batches', () => {
    metrics.recordBatchProcessing(10, 100, 10, 0, []);
    metrics.recordBatchProcessing(20, 300, 20, 0, []);

    const result = metrics.getMetrics();
    expect(result.avgProcessingTime).toBe(200);
  });

  test('should handle zero records', () => {
    metrics.recordBatchProcessing(0, 0, 0, 0, []);

    const result = metrics.getMetrics();
    expect(result.recordsProcessed).toBe(0);
    expect(result.recordsFailed).toBe(0);
    expect(result.avgProcessingTime).toBe(0);
  });

  test('should track processing errors', () => {
    const errors = [
      { recordId: '1', error: 'Error 1' },
      { recordId: '2', error: 'Error 2' }
    ];
    metrics.recordBatchProcessing(10, 100, 8, 2, errors);

    const result = metrics.getMetrics();
    expect(result.errorBreakdown['Error 1']).toBe(1);
    expect(result.errorBreakdown['Error 2']).toBe(1);
  });
});
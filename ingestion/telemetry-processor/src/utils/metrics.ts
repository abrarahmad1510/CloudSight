export class ProcessingMetrics {
  private recordsProcessed: number = 0;
  private recordsFailed: number = 0;
  private processingTime: number = 0;
  private batchSizes: number[] = [];
  private errorCounts: Map<string, number> = new Map();

  recordBatchProcessing(
    batchSize: number,
    processingTime: number,
    successfulRecords: number,
    failedRecords: number,
    errors: Array<{ error: string }>
  ): void {
    this.recordsProcessed += successfulRecords;
    this.recordsFailed += failedRecords;
    this.processingTime += processingTime;
    this.batchSizes.push(batchSize);

    // Count errors by type
    for (const error of errors) {
      const count = this.errorCounts.get(error.error) || 0;
      this.errorCounts.set(error.error, count + 1);
    }
  }

  getMetrics() {
    const totalBatches = this.batchSizes.length;
    const avgBatchSize = this.batchSizes.reduce((a, b) => a + b, 0) / totalBatches || 0;
    const avgProcessingTime = this.processingTime / totalBatches || 0;
    const successRate = this.recordsProcessed / (this.recordsProcessed + this.recordsFailed) || 0;

    return {
      recordsProcessed: this.recordsProcessed,
      recordsFailed: this.recordsFailed,
      totalBatches,
      avgBatchSize,
      avgProcessingTime,
      successRate,
      errorBreakdown: Object.fromEntries(this.errorCounts),
    };
  }

  reset(): void {
    this.recordsProcessed = 0;
    this.recordsFailed = 0;
    this.processingTime = 0;
    this.batchSizes = [];
    this.errorCounts.clear();
  }
}
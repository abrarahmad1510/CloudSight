export interface CloudSightMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  dimensions: Record<string, string>;
  _cloudsight: 'metric';  // Fixed: was 'trace'
}

export interface ProcessedMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  function_name: string;
  region: string;
  status?: string;
  cold_start?: boolean;
  aws_request_id?: string;
  memory_size?: number;
  environment?: string;
  version?: string;
}

export interface TraceRecord {
  traceId: string;
  spanId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  invocationContext: {
    functionName: string;
    awsRequestId: string;
    coldStart: boolean;
    memoryLimitInMB: string;
  };
  error?: {
    message: string;
    stack: string;
    type: string;
  };
  _cloudsight: 'trace';
}

// KEEP KinesisRecord for now (we'll remove later if needed)
export interface KinesisRecord {
  kinesis: {
    data: string;
    approximateArrivalTimestamp: number;
    partitionKey: string;
    sequenceNumber: string;
  };
  eventID: string;
  eventSource: string;
  eventVersion: string;
  eventName: string;
  eventSourceARN: string;
  awsRegion: string;
}

// ADD SQSRecord interface
export interface SQSRecord {
  messageId: string;
  receiptHandle: string;
  body: string;
  attributes: {
    ApproximateReceiveCount: string;
    SentTimestamp: string;
    SenderId: string;
    ApproximateFirstReceiveTimestamp: string;
  };
  messageAttributes: Record<string, any>;
  md5OfBody: string;
  eventSource: string;
  eventSourceARN: string;
  awsRegion: string;
}

export interface BatchProcessingResult {
  successfulRecords: number;
  failedRecords: number;
  processingErrors: Array<{
    recordId: string;
    error: string;
  }>;
}

import { CloudSightAgent } from '../src/agent';

// Mock AWS Lambda context
const createMockContext = () => ({
  functionName: 'test-function',
  functionVersion: '$LATEST',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test-function',
  memoryLimitInMB: '128',
  getRemainingTimeInMillis: () => 30000,
  callbackWaitsForEmptyEventLoop: false,
  awsRequestId: 'test-request-id',
  logGroupName: '/aws/lambda/test-function',
  logStreamName: '2023/01/01/[$LATEST]test-stream'
} as any);

describe('CloudSightAgent', () => {
  let agent: CloudSightAgent;
  let mockHandler: jest.Mock;

  beforeEach(() => {
    agent = new CloudSightAgent({
      enabled: true,
      sendMetrics: true,
      logLevel: 'info'
    });
    
    mockHandler = jest.fn().mockResolvedValue({ success: true });
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should wrap handler and capture invocation', async () => {
    const wrappedHandler = agent.wrapHandler(mockHandler);
    const event = { test: 'event' };
    const context = createMockContext();
    
    await wrappedHandler(event, context);
    
    expect(mockHandler).toHaveBeenCalledWith(event, context);
  });

  test('should record cold start on first invocation', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const wrappedHandler = agent.wrapHandler(mockHandler);
    const context = createMockContext();
    
    await wrappedHandler({}, context);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"name":"cold_start"')
    );
  });

  test('should record success metrics', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const wrappedHandler = agent.wrapHandler(mockHandler);
    const context = createMockContext();
    
    await wrappedHandler({}, context);
    
    const calls = consoleSpy.mock.calls.flat();
    expect(calls.some((call: string) => call.includes('"name":"invocation_success"'))).toBe(true);
    expect(calls.some((call: string) => call.includes('"name":"invocation_duration"'))).toBe(true);
  });

  test('should record error metrics on handler failure', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const errorHandler = jest.fn().mockRejectedValue(new Error('Test error'));
    const wrappedHandler = agent.wrapHandler(errorHandler);
    const context = createMockContext();
    
    await expect(wrappedHandler({}, context)).rejects.toThrow('Test error');
    
    const calls = consoleSpy.mock.calls.flat();
    expect(calls.some((call: string) => call.includes('"name":"invocation_error"'))).toBe(true);
  });
});
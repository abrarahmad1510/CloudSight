import { GCPCloudFunctionsAgent } from '../src/gcp-agent';

describe('GCPCloudFunctionsAgent', () => {
  let agent: GCPCloudFunctionsAgent;

  beforeEach(() => {
    agent = new GCPCloudFunctionsAgent();
  });

  test('should create agent instance', () => {
    expect(agent).toBeInstanceOf(GCPCloudFunctionsAgent);
  });

  test('should have enabled config by default', () => {
    // Access the private config property for testing
    expect((agent as any).config.enabled).toBe(true);
  });

  test('should wrap HTTP functions', () => {
    const mockHandler = async (req: any, res: any) => { return 'test'; };
    const wrapped = agent.wrapHttpFunction(mockHandler);
    expect(typeof wrapped).toBe('function');
  });

  test('should wrap background functions', () => {
    const mockHandler = async (event: any, context: any) => { return 'test'; };
    const wrapped = agent.wrapBackgroundFunction(mockHandler);
    expect(typeof wrapped).toBe('function');
  });

  test('should wrap handlers with generic wrapHandler', () => {
    const mockHandler = async (req: any, res: any) => { return 'test'; };
    const wrapped = agent.wrapHandler(mockHandler);
    expect(typeof wrapped).toBe('function');
  });
});

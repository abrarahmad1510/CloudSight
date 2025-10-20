import { CloudSightAgent } from './agent';
import { CloudSightConfig } from './types';

export function withCloudSight<TEvent, TResult>(
  handler: (event: TEvent, context: any) => Promise<TResult>,
  config?: CloudSightConfig
): (event: TEvent, context: any) => Promise<TResult> {
  const agent = new CloudSightAgent(config);
  return agent.wrapHandler(handler);
}
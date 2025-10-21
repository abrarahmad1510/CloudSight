import {GCPCloudFunctionsAgent} from './gcp-agent';
import { GCPAgentConfig, GCPHttpRequest, GCPHttpResponse } from './gcp-types';

// Background function wrapper (PubSub, Storage, etc.)
export function wrapBackgroundFunction(
    handler: (event: any, context: any) => Promise<any> | void,
    config?: Partial<GCPAgentConfig>
): (event: any, context: any) => Promise<any> | void {
    const agent = new GCPCloudFunctionsAgent(config);
    return agent.wrapBackgroundFunction(handler);
}

// HTTP function wrapper
export function wrapHttpFunction(
    handler: (req: GCPHttpRequest, res: GCPHttpResponse) => Promise<any> | void,
    config?: Partial<GCPAgentConfig>
): (req: GCPHttpRequest, res: GCPHttpResponse) => Promise<any> | void {
    const agent = new GCPCloudFunctionsAgent(config);
    return agent.wrapHttpFunction(handler);
}

// Unified wrapper that auto-detects function type
export function withCloudSight(
    handler: Function,
    config?: Partial<GCPAgentConfig>
): Function {
    const agent = new GCPCloudFunctionsAgent(config);
    
    // Simple detection based on function parameters
    if (handler.length === 2) {
        // Likely an HTTP function (req, res)
        return agent.wrapHttpFunction(handler as any);
    } else {
        // Likely a background function (event, context)
        return agent.wrapBackgroundFunction(handler as any);
    }
}

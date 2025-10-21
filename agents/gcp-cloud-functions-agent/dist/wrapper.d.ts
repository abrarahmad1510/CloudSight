import { GCPAgentConfig, GCPHttpRequest, GCPHttpResponse } from './gcp-types';
export declare function wrapBackgroundFunction(handler: (event: any, context: any) => Promise<any> | void, config?: Partial<GCPAgentConfig>): (event: any, context: any) => Promise<any> | void;
export declare function wrapHttpFunction(handler: (req: GCPHttpRequest, res: GCPHttpResponse) => Promise<any> | void, config?: Partial<GCPAgentConfig>): (req: GCPHttpRequest, res: GCPHttpResponse) => Promise<any> | void;
export declare function withCloudSight(handler: Function, config?: Partial<GCPAgentConfig>): Function;

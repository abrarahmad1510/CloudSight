import { CloudSightConfig } from './types';
export declare function withCloudSight<TEvent, TResult>(handler: (event: TEvent, context: any) => Promise<TResult>, config?: CloudSightConfig): (event: TEvent, context: any) => Promise<TResult>;

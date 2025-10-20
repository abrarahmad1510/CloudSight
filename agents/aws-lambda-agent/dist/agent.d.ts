import { Context } from 'aws-lambda';
import { CloudSightConfig } from './types';
export declare class CloudSightAgent {
    private config;
    private coldStart;
    constructor(config?: CloudSightConfig);
    wrapHandler<TEvent, TResult>(handler: (event: TEvent, context: Context) => Promise<TResult>): (event: TEvent, context: Context) => Promise<TResult>;
    private recordMetric;
}

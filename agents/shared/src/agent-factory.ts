// agents/shared/src/agent-factory.ts
import { AWSLambdaAgent } from '@cloudsight/aws-lambda-agent';
import { AzureFunctionsAgent } from '@cloudsight/azure-functions-agent';
import { GCPCloudFunctionsAgent } from '@cloudsight/gcp-cloud-functions-agent';
import { CloudSightConfig } from './types';

export class AgentFactory {
    static createAgent(config: CloudSightConfig = { enabled: true }) {
        if (AgentFactory.isAWS()) {
            return new AWSLambdaAgent(config);
        } else if (AgentFactory.isAzure()) {
            return new AzureFunctionsAgent(config);
        } else if (AgentFactory.isGCP()) {
            return new GCPCloudFunctionsAgent(config);
        } else {
            throw new Error('Unsupported cloud environment');
        }
    }

    private static isAWS(): boolean {
        return process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
    }

    private static isAzure(): boolean {
        return process.env.WEBSITE_SITE_NAME !== undefined;
    }

    private static isGCP(): boolean {
        return process.env.FUNCTION_TARGET !== undefined || process.env.K_SERVICE !== undefined;
    }
}
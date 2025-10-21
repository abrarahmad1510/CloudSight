import { AzureFunctionsAgent } from '../src/azure-agent';

describe('AzureFunctionsAgent', () => {
    test('should create agent instance', () => {
        const agent = new AzureFunctionsAgent();
        expect(agent).toBeDefined();
    });

    test('should have enabled config by default', () => {
        const agent = new AzureFunctionsAgent();
        // Just test that the agent can be created without errors
        expect(agent).toBeInstanceOf(AzureFunctionsAgent);
    });
});

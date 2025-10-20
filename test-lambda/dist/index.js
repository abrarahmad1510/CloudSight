import { CloudSightAgent } from '@cloudsight/aws-lambda-agent';
console.log('LAMBDA COLD START - CloudSight test function initializing...');
const agent = new CloudSightAgent({
    enabled: true,
    sendMetrics: true,
    logLevel: 'info',
    customDimensions: {
        environment: 'test',
        service: 'test-cloudsight-lambda',
        version: '1.0.0'
    }
});
console.log('CloudSight agent initialized successfully');
export const handler = agent.wrapHandler(async (event, context) => {
    console.log('EVENT RECEIVED:', JSON.stringify(event, null, 2));
    console.log('CONTEXT:', {
        functionName: context.functionName,
        awsRequestId: context.awsRequestId,
        memoryLimitInMB: context.memoryLimitInMB,
        remainingTime: context.getRemainingTimeInMillis()
    });
    // Simulate different types of work
    const workType = event.queryStringParameters?.workType || 'normal';
    const shouldError = Math.random() < 0.2; // 20% chance to error
    console.log(`Processing work type: ${workType}, may error: ${shouldError}`);
    switch (workType) {
        case 'slow':
            await new Promise(resolve => setTimeout(resolve, 300));
            break;
        case 'error':
            throw new Error('Simulated error for testing observability');
        case 'coldstart':
            await new Promise(resolve => setTimeout(resolve, 500));
            break;
        default:
            await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (shouldError) {
        console.error('Throwing random error for testing');
        throw new Error('Random error for testing');
    }
    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            message: 'Hello from CloudSight monitored Lambda!',
            workType: workType,
            timestamp: new Date().toISOString(),
            requestId: context.awsRequestId,
            memoryLimit: context.memoryLimitInMB,
            remainingTime: context.getRemainingTimeInMillis()
        })
    };
    console.log('RETURNING RESPONSE:', JSON.stringify(response));
    return response;
});

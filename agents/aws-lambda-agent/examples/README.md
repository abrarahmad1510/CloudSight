# CloudSight Agent Usage

## Basic Usage

\`\`\`javascript
import { CloudSightAgent } from '@cloudsight/aws-lambda-agent';

// Initialize the CloudSightAgent
const agent = new CloudSightAgent();

// Wrap the Lambda handler with the agent
export const handler = agent.wrapHandler(async (event, context) => {
  // Log the incoming event for debugging
  console.log('Processing event:', JSON.stringify(event, null, 2));
  
  // Business logic here
  const result = { message: 'Success', data: event };
  
  // Return a properly formatted Lambda response
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(result)
  };
});
\`\`\`

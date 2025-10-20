import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

const app = express();
const port = process.env.PORT || 4000;

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start the server
await server.start();

// Apply middleware
app.use(
  '/graphql',
  cors(),
  express.json(),
  expressMiddleware(server)
);

app.listen(port, () => {
  console.log(`🚀 GraphQL Server ready at http://localhost:${port}/graphql`);
  console.log(`�� Try this query:`);
  console.log(`
query GetDashboardMetrics {
  dashboardMetrics(timeRange: ONE_HOUR) {
    totalInvocations
    totalErrors
    errorRate
    avgDuration
    coldStartRate
    activeFunctions
  }
}
  `);
});

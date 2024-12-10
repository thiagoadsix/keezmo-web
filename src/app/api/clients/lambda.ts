import { LambdaClient } from '@aws-sdk/client-lambda';

const isDev = process.env.NODE_ENV !== 'production';

export const lambdaClient = new LambdaClient({
  region: 'us-east-1',
  endpoint: isDev ? 'http://localhost:3002' : undefined,
});

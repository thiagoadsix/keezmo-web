import { LambdaClient } from '@aws-sdk/client-lambda';

const isDev = process.env.NODE_ENV !== 'production';

export const lambdaClient = new LambdaClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: isDev ? 'http://localhost:3002' : undefined,
});

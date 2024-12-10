import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const isDev = process.env.NODE_ENV !== 'production';

const client = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: isDev ? 'http://localhost:4566' : undefined,
});

export const dynamoDbClient = DynamoDBDocumentClient.from(client);

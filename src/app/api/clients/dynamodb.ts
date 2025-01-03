import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const isDev = process.env.NODE_ENV !== 'production';

const client = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: isDev ? 'http://localhost:4566' : undefined,
  credentials: isDev ? undefined : {
    accessKeyId: String(process.env.AWS_ACCESS_KEY_ID),
    secretAccessKey: String(process.env.AWS_SECRET_ACCESS_KEY),
  },
});

export const dynamoDbClient = DynamoDBDocumentClient.from(client);

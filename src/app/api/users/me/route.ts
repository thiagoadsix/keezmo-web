import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient } from '../../clients/dynamodb';

export async function GET(req: NextRequest) {
  const email = req.headers.get('x-user-email');

  if (!email) {
    console.warn('⚠️ [Auth] Unauthorized access attempt');
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const command = new QueryCommand({
    TableName: process.env.DYNAMODB_KEEZMO_TABLE_NAME,
    IndexName: 'EmailIndex',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email
    }
  });

  const response = await dynamoDbClient.send(command);
  const user = response.Items?.[0];

  return NextResponse.json({ user }, { status: 200 });
}

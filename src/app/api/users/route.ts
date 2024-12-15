import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient } from '../clients/dynamodb';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');

  if (!userId) {
    console.warn('⚠️ [Auth] Unauthorized access attempt');
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const command = new GetCommand({
    TableName: process.env.DYNAMODB_KEEZMO_TABLE_NAME,
    Key: {
      pk: `USER#${userId}`,
      sk: `USER#${userId}`
    }
  });

  const response = await dynamoDbClient.send(command);
  const user = response.Item;

  return NextResponse.json({ user }, { status: 200 });
}

import { NextRequest, NextResponse } from 'next/server';
import { UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient } from '../../clients/dynamodb';

interface CreditHistory {
  amount: number;
  type: 'add' | 'use';
  timestamp: string;
  source: string;
}

interface User {
  pk: string;
  sk: string;
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  credits: number;
  hasAccess: boolean;
  customerId?: string;
  creditHistory: CreditHistory[];
  createdAt: number;
  updatedAt: number;
  imageUrl?: string;
}

interface UpdateCreditsRequest {
  amount: number;
  type: 'add' | 'use';
  source: string;
}

export async function POST(req: NextRequest) {
  const userEmail = req.headers.get('x-user-email');

  if (!userEmail) {
    console.warn('⚠️ [Auth] Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: UpdateCreditsRequest = await req.json();
    const timestamp = new Date().toISOString();

    // First get current user data
    const getUserCommand = new GetCommand({
      TableName: process.env.DYNAMODB_KEEZMO_TABLE_NAME,
      Key: {
        pk: `USER#${userEmail}`,
        sk: `USER#${userEmail}`
      }
    });

    const userResponse = await dynamoDbClient.send(getUserCommand);
    const user = userResponse.Item;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate new credits
    const currentCredits = user.credits || 0;
    const newCredits = body.type === 'add'
      ? currentCredits + body.amount
      : currentCredits - body.amount;

    // Don't allow negative credits
    if (newCredits < 0) {
      return NextResponse.json({
        error: 'Insufficient credits',
        currentCredits
      }, { status: 400 });
    }

    // Create new credit history entry
    const creditHistoryEntry: CreditHistory = {
      amount: body.amount,
      type: body.type,
      timestamp,
      source: body.source
    };

    // Update user with new credits and credit history
    const updateCommand = new UpdateCommand({
      TableName: process.env.DYNAMODB_KEEZMO_TABLE_NAME,
      Key: {
        pk: `USER#${userEmail}`,
        sk: `USER#${userEmail}`
      },
      UpdateExpression: 'SET credits = :credits, creditHistory = list_append(if_not_exists(creditHistory, :empty_list), :history)',
      ExpressionAttributeValues: {
        ':credits': newCredits,
        ':history': [creditHistoryEntry],
        ':empty_list': []
      },
      ReturnValues: 'ALL_NEW'
    });

    const result = await dynamoDbClient.send(updateCommand);

    return NextResponse.json({
      credits: result.Attributes?.credits,
      creditHistory: result.Attributes?.creditHistory
    }, { status: 200 });

  } catch (error: any) {
    console.error('Failed to update credits:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
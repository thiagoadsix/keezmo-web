import { NextRequest, NextResponse } from 'next/server';
import { UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient } from '../../clients/dynamodb';

interface CreditHistory {
  amount: number;
  type: 'add' | 'use';
  createdAt: string;
  source: string;
}

interface User {
  pk: string;
  sk: string;
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  credits: {
    plan: number;
    additional: number;
  };
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
    const createdAt = new Date().toISOString();

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

    let { plan, additional } = user.credits;

    // Calculate credit usage prioritizing plan credits first
    if (body.type === 'use') {
      let remainingAmount = body.amount;

      if (plan >= remainingAmount) {
        plan -= remainingAmount;
        remainingAmount = 0;
      } else {
        remainingAmount -= plan;
        plan = 0;
        additional -= remainingAmount;
      }

      if (additional < 0) {
        return NextResponse.json({
          error: 'Insufficient credits',
          currentCredits: user.credits
        }, { status: 400 });
      }
    } else if (body.type === 'add') {
      if (body.source === 'subscription_credit') {
        plan += body.amount;
      } else if (body.source === 'additional_credit') {
        additional += body.amount;
      }
    }

    // Create new credit history entry
    const creditHistoryEntry: CreditHistory = {
      amount: body.amount,
      type: body.type,
      createdAt,
      source: body.source
    };

    // Update user with new credits and credit history
    const updateCommand = new UpdateCommand({
      TableName: process.env.DYNAMODB_KEEZMO_TABLE_NAME,
      Key: {
        pk: `USER#${userEmail}`,
        sk: `USER#${userEmail}`
      },
      UpdateExpression: 'SET credits = :credits, creditHistory = list_append(if_not_exists(creditHistory, :empty_list), :history), updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':credits': { plan, additional },
        ':history': [creditHistoryEntry],
        ':empty_list': [],
        ':updatedAt': new Date().toISOString()
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
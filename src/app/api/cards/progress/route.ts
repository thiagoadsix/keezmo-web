import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { auth } from '@clerk/nextjs/server';
import { dynamoDbClient } from '../../clients/dynamodb';
const TABLE_NAME = process.env.DYNAMODB_KEEZMO_TABLE_NAME || '';

export async function GET(req: NextRequest) {
  console.log('➡️ [GET /api/cards/progress] Request received');

  try {
    const userEmail = req.headers.get('x-user-email');
    console.log(`📍 [Auth] User email from request: ${userEmail || 'none'}`);

    if (!userEmail) {
      console.warn('⚠️ [Auth] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = new URL(req.url).searchParams;
    const deckId = searchParams.get('deckId');

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userEmail}`,
        ':sk': 'CARD_PROGRESS#'
      },
      ...(deckId && {
        FilterExpression: 'deckId = :deckId',
        ExpressionAttributeValues: {
          ':pk': `USER#${userEmail}`,
          ':sk': 'CARD_PROGRESS#',
          ':deckId': deckId
        }
      })
    });

    const response = await dynamoDbClient.send(command);
    console.log(`📦 [DynamoDB] Retrieved ${response.Items?.length || 0} card progress records`);

    return NextResponse.json({ progress: response.Items }, { status: 200 });

  } catch (error: any) {
    console.error('❌ [Error] Failed to fetch card progress:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

interface CardProgressRequest {
  cardId: string;
  deckId: string;
  lastReviewed: string;
  nextReview: string;
  interval: number;
  consecutiveHits: number;
  totalAttempts: number;
  totalErrors: number;
}

export async function POST(req: NextRequest) {
  console.log('➡️ [POST /api/cards/progress] Request received');

  try {
    const userEmail = req.headers.get('x-user-email');
    console.log(`📍 [Auth] User email from request: ${userEmail || 'none'}`);

    if (!userEmail) {
      console.warn('⚠️ [Auth] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CardProgressRequest = await req.json();
    console.log('📝 [Request] Card progress data:', body);

    const timestamp = new Date().toISOString();

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        pk: `USER#${userEmail}`,
        sk: `CARD_PROGRESS#${body.cardId}`,
        cardId: body.cardId,
        deckId: body.deckId,
        lastReviewed: body.lastReviewed,
        nextReview: body.nextReview,
        interval: body.interval,
        consecutiveHits: body.consecutiveHits,
        totalAttempts: body.totalAttempts,
        totalErrors: body.totalErrors,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    });

    await dynamoDbClient.send(command);
    console.log('✨ [DynamoDB] Successfully updated card progress');

    return NextResponse.json({
      message: 'Card progress updated successfully'
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ [Error] Failed to update card progress:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
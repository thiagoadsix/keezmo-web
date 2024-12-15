import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient } from '../clients/dynamodb';

interface Stats {
  totalDecks: number;
  totalCards: number;
  totalStudySessions: number;
}

const TABLE_NAME = process.env.DYNAMODB_KEEZMO_TABLE_NAME || '';

export async function GET(req: NextRequest) {
  console.log('➡️ [GET /api/stats] Request received');

  const userId = req.headers.get('x-user-id');
  console.log(`📍 [Auth] User ID from request: ${userId || 'none'}`);

  if (!userId) {
    console.warn('⚠️ [Auth] Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get decks count
    const decksCommand = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'DECK#'
      }
    });

    // Get study sessions count
    const studySessionsCommand = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'STUDY_SESSION#'
      }
    });

    // Execute both queries in parallel
    const [decksResponse, studySessionsResponse] = await Promise.all([
      dynamoDbClient.send(decksCommand),
      dynamoDbClient.send(studySessionsCommand)
    ]);

    // Get total cards count by querying cards for each deck
    const cardsCountPromises = (decksResponse.Items || []).map(async (deck) => {
      const deckId = String(deck.sk).replace('DECK#', '');
      const cardsCommand = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues: {
          ':pk': `DECK#${deckId}`,
          ':sk': 'CARD#'
        }
      });

      const cardsResponse = await dynamoDbClient.send(cardsCommand);
      return cardsResponse.Items?.length || 0;
    });

    const cardsCountsArray = await Promise.all(cardsCountPromises);
    const totalCards = cardsCountsArray.reduce((sum, count) => sum + count, 0);

    const stats: Stats = {
      totalDecks: decksResponse.Items?.length || 0,
      totalCards: totalCards,
      totalStudySessions: studySessionsResponse.Items?.length || 0
    };

    console.log('✨ [Stats] Calculated statistics:', stats);
    console.log('✅ [Response] Sending successful response');
    return NextResponse.json(stats, { status: 200 });

  } catch (error: any) {
    console.error('❌ [Error] Failed to fetch stats:', {
      error: {
        message: error?.message,
        name: error?.name,
        stack: error?.stack
      },
      userId: userId,
      tableName: TABLE_NAME
    });

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
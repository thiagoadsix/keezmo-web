import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient } from '../clients/dynamodb';

interface Deck {
  deckId: string;
  userId: string;
  title: string;
  description: string;
  createdAt: string;
  totalCards: number;
}

const TABLE_NAME = process.env.DYNAMODB_KEEZMO_TABLE_NAME || '';

export async function GET(req: NextRequest) {
  console.log('➡️ [GET /api/decks] Request received');

  const userId = req.headers.get('x-user-id');
  console.log(`📍 [Auth] User ID from request: ${userId || 'none'}`);

  if (!userId) {
    console.warn('⚠️ [Auth] Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log(`🔍 [DynamoDB] Querying table: ${TABLE_NAME} for user: ${userId}`);
  try {
    // First, get all decks
    const decksCommand = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'DECK#'
      }
    });

    const decksResponse = await dynamoDbClient.send(decksCommand);
    console.log(`📦 [DynamoDB] Retrieved ${decksResponse.Items?.length || 0} decks`);

    // Then, for each deck, get its cards count
    const decksWithCards = await Promise.all((decksResponse.Items || []).map(async (item) => {
      const deckId = String(item.sk).replace('DECK#', '');

      // Query cards for this deck
      const cardsCommand = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues: {
          ':pk': `DECK#${deckId}`,
          ':sk': 'CARD#'
        }
      });

      const cardsResponse = await dynamoDbClient.send(cardsCommand);
      console.log(`📑 [DynamoDB] Retrieved ${cardsResponse.Items?.length || 0} cards for deck ${deckId}`);

      return {
        deckId,
        userId,
        title: String(item.title || ''),
        description: String(item.description || ''),
        createdAt: String(item.createdAt || ''),
        totalCards: cardsResponse.Items?.length || 0
      };
    }));

    console.log('✨ [Transform] Successfully mapped DynamoDB items to Deck objects with card counts');
    console.log('✅ [Response] Sending successful response');
    return NextResponse.json({ decks: decksWithCards }, { status: 200 });

  } catch (error: any) {
    console.error('❌ [Error] Failed to fetch decks:', {
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

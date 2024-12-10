import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient } from '../../../clients/dynamodb';

interface Card {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

const TABLE_NAME = process.env.DYNAMODB_MEMORA_TABLE_NAME || '';

export async function GET(
  req: NextRequest,
  { params }: { params: { deckId: string } }
) {
  console.log('➡️ [GET /api/decks/:deckId/cards] Request received');

  const userId = req.headers.get('x-user-id');
  const { deckId } = params;

  console.log(`📍 [Auth] User ID from request: ${userId || 'none'}`);
  console.log(`📍 [Params] Deck ID: ${deckId}`);

  if (!userId) {
    console.warn('⚠️ [Auth] Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues: {
        ':pk': `DECK#${deckId}`,
        ':sk': 'CARD#'
      }
    });

    const response = await dynamoDbClient.send(command);
    console.log(`📦 [DynamoDB] Retrieved ${response.Items?.length || 0} cards`);

    const cards = (response.Items || []).map((item): Card => ({
      id: String(item.sk).replace('CARD#', ''),
      question: String(item.question),
      options: item.options as string[],
      correctAnswer: String(item.correctAnswer)
    }));

    console.log('✨ [Transform] Successfully mapped DynamoDB items to Card objects');
    console.log('✅ [Response] Sending successful response');
    return NextResponse.json({ cards }, { status: 200 });

  } catch (error: any) {
    console.error('❌ [Error] Failed to fetch cards:', {
      error: {
        message: error?.message,
        name: error?.name,
        stack: error?.stack
      },
      userId,
      deckId,
      tableName: TABLE_NAME
    });

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
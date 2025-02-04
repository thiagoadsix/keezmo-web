import { NextResponse } from 'next/server';
import { QueryCommand, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient } from '../../../clients/dynamodb';
import { Card } from '@/types/card';

const TABLE_NAME = process.env.DYNAMODB_KEEZMO_TABLE_NAME || '';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ deckId: string }> }
) {
  console.log('➡️ [GET /api/decks/:deckId/cards] Request received');
  const deckId = (await params).deckId

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

    const cards: Card[] = (response.Items || []).map((item): Card => ({
      id: String(item.sk).replace('CARD#', ''),
      question: String(item.question),
      options: item.options as string[],
      correctAnswer: String(item.correctAnswer)
    }));

    return NextResponse.json(cards, { status: 200 });
  } catch (error: any) {
    console.error('❌ [Error] Failed to fetch cards:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ deckId: string }> }
) {
  console.log('➡️ [PUT /api/decks/:deckId/cards] Request received');
  const deckId = (await params).deckId;

  try {
    const result = await request.json();
    const timestamp = new Date().toISOString();

    const updatePromises = result.map(async (card: Card) => {
      const getCommand = new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: `DECK#${deckId}`,
          sk: `CARD#${card.id}`
        }
      });

      const existingCard = await dynamoDbClient.send(getCommand);
      if (!existingCard.Item) {
        throw new Error(`Card ${card.id} not found`);
      }

      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...existingCard.Item,
          pk: `DECK#${deckId}`,
          sk: `CARD#${card.id}`,
          question: card.question,
          correctAnswer: card.correctAnswer,
          options: card.options,
          updatedAt: timestamp
        },
        ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)'
      });

      return dynamoDbClient.send(command);
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ });
  } catch (error: any) {
    console.error('❌ [Error] Failed to update cards:', error);
    return NextResponse.json({ error: 'Failed to update cards' }, { status: 500 });
  }
}

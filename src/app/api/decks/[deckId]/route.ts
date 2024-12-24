import { NextRequest, NextResponse } from 'next/server';
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient } from '../../clients/dynamodb';

const TABLE_NAME = process.env.DYNAMODB_KEEZMO_TABLE_NAME || '';

export async function GET(
  req: NextRequest,
  { params }: { params: { deckId: string } }
) {
  const userEmail = req.headers.get('x-user-email');

  if (!userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `USER#${userEmail}`,
        sk: `DECK#${params.deckId}`
      }
    });

    const response = await dynamoDbClient.send(command);

    if (!response.Item) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    return NextResponse.json(response.Item);
  } catch (error: any) {
    console.error('Failed to fetch deck:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deck' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { deckId: string } }
) {
  const userEmail = req.headers.get('x-user-email');

  if (!userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const timestamp = new Date().toISOString();

    // Primeiro, buscar o item existente
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `USER#${userEmail}`,
        sk: `DECK#${params.deckId}`
      }
    });

    const existingItem = await dynamoDbClient.send(getCommand);

    // Preparar o item atualizado preservando campos existentes
    const updatedItem = {
      ...existingItem.Item, // Preserva todos os campos existentes
      ...body, // Aplica as atualizações
      pk: `USER#${userEmail}`, // Garante que pk e sk não sejam alterados
      sk: `DECK#${params.deckId}`,
      updatedAt: timestamp
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: updatedItem,
      ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)'
    });

    await dynamoDbClient.send(command);

    return NextResponse.json({ message: 'Deck updated successfully' });
  } catch (error: any) {
    console.error('Failed to update deck:', error);
    return NextResponse.json(
      { error: 'Failed to update deck' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient } from '../clients/dynamodb';
import { auth } from '@clerk/nextjs/server';

const TABLE_NAME = process.env.DYNAMODB_KEEZMO_TABLE_NAME || '';

export async function GET(req: NextRequest) {
  console.log('➡️ [GET /api/decks] Request received');

  try {
    const userEmail = req.headers.get('x-user-email');
    console.log(`📍 [Auth] User email from request: ${userEmail || 'none'}`);

    if (!userEmail) {
      console.warn('⚠️ [Auth] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`🔍 [DynamoDB] Querying table: ${TABLE_NAME} for user: ${userEmail}`);

    // First, get all decks
    const decksCommand = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userEmail}`,
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
      tableName: TABLE_NAME
    });

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

interface Card {
  question: string;
  correctAnswer: string;
  options: string[];
}

interface CreateDeckRequest {
  title: string;
  description: string;
  cards: Card[];
}

export async function POST(req: NextRequest) {
  console.log('➡️ [POST /api/decks] Request received');

  try {
    const userEmail = req.headers.get('x-user-email');
    console.log(`📍 [Auth] User email from request: ${userEmail || 'none'}`);

    if (!userEmail) {
      console.warn('⚠️ [Auth] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateDeckRequest = await req.json();
    console.log('📝 [Request] Deck creation data:', body);

    // Validate request
    if (!body.title || !body.cards || body.cards.length === 0) {
      return NextResponse.json(
        { error: 'Title and at least one card are required' },
        { status: 400 }
      );
    }

    // Generate IDs and timestamp
    const deckId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // Create deck
    const createDeckCommand = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        pk: `USER#${userEmail}`,
        sk: `DECK#${deckId}`,
        title: body.title,
        description: body.description || '',
        createdAt: timestamp,
        updatedAt: timestamp
      }
    });

    // Create cards
    const cardCommands = body.cards.map((card, index) => {
      const cardId = crypto.randomUUID();
      return new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          pk: `DECK#${deckId}`,
          sk: `CARD#${cardId}`,
          id: cardId,
          deckId,
          question: card.question,
          options: [...card.options, card.correctAnswer].sort(() => Math.random() - 0.5), // Shuffle options including correct answer
          correctAnswer: card.correctAnswer,
          createdAt: timestamp,
          updatedAt: timestamp,
          order: index
        }
      });
    });

    // Execute all commands in parallel
    await Promise.all([
      dynamoDbClient.send(createDeckCommand),
      ...cardCommands.map(command => dynamoDbClient.send(command))
    ]);

    console.log('✨ [DynamoDB] Successfully created deck and cards:', {
      deckId,
      totalCards: body.cards.length
    });

    return NextResponse.json({
      deckId,
      title: body.title,
      description: body.description,
      totalCards: body.cards.length,
      createdAt: timestamp
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ [Error] Failed to create deck:', {
      error: {
        message: error?.message,
        name: error?.name,
        stack: error?.stack
      },
      tableName: TABLE_NAME
    });

    return NextResponse.json(
      { error: 'Failed to create deck' },
      { status: 500 }
    );
  }
}

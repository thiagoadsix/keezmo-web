import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient } from '../clients/dynamodb';

interface StudySession {
  id: string;
  userId: string;
  deckId: string;
  hits: number;
  misses: number;
  totalQuestions: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  deck?: {
    title: string;
    description: string;
    totalCards: number;
  };
}

const TABLE_NAME = process.env.DYNAMODB_KEEZMO_TABLE_NAME || '';

export async function GET(req: NextRequest) {
  console.log('➡️ [GET /api/study-sessions] Request received');

  const userId = req.headers.get('x-user-id');
  console.log(`📍 [Auth] User ID from request: ${userId || 'none'}`);

  if (!userId) {
    console.warn('⚠️ [Auth] Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log(`🔍 [DynamoDB] Querying table: ${TABLE_NAME} for user: ${userId}`);
  try {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'STUDY_SESSION#'
      }
    });

    const response = await dynamoDbClient.send(command);
    console.log(`📦 [DynamoDB] Retrieved ${response.Items?.length || 0} study sessions`);

    // Get study sessions with their associated decks
    const studySessions = await Promise.all((response.Items || []).map(async (item): Promise<StudySession> => {
      const deckId = String(item.deckId);

      // Get deck information
      const deckCommand = new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: `USER#${userId}`,
          sk: `DECK#${deckId}`
        }
      });

      // Get deck's cards count
      const cardsCommand = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues: {
          ':pk': `DECK#${deckId}`,
          ':sk': 'CARD#'
        }
      });

      const [deckResponse, cardsResponse] = await Promise.all([
        dynamoDbClient.send(deckCommand),
        dynamoDbClient.send(cardsCommand)
      ]);

      console.log(`📚 [DynamoDB] Retrieved deck and cards info for deck ${deckId}`);

      return {
        id: String(item.id),
        userId: String(item.userId),
        deckId: deckId,
        hits: Number(item.hits),
        misses: Number(item.misses),
        totalQuestions: Number(item.totalQuestions),
        startTime: String(item.startTime),
        endTime: String(item.endTime),
        createdAt: String(item.createdAt),
        deck: deckResponse.Item ? {
          title: String(deckResponse.Item.title),
          description: String(deckResponse.Item.description),
          totalCards: cardsResponse.Items?.length || 0
        } : undefined
      };
    }));

    console.log('✨ [Transform] Successfully mapped DynamoDB items to StudySession objects with deck info');
    console.log('✅ [Response] Sending successful response');
    return NextResponse.json({ studySessions }, { status: 200 });

  } catch (error: any) {
    console.error('❌ [Error] Failed to fetch study sessions:', {
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

interface CreateStudySessionRequest {
  deckId: string;
  hits: number;
  misses: number;
  totalQuestions: number;
  startTime: string;
  endTime: string;
}

export async function POST(req: NextRequest) {
  console.log('➡️ [POST /api/study-sessions] Request received');

  const userId = req.headers.get('x-user-id');
  console.log(`📍 [Auth] User ID from request: ${userId || 'none'}`);

  if (!userId) {
    console.warn('⚠️ [Auth] Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: CreateStudySessionRequest = await req.json();
    const sessionId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    console.log('📝 [Request] Study session data:', body);

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        pk: `USER#${userId}`,
        sk: `STUDY_SESSION#${sessionId}`,
        id: sessionId,
        userId: userId,
        deckId: body.deckId,
        hits: body.hits,
        misses: body.misses,
        totalQuestions: body.totalQuestions,
        startTime: body.startTime,
        endTime: body.endTime,
        createdAt: timestamp
      }
    });

    await dynamoDbClient.send(command);
    console.log('✨ [DynamoDB] Successfully created study session');

    return NextResponse.json({
      id: sessionId,
      ...body,
      userId,
      createdAt: timestamp
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ [Error] Failed to create study session:', {
      error: {
        message: error?.message,
        name: error?.name,
        stack: error?.stack
      },
      userId,
      tableName: TABLE_NAME
    });

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

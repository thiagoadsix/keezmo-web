import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient } from '../clients/dynamodb';
import { StudySession } from '@/types/study';

const TABLE_NAME = process.env.DYNAMODB_KEEZMO_TABLE_NAME || '';

export async function GET(req: NextRequest) {
  console.log('➡️ [GET /api/study-sessions] Request received');

  try {
    const userEmail = req.headers.get('x-user-email');
    console.log(`📍 [Auth] User email from request: ${userEmail || 'none'}`);

    if (!userEmail) {
      console.warn('⚠️ [Auth] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`🔍 [DynamoDB] Querying table: ${TABLE_NAME} for user: ${userEmail}`);

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userEmail}`,
        ':sk': 'STUDY_SESSION#'
      }
    });

    const response = await dynamoDbClient.send(command);
    console.log(`📦 [DynamoDB] Retrieved ${response.Items?.length || 0} study sessions`);

    const studySessions: StudySession[] = await Promise.all((response.Items || []).map(async (item): Promise<StudySession> => {
      const deckId = String(item.deckId);

      const deckCommand = new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: `USER#${userEmail}`,
          sk: `DECK#${deckId}`
        }
      });

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
        deckId,
        hits: Number(item.hits),
        misses: Number(item.misses),
        totalQuestions: Number(item.totalQuestions),
        startTime: String(item.startTime),
        endTime: String(item.endTime),
        createdAt: String(item.createdAt),
        questionsMetadata: item.questionsMetadata,
        deck: deckResponse.Item ? {
          id: String(deckResponse.Item.id),
          title: String(deckResponse.Item.title),
          description: String(deckResponse.Item.description),
          totalCards: cardsResponse.Items?.length || 0
        } : undefined
      };
    }));

    console.log('✨ [Transform] Successfully mapped DynamoDB items to StudySession objects with deck info');
    console.log('✅ [Response] Sending successful response');
    return NextResponse.json(studySessions, { status: 200 });

  } catch (error: any) {
    console.error('❌ [Error] Failed to fetch study sessions:', {
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

interface QuestionMetadata {
  questionId: string;
  attempts: number;
  errors: number;
}

interface CreateStudySessionRequest {
  deckId: string;
  hits: number;
  misses: number;
  totalQuestions: number;
  startTime: string;
  endTime: string;
  questionsMetadata: QuestionMetadata[];
}

export async function POST(req: NextRequest) {
  console.log('➡️ [POST /api/study-sessions] Request received');
  console.log('Request URL:', req.url);

  try {
    const userEmail = req.headers.get('x-user-email');
    console.log(`📍 [Auth] User email from request: ${userEmail || 'none'}`);

    if (!userEmail) {
      console.warn('⚠️ [Auth] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateStudySessionRequest = await req.json();
    const sessionId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    console.log('📝 [Request] Study session data:', body);

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        pk: `USER#${userEmail}`,
        sk: `STUDY_SESSION#${sessionId}`,
        id: sessionId,
        deckId: body.deckId,
        hits: body.hits,
        misses: body.misses,
        totalQuestions: body.totalQuestions,
        startTime: body.startTime,
        endTime: body.endTime,
        createdAt: timestamp,
        questionsMetadata: body.questionsMetadata,
      }
    });

    await dynamoDbClient.send(command);
    console.log('✨ [DynamoDB] Successfully created study session');

    return NextResponse.json({
      id: sessionId,
      ...body,
      createdAt: timestamp
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ [Error] Failed to create study session:', {
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

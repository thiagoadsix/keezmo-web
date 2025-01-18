import { NextRequest, NextResponse } from "next/server";
import { QueryCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDbClient } from "../../clients/dynamodb";
import { StudySession } from "@/types/study";

const TABLE_NAME = process.env.DYNAMODB_KEEZMO_TABLE_NAME

export async function GET(req: NextRequest) {
  try {
    const userEmail = req.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
      FilterExpression: "studyType = :studyType",
      ExpressionAttributeValues: {
        ":pk": `USER#${userEmail}`,
        ":sk": "STUDY_SESSION#",
        ":studyType": "multipleChoice"
      },
    });

    const response = await dynamoDbClient.send(command);

    const studySessions: StudySession[] = await Promise.all(
      (response.Items || []).map(async (item): Promise<StudySession> => {
        const deckId = String(item.deckId);

        const deckCommand = new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            pk: `USER#${userEmail}`,
            sk: `DECK#${deckId}`,
          },
        });

        const cardsCommand = new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
          ExpressionAttributeValues: {
            ":pk": `DECK#${deckId}`,
            ":sk": "CARD#",
          },
        });

        const [deckResponse, cardsResponse] = await Promise.all([
          dynamoDbClient.send(deckCommand),
          dynamoDbClient.send(cardsCommand),
        ]);

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
          studyType: item.studyType as "multipleChoice" | "flashcard",
          deck: deckResponse.Item
            ? {
                id: String(deckResponse.Item.id),
                title: String(deckResponse.Item.title),
                description: String(deckResponse.Item.description),
                totalCards: cardsResponse.Items?.length || 0,
              }
            : undefined,
        };
      })
    );

    return NextResponse.json(studySessions, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

type Request = Pick<
  StudySession,
  | "deckId"
  | "hits"
  | "misses"
  | "totalQuestions"
  | "startTime"
  | "endTime"
  | "questionsMetadata"
  | "studyType"
>;

export async function POST(req: NextRequest) {
  try {
    const userEmail = req.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: Request = await req.json();
    const sessionId = crypto.randomUUID();

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        pk: `USER#${userEmail}`,
        sk: `STUDY_SESSION#${sessionId}`,
        id: sessionId,
        createdAt: new Date().toISOString(),
        deckId: body.deckId,
        studyType: body.studyType,
        totalQuestions: body.totalQuestions,
        startTime: body.startTime,
        endTime: body.endTime,
        hits: body.hits,
        misses: body.misses,
        questionsMetadata: body.questionsMetadata,
      },
    });

    await dynamoDbClient.send(command);

    return NextResponse.json({ }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

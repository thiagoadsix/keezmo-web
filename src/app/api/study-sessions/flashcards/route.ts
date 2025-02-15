import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { NextRequest, NextResponse } from "next/server";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { StudySession } from "@/types/study";
import { dynamoDbClient } from "../../clients/dynamodb";

const TABLE_NAME = process.env.DYNAMODB_KEEZMO_TABLE_NAME;

export async function GET(req: NextRequest) {
  const userEmail = req.headers.get("x-user-email");

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const searchText = searchParams.get("searchText");

  const filterExpressions = [
    "studyType = :studyType",
    ...(startDate ? ["createdAt >= :startDate"] : []),
    ...(endDate ? ["createdAt <= :endDate"] : []),
    ...(searchText ? ["contains(deck.title, :searchText) OR contains(deck.description, :searchText)"] : []),
  ];

  const expressionAttributeValues = {
    ":pk": `USER#${userEmail}`,
    ":sk": "STUDY_SESSION#",
    ":studyType": "flashcard",
    ...(startDate && { ":startDate": startDate }),
    ...(endDate && { ":endDate": endDate }),
    ...(searchText && { ":searchText": searchText }),
  };

  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
    FilterExpression: filterExpressions.join(" AND "),
    ExpressionAttributeValues: expressionAttributeValues,
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

      const deck = deckResponse.Item;
      const cards = cardsResponse.Items;

      return {
        id: String(item.id),
        deckId,
        totalQuestions: Number(item.totalQuestions),
        startTime: String(item.startTime),
        endTime: String(item.endTime),
        createdAt: String(item.createdAt),
        studyType: item.studyType as "multipleChoice" | "flashcard",
        ratings: item.ratings,
        deck: deck
          ? {
              id: deckId,
              title: String(deck.title),
              description: String(deck.description),
              totalCards: cards?.length || 0,
            }
          : undefined,
      };
    })
  );

  console.log(studySessions);

  return NextResponse.json(studySessions, { status: 200 });
}

type Request = Pick<
  StudySession,
  | "deckId"
  | "totalQuestions"
  | "startTime"
  | "endTime"
  | "studyType"
  | "ratings"
>;

export async function POST(req: NextRequest) {
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
      ratings: body.ratings,
    },
  });

  await dynamoDbClient.send(command);

  return NextResponse.json({ }, { status: 201 });
}

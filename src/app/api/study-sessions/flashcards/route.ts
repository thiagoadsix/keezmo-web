import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { NextRequest, NextResponse } from "next/server";
import { StudySession } from "@/types/study";
import { dynamoDbClient } from "../../clients/dynamodb";

const TABLE_NAME = process.env.DYNAMODB_KEEZMO_TABLE_NAME;

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

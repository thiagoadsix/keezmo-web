import { NextRequest, NextResponse } from "next/server";
import { QueryCommand, GetCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { StudySession } from "@/types/study";
import { dynamoDbClient } from "../clients/dynamodb";

const TABLE_NAME = process.env.DYNAMODB_KEEZMO_TABLE_NAME

export async function GET(req: NextRequest) {
  try {
    const userEmail = req.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const searchText = searchParams.get("searchText");
    const studyType = searchParams.get("studyType");

    const filterExpressions = [
      ...(studyType ? ["studyType = :studyType"] : []),
      ...(startDate ? ["createdAt >= :startDate"] : []),
      ...(endDate ? ["createdAt <= :endDate"] : []),
      ...(searchText ? ["contains(deck.title, :searchText) OR contains(deck.description, :searchText)"] : []),
    ];

    const expressionAttributeValues = {
      ":pk": `USER#${userEmail}`,
      ":sk": "STUDY_SESSION#",
      ...(studyType && { ":studyType": studyType }),
      ...(startDate && { ":startDate": startDate }),
      ...(endDate && { ":endDate": endDate }),
      ...(searchText && { ":searchText": searchText }),
    };

    const queryCommandInput: QueryCommandInput = {
      TableName: TABLE_NAME,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
      ExpressionAttributeValues: expressionAttributeValues,
      ...(filterExpressions.length > 0 && {
        FilterExpression: filterExpressions.join(" AND "),
      }),
    };

    const command = new QueryCommand(queryCommandInput);

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
          ratings: item.ratings,
          deck: deckResponse.Item
            ? {
                id: deckId,
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
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
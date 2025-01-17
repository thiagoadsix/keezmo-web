import { NextRequest, NextResponse } from "next/server";
import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDbClient } from "../../../clients/dynamodb";
import { CardProgress } from "@/types/card-progress";

const TABLE_NAME = process.env.DYNAMODB_KEEZMO_TABLE_NAME

export async function GET(req: NextRequest) {
  try {
    const userEmail = req.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = new URL(req.url).searchParams;
    const deckId = searchParams.get("deckId");

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userEmail}`,
        ":sk": "CARD_PROGRESS#",
        ":type": "flashcard",
        ":deckId": deckId
      },
      FilterExpression: "type = :type AND deckId = :deckId",

    });
    const response = await dynamoDbClient.send(command);

    const responseItems: CardProgress[] = (response.Items || []).map((item) => {
      return item as CardProgress;
    });

    return NextResponse.json(responseItems, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userEmail = req.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CardProgress = await req.json();

    const now = new Date().toISOString();

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        pk: `USER#${userEmail}`,
        sk: `CARD_PROGRESS#${body.cardId}`,
        cardId: body.cardId,
        deckId: body.deckId,
        rating: body.rating,
        lastReviewed: body.lastReviewed || now,
        nextReview: body.nextReview || now,
        interval: body.interval || 0,
        createdAt: now,
        updatedAt: now,
        type: "flashcard",
      },
    });

    await dynamoDbClient.send(command);

    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

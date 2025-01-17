import { NextRequest, NextResponse } from "next/server";
import { QueryCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
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

    if (!deckId) {
      return NextResponse.json({ error: "Deck ID is required" }, { status: 400 });
    }

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
      FilterExpression: "cardType = :cardType AND deckId = :deckId",
      ExpressionAttributeValues: {
        ":pk": `USER#${userEmail}`,
        ":sk": "CARD_PROGRESS#",
        ":cardType": "flashcard",
        ":deckId": deckId,
      },
    });

    const response = await dynamoDbClient.send(command);

    if (!response.Items) {
      return NextResponse.json([], { status: 200 });
    }

    const responseItems: CardProgress[] = response.Items.map((item: any) => {
      const cardProgress: CardProgress = {
        cardType: item.cardType,
        consecutiveHits: item.consecutiveHits,
        createdAt: item.createdAt,
        deckId: item.deckId,
        cardId: item.cardId,
        totalAttempts: item.totalAttempts,
        totalErrors: item.totalErrors,
        nextReview: item.nextReview,
        interval: item.interval,
        lastReviewed: item.lastReviewed,
        updatedAt: item.updatedAt,
        rating: item.rating,
        easyCount: item.easyCount || 0,
        normalCount: item.normalCount || 0,
        hardCount: item.hardCount || 0,
      };
      return cardProgress;
    });

    return NextResponse.json(responseItems, { status: 200 });
  } catch (error: any) {
    console.error("Erro na rota GET de Card Progress:", error);
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

    // Determina qual contador incrementar com base no rating
    let ratingCounter: Record<string, number> = {};
    switch (body.rating) {
      case "easy":
        ratingCounter = { easyCount: 1 };
        break;
      case "normal":
        ratingCounter = { normalCount: 1 };
        break;
      case "hard":
        ratingCounter = { hardCount: 1 };
        break;
      default:
        ratingCounter = {};
    }

    const updateExpressions = [];
    const expressionAttributeValues: Record<string, any> = {
      ":deckId": body.deckId,
      ":rating": body.rating,
      ":lastReviewed": body.lastReviewed || now,
      ":nextReview": body.nextReview || now,
      ":interval": body.interval || 0,
      ":totalAttempts": body.totalAttempts || 0,
      ":totalErrors": body.totalErrors || 0,
      ":updatedAt": now,
      ":zero": 0,
    };

    // Construir as expressões de atualização dinamicamente
    if (body.rating === "easy") {
      updateExpressions.push("easyCount = if_not_exists(easyCount, :zero) + :easyInc");
      expressionAttributeValues[":easyInc"] = ratingCounter.easyCount;
    }
    if (body.rating === "normal") {
      updateExpressions.push("normalCount = if_not_exists(normalCount, :zero) + :normalInc");
      expressionAttributeValues[":normalInc"] = ratingCounter.normalCount;
    }
    if (body.rating === "hard") {
      updateExpressions.push("hardCount = if_not_exists(hardCount, :zero) + :hardInc");
      expressionAttributeValues[":hardInc"] = ratingCounter.hardCount;
    }

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `USER#${userEmail}`,
        sk: `CARD_PROGRESS#${body.cardId}`,
      },
      UpdateExpression: `
        SET
          deckId = :deckId,
          rating = :rating,
          lastReviewed = :lastReviewed,
          nextReview = :nextReview,
          interval = :interval,
          totalAttempts = :totalAttempts,
          totalErrors = :totalErrors,
          updatedAt = :updatedAt
        ${updateExpressions.length > 0 ? ", " + updateExpressions.join(", ") : ""}
      `,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "UPDATED_NEW",
    });

    await dynamoDbClient.send(command);

    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

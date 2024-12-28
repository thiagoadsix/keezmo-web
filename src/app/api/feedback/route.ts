import config from "@/config";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { s3Client } from "../clients/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { dynamoDbClient } from "../clients/dynamodb";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = String(process.env.DYNAMODB_KEEZMO_TABLE_NAME);

export async function POST(req: NextRequest) {
  const userEmail = req.headers.get("x-user-email");
  const { title, detail, image, type } = await req.json();

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const feedbackId = randomUUID();

  const imageKey = `feedbacks/${type}/${userEmail}/${feedbackId}.${image.split(';')[0].split('/')[1]}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.aws.bucket,
      Key: imageKey,
      Body: Buffer.from(image.split(",")[1], "base64"),
      ContentEncoding: "base64",
      ContentType: image.split(";")[0].split(":")[1],
    }),
  );

  await dynamoDbClient.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        pk: { S: `USER#${userEmail}` },
        sk: { S: `FEEDBACK#${feedbackId}` },
        id: { S: feedbackId },
        type: { S: type },
        title: { S: title },
        detail: { S: detail },
        imageKey: { S: imageKey },
        userEmail: { S: userEmail },
      },
    }),
  );

  return NextResponse.json({}, { status: 200 });
}

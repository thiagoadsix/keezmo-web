import { useAuth } from "@clerk/clerk-react";
import { NextResponse, NextRequest } from "next/server";
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

import { createCustomerPortal } from "@/src/lib/stripe";
import { dynamoDbClient } from "../../clients/dynamodb";

export async function POST(req: NextRequest) {
  try {
    const email = req.headers.get('x-user-email');

    const body = await req.json();

    const entity = await dynamoDbClient.send(new QueryCommand({
      TableName: process.env.DYNAMODB_KEEZMO_TABLE_NAME!,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email
      }
    }));
    const user = entity.Items?.[0]
    console.log("body", body);
    console.log("user", user);

    if (!email) {
      return NextResponse.json(
        { error: "You must be logged in to view billing information." },
        { status: 401 }
      );
    } else if (!body.returnUrl) {
      return NextResponse.json(
        { error: "Return URL is required" },
        { status: 400 }
      );
    }

    if (!user?.customerId) {
      return NextResponse.json(
        {
          error: "You don't have a billing account yet. Make a purchase first.",
        },
        { status: 400 }
      );
    }

    const stripePortalUrl = await createCustomerPortal({
      customerId: user.customerId,
      returnUrl: body.returnUrl,
    });

    return NextResponse.json({
      url: stripePortalUrl,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
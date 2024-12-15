import { useAuth } from "@clerk/nextjs/dist/types/client-boundary/hooks";
import { NextResponse, NextRequest } from "next/server";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

import { createCustomerPortal } from "@/src/lib/stripe";
import { dynamoDbClient } from "../../clients/dynamodb";

export async function POST(req: NextRequest) {
  try {
    const { userId } = useAuth();

    const body = await req.json();

    const entity = await dynamoDbClient.send(new GetCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME!,
      Key: {
        pk: `USER#${userId}`,
        sk: `USER#${userId}`
      }
    }));
    const user = entity.Item

    // User who are not logged in can't make a purchase
    if (!userId) {
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
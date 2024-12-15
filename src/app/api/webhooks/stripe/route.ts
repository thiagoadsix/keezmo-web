import Stripe from "stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

import { findCheckoutSession } from "@/src/lib/stripe";
import { dynamoDbClient } from "../../clients/dynamodb";

const stripeSecretKey = String(process.env.STRIPE_SECRET_KEY);
const stripeWebhookSecret = String(process.env.STRIPE_WEBHOOK_SECRET);

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});

interface StripePlanInfo {
  name: string;
  credits: number;
}

const STRIPE_PLANS: { [key: string]: StripePlanInfo } = {
  "price_1Pz883FZzZzZzZzZzZzZzZzZ": {
    name: "pro",
    credits: 500
  },
  "price_2Pz883FZzZzZzZzZzZzZzZzZ": {
    name: "pro",
    credits: 500
  },
  "price_3Pz883FZzZzZzZzZzZzZzZzZ": {
    name: "pro",
    credits: 500
  }
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headerPayload = await headers();
  const signature = String(headerPayload.get("stripe-signature"));

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let eventType: any;
  let event: any;

  try {
    event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
  } catch (error) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed":
        const stripeObject: Stripe.Checkout.Session = event.data.object as Stripe.Checkout.Session;
        const session = await findCheckoutSession(stripeObject.id);

        const customerId = session?.customer;
        const priceId = session?.line_items?.data[0]?.price?.id!;
        const planInfo = STRIPE_PLANS[priceId];

        const customer = (await stripe.customers.retrieve(
          customerId as string
        )) as Stripe.Customer;

        if (!planInfo) break;

        interface CreditHistory {
          amount: number;
          type: 'add' | 'use';
          timestamp: number;
          source: string;
        }

        try {
          // Get user email from Stripe customer
          const userEmail = customer.email;
          if (!userEmail) throw new Error("No email found for customer");

          // Validate session exists
          if (!session || !session.metadata?.userId) {
            throw new Error("Invalid session or missing userId");
          }

          // Prepare the credit history entry for the plan purchase
          const creditHistoryEntry: CreditHistory = {
            amount: planInfo.credits,
            type: 'add',
            timestamp: Date.now(),
            source: 'stripe_purchase'
          };

          const userId = session.metadata.userId;

          // Update user in DynamoDB
          await dynamoDbClient.send(new UpdateCommand({
            TableName: process.env.DYNAMODB_TABLE_NAME!,
            Key: {
              pk: `USER#${userId}`,
              sk: `USER#${userId}`
            },
            UpdateExpression:
              'SET credits = credits + :credits, ' +
              'hasAccess = :hasAccess, ' +
              'customerId = :customerId, ' +
              'updatedAt = :updatedAt, ' +
              'creditHistory = list_append(if_not_exists(creditHistory, :empty_list), :creditHistory)',
            ExpressionAttributeValues: {
              ':credits': planInfo.credits,
              ':hasAccess': true,
              ':customerId': customerId,
              ':updatedAt': Date.now(),
              ':creditHistory': [creditHistoryEntry],
              ':empty_list': []
            },
            ReturnValues: 'ALL_NEW'
          }));

        } catch (error) {
          console.error('Error updating user in DynamoDB:', error);
          throw error;
        }

        break;

      case "customer.subscription.deleted": {
        const stripeObject: Stripe.CustomerSubscriptionDeletedEvent = event.data.object as Stripe.CustomerSubscriptionDeletedEvent;
        const subscription = await stripe.subscriptions.retrieve(
          stripeObject.id
        );

        const customerId = subscription.customer;
        const userId = subscription.metadata.userId;

        if (!customerId || !userId) break;

        await dynamoDbClient.send(new UpdateCommand({
          TableName: process.env.DYNAMODB_TABLE_NAME!,
          Key: {
            pk: `USER#${userId}`,
            sk: `USER#${userId}`
          },
          UpdateExpression: 'SET hasAccess = :hasAccess, updatedAt = :updatedAt',
          ExpressionAttributeValues: {
            ':hasAccess': false,
            ':updatedAt': Date.now()
          },
          ReturnValues: 'ALL_NEW'
        }));

        break;
      }

      case "invoice.paid": {
        const stripeObject: Stripe.Invoice = event.data.object as Stripe.Invoice;
        const invoice = await stripe.invoices.retrieve(stripeObject.id);
        const customerId = invoice.customer;
        const userId = invoice.metadata?.userId;

        if (!customerId || !userId) break;

        await dynamoDbClient.send(new UpdateCommand({
          TableName: process.env.DYNAMODB_TABLE_NAME!,
          Key: {
            pk: `USER#${userId}`,
            sk: `USER#${userId}`
          },
          UpdateExpression: 'SET hasAccess = :hasAccess, updatedAt = :updatedAt',
          ExpressionAttributeValues: {
            ':hasAccess': true,
            ':updatedAt': Date.now()
          },
          ReturnValues: 'ALL_NEW'
        }));

        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
        break;
    }
  } catch (error) {
    console.error("stripe error: ", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({});
}
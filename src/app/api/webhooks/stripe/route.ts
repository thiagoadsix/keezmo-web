import Stripe from "stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { PutCommand, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

import { findCheckoutSession } from "@/src/lib/stripe";
import { dynamoDbClient } from "../../clients/dynamodb";
import config from "@/config";
import PurchaseConfirmation from "@/src/components/emails/purchase-confirmation";
import { resendClient } from "../../clients/resend";

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
  [config.stripe.plans[0].priceId]: {
    name: config.stripe.plans[0].name,
    credits: config.stripe.plans[0].credits
  },
  [config.stripe.plans[1].priceId]: {
    name: config.stripe.plans[1].name,
    credits: config.stripe.plans[1].credits
  },
  [config.stripe.plans[2].priceId]: {
    name: config.stripe.plans[2].name,
    credits: config.stripe.plans[2].credits
  }
};

export async function POST(req: NextRequest) {
  console.log('Received Stripe webhook event')
  const body = await req.text();
  const headerPayload = await headers();
  const signature = String(headerPayload.get("stripe-signature"));

  if (!signature) {
    console.error('Webhook Error: Missing Stripe signature')
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let eventType: any;
  let event: any;

  try {
    event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
    console.log('Webhook event verified:', eventType)
  } catch (error) {
    console.error('Webhook Error: Invalid signature', error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed":
        console.log('Processing checkout.session.completed')
        const stripeObject: Stripe.Checkout.Session = event.data.object as Stripe.Checkout.Session;
        const session = await findCheckoutSession(stripeObject.id);

        console.log('Checkout session found:', {
          sessionId: stripeObject.id,
          customerId: session?.customer,
          userId: session?.client_reference_id
        })

        const customerId = session?.customer;
        const priceId = session?.line_items?.data[0]?.price?.id!;
        const planInfo = STRIPE_PLANS[priceId];

        const customer = (await stripe.customers.retrieve(
          customerId as string
        )) as Stripe.Customer;

        if (!planInfo) {
          console.error('Invalid price ID or plan not found:', priceId)
          break;
        }

        try {
          const userEmail = customer.email;
          if (!userEmail) {
            console.error('No email found for customer:', customerId)
            throw new Error("No email found for customer");
          }

          if (!session || !session.client_reference_id) {
            console.error('Invalid session or missing userId:', {
              session: session?.id,
              metadata: session?.metadata
            })
            throw new Error("Invalid session or missing userId");
          }

          const creditHistoryEntry = {
            amount: planInfo.credits,
            type: 'add',
            timestamp: Date.now(),
            source: 'stripe_purchase'
          };

          const userId = session.client_reference_id;
          console.log('Creating or updating user:', {
            userId,
            credits: planInfo.credits,
            planName: planInfo.name
          })

          const putCommand = new PutCommand({
            TableName: process.env.DYNAMODB_KEEZMO_TABLE_NAME,
            Item: {
              pk: `USER#${userId}`,
              sk: `USER#${userId}`,
              email: userEmail,
              credits: planInfo.credits,
              hasAccess: true,
              customerId: customerId,
              updatedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              creditHistory: [creditHistoryEntry]
            }
          });

          await dynamoDbClient.send(putCommand);

          console.log('User created or updated successfully:', {
            userId,
            credits: planInfo.credits,
            timestamp: Date.now()
          })

          if (userEmail) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000';
            await resendClient.emails.send({
              from: "Keezmo <official@keezmo.com>",
              to: userEmail,
              subject: "Confirmação de Compra - Keezmo",
              react: PurchaseConfirmation({
                appName: "Keezmo",
                logoImageUrl: "https://example.com/logo.png",
                purchasedAt: new Date().toISOString(),
                planName: planInfo.name,
                signUpUrl: `${appUrl}/sign-up?email=${encodeURIComponent(userEmail)}`,
              }),
            });
          }

        } catch (error) {
          console.error('Error creating or updating user in DynamoDB:', {
            error,
            customerId,
            sessionId: session?.id
          });
          throw error;
        }
        break;

      case "customer.subscription.deleted": {
        console.log('Processing subscription deletion')
        const stripeObject: Stripe.CustomerSubscriptionDeletedEvent = event.data.object as Stripe.CustomerSubscriptionDeletedEvent;
        const subscription = await stripe.subscriptions.retrieve(
          stripeObject.id
        );

        const customerId = subscription.customer;
        const userId = subscription.metadata.userId;

        if (!customerId || !userId) break;

        await dynamoDbClient.send(new UpdateCommand({
          TableName: process.env.DYNAMODB_KEEZMO_TABLE_NAME!,
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

        console.log('Subscription cancelled for user:', userId)
        break;
      }

      case "invoice.paid": {
        console.log('Processing paid invoice')
        const stripeObject: Stripe.Invoice = event.data.object as Stripe.Invoice;
        const invoice = await stripe.invoices.retrieve(stripeObject.id);
        const customerId = invoice.customer;
        const userId = invoice.metadata?.userId;

        if (!customerId || !userId) break;

        await dynamoDbClient.send(new UpdateCommand({
          TableName: process.env.DYNAMODB_KEEZMO_TABLE_NAME!,
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

        console.log('Invoice processed for user:', userId)
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`)
        break;
    }
  } catch (error) {
    console.error("Stripe webhook error:", {
      error,
      eventType,
      eventId: event?.id
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  console.log('Webhook processed successfully:', eventType)
  return NextResponse.json({});
}
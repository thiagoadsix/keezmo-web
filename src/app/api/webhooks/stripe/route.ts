import Stripe from "stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  PutCommand,
  UpdateCommand,
  GetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

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
    credits: config.stripe.plans[0].credits,
  },
  [config.stripe.plans[1].priceId]: {
    name: config.stripe.plans[1].name,
    credits: config.stripe.plans[1].credits,
  },
  [config.stripe.plans[2].priceId]: {
    name: config.stripe.plans[2].name,
    credits: config.stripe.plans[2].credits,
  },
};

export async function POST(req: NextRequest) {
  console.log("Received Stripe webhook event");
  const body = await req.text();
  const headerPayload = await headers();
  const signature = String(headerPayload.get("stripe-signature"));

  if (!signature) {
    console.error("Webhook Error: Missing Stripe signature");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let eventType: any;
  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      stripeWebhookSecret
    );
    console.log("Webhook event verified:", eventType);
  } catch (error) {
    console.error("Webhook Error: Invalid signature", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        console.log("Processing checkout.session.completed");
        const stripeObject: Stripe.Checkout.Session = event.data
          .object as Stripe.Checkout.Session;
        const session = await findCheckoutSession(stripeObject.id);

        console.log("Checkout session found:", {
          sessionId: stripeObject.id,
          customerId: session?.customer,
        });

        const customerId = session?.customer;
        const priceId = session?.line_items?.data[0]?.price?.id!;
        const planInfo = STRIPE_PLANS[priceId];

        if (session?.mode === "payment") {
          console.error("Payment mode detected, skipping");
          break;
        }

        const customer = (await stripe.customers.retrieve(
          customerId as string
        )) as Stripe.Customer;

        if (!planInfo) {
          console.error("Invalid price ID or plan not found:", priceId);
          break;
        }

        try {
          const userEmail = customer.email;
          if (!userEmail) {
            console.error("No email found for customer:", customerId);
            throw new Error("No email found for customer");
          }

          if (!session || !userEmail) {
            console.error("Invalid session or missing user email:", {
              session: session?.id,
              metadata: session?.metadata,
            });
            throw new Error("Invalid session or missing user email");
          }

          const creditHistoryEntry = {
            amount: planInfo.credits,
            type: "add",
            createdAt: new Date().toISOString(),
            source: "subscription_credit",
          };

          console.log("Creating or updating user:", {
            userEmail,
            credits: planInfo.credits,
            planName: planInfo.name,
          });

          const putCommand = new PutCommand({
            TableName: process.env.DYNAMODB_KEEZMO_TABLE_NAME,
            Item: {
              pk: `USER#${userEmail}`,
              sk: `USER#${userEmail}`,
              email: userEmail,
              credits: {
                plan: planInfo.credits,
                additional: 0,
              },
              hasAccess: true,
              customerId: customerId,
              updatedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              creditHistory: [creditHistoryEntry],
            },
          });

          await dynamoDbClient.send(putCommand);

          if (userEmail) {
            const appUrl =
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
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
          console.error("Error creating or updating user in DynamoDB:", {
            error,
            customerId,
            sessionId: session?.id,
          });
          throw error;
        }
        break;
      }

      case "customer.subscription.deleted": {
        console.log("Processing subscription deletion");
        const stripeObject: Stripe.Subscription = event.data
          .object as Stripe.Subscription;
        const customerId = stripeObject.customer as string;

        if (!customerId) {
          console.error("No customerId found in the event");
          break;
        }

        // Query the GSI to find the user by customerId
        const queryCommand = new QueryCommand({
          TableName: process.env.DYNAMODB_KEEZMO_TABLE_NAME!,
          IndexName: "CustomerIDIndex",
          KeyConditionExpression: "customerId = :customerId",
          ExpressionAttributeValues: {
            ":customerId": customerId,
          },
        });

        const queryResponse = await dynamoDbClient.send(queryCommand);
        const user = queryResponse.Items?.[0];

        if (!user) {
          console.error("User not found for customerId:", customerId);
          break;
        }

        const userEmail = user.email;

        // Update the user record
        await dynamoDbClient.send(
          new UpdateCommand({
            TableName: process.env.DYNAMODB_KEEZMO_TABLE_NAME!,
            Key: {
              pk: `USER#${userEmail}`,
              sk: `USER#${userEmail}`,
            },
            UpdateExpression:
              "SET hasAccess = :hasAccess, updatedAt = :updatedAt",
            ExpressionAttributeValues: {
              ":hasAccess": false,
              ":updatedAt": new Date().toISOString(),
            },
            ReturnValues: "ALL_NEW",
          })
        );

        console.log("Subscription cancelled for user:", userEmail);
        break;
      }

      case "invoice.paid": {
        console.log("Processing paid invoice");
        const stripeObject: Stripe.Invoice = event.data
          .object as Stripe.Invoice;
        const invoice = await stripe.invoices.retrieve(stripeObject.id);
        const customerId = invoice.customer;
        const userEmail = invoice.customer_email;

        if (!customerId || !userEmail) break;

        await dynamoDbClient.send(
          new UpdateCommand({
            TableName: process.env.DYNAMODB_KEEZMO_TABLE_NAME!,
            Key: {
              pk: `USER#${userEmail}`,
              sk: `USER#${userEmail}`,
            },
            UpdateExpression:
              "SET hasAccess = :hasAccess, updatedAt = :updatedAt",
            ExpressionAttributeValues: {
              ":hasAccess": true,
              ":updatedAt": new Date().toISOString(),
            },
            ReturnValues: "ALL_NEW",
          })
        );

        console.log("Invoice processed for user:", userEmail);

        break;
      }

      case "payment_intent.succeeded": {
        console.log("Processing payment intent succeeded");
        const stripeObject: Stripe.PaymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Stripe object:", JSON.stringify(stripeObject, null, 2));
        const paymentIntent = await stripe.paymentIntents.retrieve(stripeObject.id);
        console.log("Payment intent retrieved:", JSON.stringify(paymentIntent, null, 2));
        const userEmail = paymentIntent.metadata.email;
        const priceId = paymentIntent.metadata.priceId;

        if (!userEmail || !priceId) break;

        // Find the additional plan based on the priceId
        const additionalPlan = config.stripe.additionalPlans.find((plan) => plan.priceId === priceId);

        if (!additionalPlan) {
          console.error("No matching additional plan found for priceId:", priceId);
          break;
        }

        const getUserCommand = new GetCommand({
          TableName: process.env.DYNAMODB_KEEZMO_TABLE_NAME!,
          Key: { pk: `USER#${userEmail}`, sk: `USER#${userEmail}` }
        });

        const userResponse = await dynamoDbClient.send(getUserCommand);
        const user = userResponse.Item;

        if (!user) {
          console.error("User not found:", userEmail);
          break;
        }

        const currentAdditionalCredits = user.credits?.additional || 0;
        const newAdditionalCredits = currentAdditionalCredits + additionalPlan.credits;

        // Create a new credit history entry
        const creditHistoryEntry = {
          amount: additionalPlan.credits,
          type: "add",
          createdAt: new Date().toISOString(),
          source: "additional_credit",
        };

        // Update the user's credits and credit history
        await dynamoDbClient.send(
          new UpdateCommand({
            TableName: process.env.DYNAMODB_KEEZMO_TABLE_NAME!,
            Key: { pk: `USER#${userEmail}`, sk: `USER#${userEmail}` },
            UpdateExpression:
              "SET credits.additional = :additionalCredits, creditHistory = list_append(if_not_exists(creditHistory, :empty_list), :history), updatedAt = :updatedAt",
            ExpressionAttributeValues: {
              ":additionalCredits": newAdditionalCredits,
              ":history": [creditHistoryEntry],
              ":empty_list": [],
              ":updatedAt": new Date().toISOString(),
            },
            ReturnValues: "ALL_NEW",
          })
        );

        console.log("Payment intent processed for user:", userEmail);
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
        break;
    }
  } catch (error) {
    console.error("Stripe webhook error:", {
      error,
      eventType,
      eventId: event?.id,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }

  console.log("Webhook processed successfully:", eventType);
  return NextResponse.json({});
}

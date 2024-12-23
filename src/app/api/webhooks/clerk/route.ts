import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDbClient } from "../../clients/dynamodb";
import VerificationCode from "@/src/components/emails/verification-code";
import { resendClient } from "../../clients/resend";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  const wh = new Webhook(SIGNING_SECRET);
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;
  console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
  console.log("Webhook payload:", body);

  if (eventType === "user.created") {
    const {
      id,
      email_addresses,
      first_name,
      last_name,
      image_url,
    } = evt.data;

    const user = {
      clerkId: id,
      firstName: first_name || undefined,
      lastName: last_name || undefined,
      imageUrl: image_url || undefined,
      updatedAt: new Date().toISOString(),
    };

    try {
      const command = new UpdateCommand({
        TableName: process.env.DYNAMODB_KEEZMO_TABLE_NAME,
        Key: {
          pk: `USER#${email_addresses[0].email_address}`,
          sk: `USER#${email_addresses[0].email_address}`,
        },
        UpdateExpression: "SET clerkId = :clerkId, firstName = :firstName, lastName = :lastName, imageUrl = :imageUrl, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":clerkId": user.clerkId,
          ":firstName": user.firstName,
          ":lastName": user.lastName,
          ":imageUrl": user.imageUrl,
          ":updatedAt": user.updatedAt,
        },
        ReturnValues: "ALL_NEW",
      });
      await dynamoDbClient.send(command);
      console.log(`Updated user ${id} in DynamoDB`);
    } catch (error) {
      console.error("Error updating user in DynamoDB:", error);
      return new Response("Error updating user", { status: 500 });
    }
  }

  if (eventType === "email.created") {
    const { to_email_address, slug, object, data } = evt.data;
    const { app, otp_code } = data ?? {};
    const { logo_image_url } = app ?? {};

    console.log("metadata", {
      toEmailAddress: to_email_address,
      slug,
      object,
      otpCode: otp_code,
      appName: app.name,
      logoImageUrl: logo_image_url,
    });

    if (slug !== "verification_code") {
      throw new Error("Slug is not verification_code");
    }

    if (object !== "email") {
      throw new Error("Object is not email");
    }

    await resendClient.emails.send({
      from: "Keezmo <official@keezmo.com>",
      to: to_email_address!,
      subject: `${otp_code} é o seu código de verificação do ${app.name}`,
      react: VerificationCode({
        otpCode: otp_code,
        appName: app.name,
        logoImageUrl: logo_image_url,
        requestedAt: new Date().toISOString(),
      }),
    });
  }

  return new Response("Webhook received", { status: 200 });
}

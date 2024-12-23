import { NextRequest, NextResponse } from "next/server";
import { createCheckout } from "@/src/lib/stripe";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.priceId) {
    return NextResponse.json(
      { error: "Price ID is required" },
      { status: 400 }
    );
  } else if (!body.successUrl || !body.cancelUrl) {
    return NextResponse.json(
      { error: "Success and cancel URLs are required" },
      { status: 400 }
    );
  } else if (!body.mode) {
    return NextResponse.json(
      {
        error:
          "Mode is required (either 'payment' for one-time payments or 'subscription' for recurring subscription)",
      },
      { status: 400 }
    );
  }

  try {
    const { priceId, mode, successUrl, cancelUrl } = body;

    const userId = randomUUID();
    console.log("userId", userId);

    // Criar sessão no Stripe
    const stripeSessionURL = await createCheckout({
      priceId,
      mode,
      successUrl,
      cancelUrl,
      clientReferenceId: userId,
    });

    return NextResponse.json({ url: stripeSessionURL });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

import { createPaymentLink } from "@/src/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { priceId, email } = await req.json();

  if (!priceId) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const paymentLink = await createPaymentLink({
      priceId,
      email
    });

    return NextResponse.json({ url: paymentLink });
  } catch (error) {
    console.error("Error creating payment link:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

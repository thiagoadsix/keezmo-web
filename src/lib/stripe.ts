import Stripe from "stripe";

interface CreateCheckoutParams {
  priceId: string;
  mode: "payment" | "subscription";
  successUrl: string;
  cancelUrl: string;
  couponId?: string | null;
  user?: {
    customerId?: string;
    email?: string;
  };
}

interface CreateCustomerPortalParams {
  customerId: string;
  returnUrl: string;
}

interface CreatePaymentLinkParams {
  priceId: string;
  email: string;
}

// This is used to create a Stripe Checkout for one-time payments. It's usually triggered with the <ButtonCheckout /> component. Webhooks are used to update the user's state in the database.
export const createCheckout = async ({
  user,
  mode,
  successUrl,
  cancelUrl,
  priceId,
  couponId,
}: CreateCheckoutParams): Promise<string> => {
  try {
    const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY), {
      apiVersion: "2024-11-20.acacia",
      typescript: true,
    });

    const extraParams: {
      customer?: string;
      customer_creation?: "always";
      customer_email?: string;
      invoice_creation?: { enabled: boolean };
      payment_intent_data?: {
        setup_future_usage: "on_session";
        metadata: { email: string; priceId: string };
      };
      tax_id_collection?: { enabled: boolean };
      subscription_data?: {
        metadata: {
          email: string;
        };
      };
    } = {};

    if (user?.customerId) {
      extraParams.customer = user.customerId;
    } else {
      if (mode === "payment") {
        extraParams.customer_creation = "always";
        // The option below costs 0.4% (up to $2) per invoice. Alternatively, you can use https://zenvoice.io/ to create unlimited invoices automatically.
        // extraParams.invoice_creation = { enabled: true };
        extraParams.payment_intent_data = {
          setup_future_usage: "on_session",
          metadata: { email: user?.email!, priceId },
        };
      }
      if (user?.email) {
        extraParams.customer_email = user.email;
      }
      extraParams.tax_id_collection = { enabled: true };
    }

    // Only add subscription_data for subscription mode
    if (mode === "subscription" && user?.email) {
      extraParams.subscription_data = {
        metadata: {
          email: user.email,
        },
      };
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode,
      allow_promotion_codes: true,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      discounts: couponId
        ? [
            {
              coupon: couponId,
            },
          ]
        : [],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        email: user?.email!,
      },
      ...extraParams,
    };

    const stripeSession = await stripe.checkout.sessions.create(sessionParams);

    return stripeSession.url!;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// This is used to create Customer Portal sessions, so users can manage their subscriptions (payment methods, cancel, etc..)
export const createCustomerPortal = async ({
  customerId,
  returnUrl,
}: CreateCustomerPortalParams): Promise<string> => {
  const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY), {
    apiVersion: "2024-11-20.acacia",
    typescript: true,
  });

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return portalSession.url;
};

// This is used to get the uesr checkout session and populate the data so we get the planId the user subscribed to
export const findCheckoutSession = async (sessionId: string) => {
  try {
    const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY), {
      apiVersion: "2024-11-20.acacia",
      typescript: true,
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    return session;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const createPaymentLink = async ({
  priceId,
  email,
}: CreatePaymentLinkParams): Promise<string> => {
  try {
    const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY), {
      apiVersion: "2024-11-20.acacia",
      typescript: true,
    });

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      metadata: {
        priceId,
        email,
      },
      payment_intent_data: {
        metadata: {
          priceId,
          email,
        },
      },
    });

    return paymentLink.url;
  } catch (e) {
    console.error("Error creating payment link:", e);
    throw e;
  }
};

import { ConfigProps } from "./types/config";

const config = {
  app: {
    name: "Keezmo",
    nameAbbreviated: "K",
    description: "Keezmo é uma plataforma de geração de flashcards com IA para estudantes.",
  },
  domainName: "keezmo.com",
  stripe: {
    // Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
    plans: [
      {
        // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1QYu2DD6NUyMtMNHHmNiBt0F"
            : "price_1QbnaHD6NUyMtMNHWIUM7HXo",
        //  REQUIRED - Name of the plan, displayed on the pricing page
        name: "Basic",
        // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
        description: "Perfeito para experimentar o Keezmo",
        // The price you want to display, the one user will be charged on Stripe.
        price: 24.90,
        // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
        priceAnchor: null,
        features: [
          { name: "150 créditos por mês" },
          { name: "Geração de flashcards com IA" },
          { name: "Suporte padrão" },
        ],
        credits: 150,
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1QYu5LD6NUyMtMNH6mLjWhFL"
            : "price_1QbnaRD6NUyMtMNHBDJ4PTOx",
        // This plan will look different on the pricing page, it will be highlighted. You can only have one plan with isFeatured: true
        isFeatured: true,
        name: "Pro",
        description: "Para estudantes dedicados",
        price: 49.80,
        priceAnchor: null,
        features: [
          { name: "300 créditos por mês" },
          { name: "Suporte prioritário" },
          { name: "Tudo do plano Basic" },
        ],
        credits: 300,
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1QYu5mD6NUyMtMNH9Qh2yn42"
            : "price_1QbnaTD6NUyMtMNHPQIkD1dh",
        isFeatured: false,
        name: "Premium",
        description: "Para estudantes que querem mais",
        price: 74.70,
        priceAnchor: null,
        features: [
          { name: "450 créditos por mês" },
          { name: "Tudo do plano Pro" },
          { name: "Acesso antecipado a novas funcionalidades" },
        ],
        credits: 450,
      },
    ],
    additionalPlans: [
      {
        priceId: process.env.NODE_ENV === "development" ? "price_1QZEr5D6NUyMtMNHIbsUj42j" : "price_1QbnaWD6NUyMtMNH82KmpdsD",
        name: "150 de crédito",
        description: "Preciso de um pouco mais de crédito",
        price: 12.45,
        priceAnchor: null,
        credits: 150,
      },
      {
        priceId: process.env.NODE_ENV === "development" ? "price_1QaLnMD6NUyMtMNHnXJAwpGk" : "price_1QbnaZD6NUyMtMNHVkL6q5YA",
        name: "300 de crédito",
        description: "Para estudantes dedicados",
        price: 24.90,
        priceAnchor: null,
        credits: 300,
      },
      {
        priceId: process.env.NODE_ENV === "development" ? "price_1QaLlVD6NUyMtMNH5mQoFEnm" : "price_1QbnaXD6NUyMtMNHDZAETA3g",
        name: "450 de crédito",
        description: "Para estudantes que querem mais",
        price: 37.35,
        priceAnchor: null,
        credits: 450,
      },
    ],
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "keezmo-files-prod",
    bucketUrl: `https://keezmo-files-prod.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
    region: "us-east-1",
  },
  resend: {
    // REQUIRED — Email 'From' field to be used when sending magic login links
    // fromNoReply: `Keezmo <official@keezmo.com>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    // fromAdmin: `Marc at ShipFast <marc@resend.shipfa.st>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    // supportEmail: "marc.louvion@gmail.com",
  }
} as ConfigProps;

export default config;
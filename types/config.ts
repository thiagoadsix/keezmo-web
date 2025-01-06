export type ConfigProps = {
  app: {
    name: string;
    nameAbbreviated: string;
    description: string;
  },
  domainName: string;
  stripe: {
    plans: {
      isFeatured?: boolean;
      priceId: string;
      name: string;
      description?: string;
      price: number;
      priceAnchor?: number | null;
      credits: number;
      features: {
        name: string;
      }[];
      maxPdfsPerMonth: number;
    }[];
    additionalPlans: {
      priceId: string;
      name: string;
      description?: string;
      price: number;
      priceAnchor?: number | null;
      credits: number;
    }[];
  };
  aws: {
    bucket: string;
    bucketUrl: string;
    cdn: string;
  };
  resend: {
    fromNoReply?: string;
    fromAdmin?: string;
    supportEmail?: string;
  };
};
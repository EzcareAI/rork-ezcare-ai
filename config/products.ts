export type ProductMapping = {
  monthly?: string;
  yearly?: string;
  displayName?: string;
  credits?: string;
  features?: string[];
  popular?: boolean;
};

const PRODUCTS: Record<string, ProductMapping> = {
  free: {
    monthly: "ezcare_free_monthly",
    displayName: "Free",
    credits: "10 credits",
    features: [
      "10 credits",
      "Basic health guidance",
      "Symptom explanations",
      "GPT-4o-mini AI model",
    ],
  },
  starter: {
    monthly: "ezcare_starter_monthly",
    displayName: "Starter",
    credits: "50 questions/month",
    features: [
      "50 questions per month",
      "Advanced health insights",
      "Personalized wellness tips",
      "GPT-5 AI model",
      "Email support",
    ],
  },
  pro: {
    monthly: "ezcare_pro_monthly",
    displayName: "Pro",
    credits: "300 questions/month",
    features: [
      "300 questions per month",
      "Premium health analysis",
      "Custom wellness plans",
      "GPT-5 AI model",
      "Priority support",
      "Health tracking",
    ],
    popular: true,
  },
  premium: {
    monthly: "ezcare_premium_monthly",
    displayName: "Premium",
    credits: "Unlimited questions/month",
    features: [
      "Unlimited questions/month",
      "Premium health analysis",
      "Custom wellness plans",
      "GPT-5 AI model",
      "24/7 priority support",
      "Advanced health tracking",
      "Exclusive content",
    ],
  },
};

export default PRODUCTS;

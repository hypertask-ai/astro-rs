import type { BillingPeriod } from "../../client/app/model.js";

export const pageTitle =
  "Hypertask Pricing — Free & Paid AI Project Management Plans";

export const pricingTitle = "Free forever. Upgrade when your team needs more.";

export const billingGroupLabel = "Billing period";

export const billingLabels: Readonly<Record<BillingPeriod, string>> = {
  monthly: "Pay monthly",
  yearly: "Pay yearly",
};

export const billingPeriods: readonly BillingPeriod[] = ["monthly", "yearly"];

export const discountLabel = "−20%";

export type PricingPlan = Readonly<{
  cta: string;
  ctaId?: string;
  featured: boolean;
  features: readonly string[];
  name: string;
  note: Readonly<Record<BillingPeriod, string>>;
  price: Readonly<Record<BillingPeriod, string>>;
  tag?: string;
  unit: string;
}>;

export const pricingPlans: readonly PricingPlan[] = [
  {
    cta: "Start for free",
    featured: false,
    features: [
      "Unlimited members",
      "Up to 3 boards per person (archived boards don’t count)",
      "Unlimited tickets",
      "Starter AI allowance on fast budget models",
      "CLI + MCP included",
      "No credit card needed",
      "Upgrade anytime for full AI power",
    ],
    name: "Free",
    note: { monthly: "", yearly: "" },
    price: { monthly: "$0", yearly: "$0" },
    unit: "free forever",
  },
  {
    cta: "Get started",
    featured: false,
    features: [
      "All AI features on your own keys",
      "Bring keys from Anthropic, OpenAI or OpenRouter",
      "Up to 50 team seats",
      "Email support",
    ],
    name: "BYOK",
    note: { monthly: "billed monthly", yearly: "$96 billed yearly" },
    price: { monthly: "$10", yearly: "$8" },
    unit: "per user / month",
  },
  {
    cta: "Get started",
    ctaId: "get-started-button",
    featured: true,
    features: [
      "Everything in BYOK",
      "AI included, no API keys to manage",
      "Runs on Hypertask’s managed models",
      "Priority support",
    ],
    name: "Pro",
    note: { monthly: "billed monthly", yearly: "$192 billed yearly" },
    price: { monthly: "$20", yearly: "$16" },
    tag: "Most popular",
    unit: "per user / month",
  },
];

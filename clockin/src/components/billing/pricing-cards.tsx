"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useCheckout } from "@/hooks/use-checkout";
import type { PlanType } from "@/types/subscription";
import { cn } from "@/lib/utils";

const FREE_FEATURES = [
  "Focus timer (Pomodoro + custom)",
  "Up to 5 categories",
  "7-day history",
  "Basic stats & streaks",
  "Basic achievements",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited categories",
  "Full history (unlimited)",
  "Unlimited AI insights",
  "AI coach chat",
  "Advanced stats & charts",
  "Data export",
  "Custom themes",
  "Focus rooms (social)",
];

// Pro Annual only highlights the savings — avoids repeating the full Pro feature list
const PRO_ANNUAL_FEATURES = [
  "Everything in Pro Monthly",
  "Save 44% vs monthly billing",
  "Best value for committed users",
];

const LIFETIME_FEATURES = [
  "Everything in Pro Monthly",
  "One-time payment, no renewals",
  "All future Pro features included",
];

interface PricingTier {
  id: PlanType | "pro_annual";
  label: string;
  price: string;
  period: string;
  features: string[];
  productIdEnvKey: string;
  badge?: string;
  highlight?: boolean;
}

const TIERS: PricingTier[] = [
  {
    id: "free",
    label: "Free",
    price: "$0",
    period: "forever",
    features: FREE_FEATURES,
    productIdEnvKey: "",
  },
  {
    id: "pro",
    label: "Pro Monthly",
    price: "$2.99",
    period: "per month",
    features: PRO_FEATURES,
    productIdEnvKey: "NEXT_PUBLIC_POLAR_PRO_MONTHLY_PRODUCT_ID",
  },
  {
    id: "pro_annual",
    label: "Pro Annual",
    price: "$19.99",
    period: "per year",
    features: PRO_ANNUAL_FEATURES,
    productIdEnvKey: "NEXT_PUBLIC_POLAR_PRO_ANNUAL_PRODUCT_ID",
    badge: "Best Value",
  },
  {
    id: "lifetime",
    label: "Lifetime",
    price: "$39.99",
    period: "one-time",
    features: LIFETIME_FEATURES,
    productIdEnvKey: "NEXT_PUBLIC_POLAR_LIFETIME_PRODUCT_ID",
    badge: "Best Deal",
  },
];

function getProductId(envKey: string): string {
  if (!envKey) return "";
  const map: Record<string, string | undefined> = {
    NEXT_PUBLIC_POLAR_PRO_MONTHLY_PRODUCT_ID: process.env.NEXT_PUBLIC_POLAR_PRO_MONTHLY_PRODUCT_ID,
    NEXT_PUBLIC_POLAR_PRO_ANNUAL_PRODUCT_ID: process.env.NEXT_PUBLIC_POLAR_PRO_ANNUAL_PRODUCT_ID,
    NEXT_PUBLIC_POLAR_LIFETIME_PRODUCT_ID: process.env.NEXT_PUBLIC_POLAR_LIFETIME_PRODUCT_ID,
  };
  return map[envKey] ?? "";
}

function isTierActive(tierId: PricingTier["id"], currentPlan: PlanType): boolean {
  if (tierId === "free") return currentPlan === "free";
  if (tierId === "pro_annual") return currentPlan === "pro"; // monthly/annual both map to "pro"
  return tierId === currentPlan;
}

interface PricingCardsProps {
  currentPlan: PlanType;
  userId: string | null;
}

export function PricingCards({ currentPlan, userId }: PricingCardsProps) {
  const { checkout, isLoading } = useCheckout();
  const router = useRouter();

  function handleUpgrade(productId: string) {
    if (!userId) {
      router.push("/login");
      return;
    }
    if (!productId) {
      toast.error("This plan is temporarily unavailable. Please try again later.");
      return;
    }
    checkout(productId);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {TIERS.map((tier) => {
        const isActive = isTierActive(tier.id, currentPlan);
        const productId = getProductId(tier.productIdEnvKey);

        return (
          <Card
            key={tier.id}
            className={cn(
              "relative flex flex-col rounded-md border p-6 transition-colors",
              tier.highlight ? "border-accent-solid/50 bg-accent-soft" : "border-line bg-card"
            )}
          >
            {tier.badge && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 border-transparent bg-accent-solid px-3 py-1 text-xs text-accent-fg">
                {tier.badge}
              </Badge>
            )}

            <div className="mb-4">
              <h3 className="text-base font-semibold text-ink">{tier.label}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-ink">{tier.price}</span>
                <span className="text-sm text-ink-muted">/{tier.period}</span>
              </div>
            </div>

            <ul className="mb-6 flex-1 space-y-2">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-ink-muted">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-solid" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {isActive ? (
              <Button variant="outline" disabled className="w-full">
                Current plan
              </Button>
            ) : tier.id === "free" ? (
              <Button variant="outline" disabled className="w-full">
                Always free
              </Button>
            ) : (
              <Button onClick={() => handleUpgrade(productId)} disabled={isLoading} className="w-full">
                {isLoading ? "Redirecting..." : userId ? "Upgrade" : "Sign in to upgrade"}
              </Button>
            )}
          </Card>
        );
      })}
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import type { PlanType, SubscriptionStatus } from "@/types/subscription";

interface BillingResponse {
  isPro: boolean;
  plan: PlanType;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  aiInsightsUsedThisMonth: number;
}

const FREE_DEFAULTS: BillingResponse = {
  isPro: false,
  plan: "free",
  status: "active",
  currentPeriodEnd: null,
  aiInsightsUsedThisMonth: 0,
};

async function fetchBilling(): Promise<BillingResponse> {
  const res = await fetch("/api/billing");
  if (!res.ok) throw new Error("Failed to fetch billing");
  return res.json();
}

export function useProStatus(userId: string | null) {
  const { data, isLoading } = useQuery({
    queryKey: ["subscription", userId],
    queryFn: fetchBilling,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes — subscription rarely changes mid-session
    retry: 1,
  });

  const resolved = data ?? FREE_DEFAULTS;

  return {
    isPro: resolved.isPro,
    plan: resolved.plan,
    status: resolved.status,
    currentPeriodEnd: resolved.currentPeriodEnd,
    aiInsightsUsedThisMonth: resolved.aiInsightsUsedThisMonth,
    // Only show loading when there's a real fetch in flight (not for guests)
    isLoading: !!userId && isLoading,
  };
}

/** Convenience hook — returns only the boolean isPro flag. */
export function useIsPro(userId: string | null): boolean {
  const { isPro } = useProStatus(userId);
  return isPro;
}

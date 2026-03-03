import { createClient } from "@/lib/supabase/server";
import type { PlanType } from "@/types/subscription";

interface ProAccess {
  userId: string;
  isPro: boolean;
  planType: PlanType;
  aiInsightsUsedThisMonth: number;
}

/**
 * Server-side helper: authenticates user and checks subscription status.
 * Throws "Unauthorized" if not authenticated.
 * Returns free-tier defaults when no subscription row exists.
 */
export async function checkProAccess(): Promise<ProAccess> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: sub } = await supabase
    .from("user_subscriptions" as never)
    .select("plan_type, ai_insights_used_this_month")
    .eq("user_id", user.id)
    .single() as unknown as {
      data: { plan_type: PlanType; ai_insights_used_this_month: number } | null;
    };

  const planType: PlanType = sub?.plan_type ?? "free";
  const isPro = planType === "pro" || planType === "lifetime";
  const aiInsightsUsedThisMonth = sub?.ai_insights_used_this_month ?? 0;

  return { userId: user.id, isPro, planType, aiInsightsUsedThisMonth };
}

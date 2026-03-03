import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { subscriptionService } from "@/services/subscription-service";

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const subscription = await subscriptionService.getSubscription(user.id);
    const isPro = subscription.plan_type === "pro" || subscription.plan_type === "lifetime";

    return NextResponse.json({
      isPro,
      plan: subscription.plan_type,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      aiInsightsUsedThisMonth: subscription.ai_insights_used_this_month,
    });
  } catch (err) {
    console.error("[billing] error:", err);
    return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 });
  }
}

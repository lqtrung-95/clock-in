import { createClient } from "@/lib/supabase/server";
import type { UserSubscription, UpsertSubscriptionData } from "@/types/subscription";

// Default free-tier shape returned when no subscription row exists
const FREE_DEFAULTS = {
  polar_customer_id: null,
  polar_subscription_id: null,
  plan_type: "free" as const,
  billing_interval: null,
  status: "active" as const,
  current_period_end: null,
  ai_insights_used_this_month: 0,
};

export const subscriptionService = {
  /**
   * Returns the user's subscription row, or a synthetic free-tier object if none exists.
   */
  async getSubscription(userId: string): Promise<UserSubscription> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_subscriptions" as never)
      .select("*")
      .eq("user_id", userId)
      .single() as unknown as { data: UserSubscription | null; error: unknown };

    if (error || !data) {
      const now = new Date().toISOString();
      return { ...FREE_DEFAULTS, id: "", user_id: userId, created_at: now, updated_at: now };
    }

    return data;
  },

  /**
   * Upserts a subscription row by user_id (one row per user).
   * Used by the Polar webhook handler.
   */
  async upsertSubscription(data: UpsertSubscriptionData): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("user_subscriptions" as never)
      .upsert(
        { ...data, updated_at: new Date().toISOString() } as never,
        { onConflict: "user_id" }
      );

    if (error) throw error;
  },

  /**
   * Increments ai_insights_used_this_month for a user.
   * Automatically resets the counter when the calendar month changes.
   */
  async incrementAiInsightsUsed(userId: string): Promise<void> {
    const supabase = await createClient();
    const { data } = await supabase
      .from("user_subscriptions" as never)
      .select("ai_insights_used_this_month, updated_at")
      .eq("user_id", userId)
      .single() as unknown as { data: Pick<UserSubscription, "ai_insights_used_this_month" | "updated_at"> | null };

    const now = new Date();
    const lastUpdate = data?.updated_at ? new Date(data.updated_at) : null;
    const isNewMonth =
      !lastUpdate ||
      lastUpdate.getFullYear() !== now.getFullYear() ||
      lastUpdate.getMonth() !== now.getMonth();

    const newCount = isNewMonth ? 1 : (data?.ai_insights_used_this_month ?? 0) + 1;

    await supabase
      .from("user_subscriptions" as never)
      .upsert(
        { user_id: userId, ai_insights_used_this_month: newCount, updated_at: now.toISOString() } as never,
        { onConflict: "user_id" }
      );
  },
};

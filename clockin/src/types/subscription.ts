export type PlanType = "free" | "pro" | "lifetime";
export type BillingInterval = "month" | "year" | null;
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "incomplete";

export interface UserSubscription {
  id: string;
  user_id: string;
  polar_customer_id: string | null;
  polar_subscription_id: string | null;
  plan_type: PlanType;
  billing_interval: BillingInterval;
  status: SubscriptionStatus;
  current_period_end: string | null;
  ai_insights_used_this_month: number;
  created_at: string;
  updated_at: string;
}

export interface ProStatus {
  isPro: boolean;
  plan: PlanType;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  aiInsightsUsedThisMonth: number;
  isLoading: boolean;
}

export interface UpsertSubscriptionData {
  user_id: string;
  polar_customer_id?: string | null;
  polar_subscription_id?: string | null;
  plan_type: PlanType;
  billing_interval?: BillingInterval;
  status: SubscriptionStatus;
  current_period_end?: string | null;
}

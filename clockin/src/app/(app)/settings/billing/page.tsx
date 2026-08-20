"use client";

import { Suspense } from "react";
import { PricingCards } from "@/components/billing/pricing-cards";
import { PlanBadge } from "@/components/billing/plan-badge";
import { CheckoutSuccessHandler } from "@/components/billing/checkout-success-handler";
import { ManageSubscriptionButton } from "@/components/billing/manage-subscription-button";
import { useProStatus } from "@/hooks/use-pro-status";
import { useAuthState } from "@/hooks/use-auth-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PageShell } from "@/components/ui-app/page-shell";
import { SEGMENTS } from "@/lib/navigation";

const AI_INSIGHTS_MONTHLY_LIMIT = 3;

function BillingContent({ userId }: { userId: string | null }) {
  const { plan, currentPeriodEnd, aiInsightsUsedThisMonth, isLoading } =
    useProStatus(userId);

  const periodEndFormatted = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="space-y-8">
      {/* Current plan summary card */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            {isLoading ? (
              <div className="mt-1 h-6 w-20 animate-pulse rounded bg-muted" />
            ) : (
              <div className="mt-1">
                <PlanBadge userId={userId} />
              </div>
            )}
          </div>

          {plan === "free" && !isLoading && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">AI Insights used</p>
              <p className="text-sm font-semibold text-foreground">
                {aiInsightsUsedThisMonth} / {AI_INSIGHTS_MONTHLY_LIMIT} this month
              </p>
            </div>
          )}

          {plan !== "free" && periodEndFormatted && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                {plan === "lifetime" ? "Lifetime access" : "Renews on"}
              </p>
              {plan !== "lifetime" && (
                <p className="text-sm font-semibold text-foreground">{periodEndFormatted}</p>
              )}
            </div>
          )}
        </div>

        {plan === "pro" && (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
            <p className="flex-1 text-xs text-muted-foreground">
              Update payment method, view invoices, or cancel your subscription.
            </p>
            <ManageSubscriptionButton />
          </div>
        )}
      </div>

      {/* Pricing tiers */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Plans</h2>
        <PricingCards currentPlan={plan} userId={userId} />
      </div>
    </div>
  );
}

export default function BillingPage() {
  const { userId, isLoading: authLoading } = useAuthState();

  return (
    <PageShell title="Settings" description="Manage your plan and subscription" segments={SEGMENTS.settings}>
        {/* Checkout success handler — reads ?success=true from URL */}
        <Suspense fallback={null}>
          <CheckoutSuccessHandler userId={userId} />
        </Suspense>

        {authLoading ? (
          <div className="space-y-8">
            {/* Current plan summary placeholder */}
            <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-10 w-40 rounded-md" />
            </div>
            {/* Pricing cards placeholder */}
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-4 rounded-2xl border border-border bg-card p-6">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-9 w-32" />
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </div>
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <BillingContent userId={userId} />
        )}
    </PageShell>
  );
}

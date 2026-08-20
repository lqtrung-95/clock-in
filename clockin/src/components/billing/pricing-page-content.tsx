"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingCards } from "@/components/billing/pricing-cards";
import { useAuthState } from "@/hooks/use-auth-state";
import { useProStatus } from "@/hooks/use-pro-status";

export function PricingPageContent() {
  const { userId, isLoading: authLoading } = useAuthState();
  const { plan } = useProStatus(userId);

  return (
    <div className="min-h-screen bg-surface">
      {/* Minimal nav */}
      <header className="sticky top-0 z-10 border-b border-line bg-surface/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-wide items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-accent-solid">
              <Flame className="h-4 w-4 fill-current text-accent-fg" />
            </div>
            <span className="font-bold text-ink">Effortful</span>
          </Link>

          {!authLoading && (
            <div className="flex items-center gap-2">
              {userId ? (
                <Link href="/settings/billing">
                  <Button variant="outline" size="sm" className="border-line-strong">
                    Manage plan
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="sm" className="bg-accent-solid text-accent-fg hover:bg-accent-hover">
                      Get started free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-wide space-y-12 px-6 py-16">
        {/* Heading */}
        <div className="space-y-4 text-center">
          <h1 className="text-title text-ink">Simple, transparent pricing</h1>
          <p className="mx-auto max-w-[42ch] text-lg text-ink-muted">
            Start for free. Upgrade when you need more power. No hidden fees, no subscriptions you forget about.
          </p>
        </div>

        {/* Pricing cards */}
        {authLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-solid border-t-transparent" />
          </div>
        ) : (
          <PricingCards currentPlan={userId ? plan : "free"} userId={userId} />
        )}

        {/* Bottom CTA for unauthenticated users */}
        {!authLoading && !userId && (
          <div className="space-y-3 text-center">
            <p className="text-sm text-ink-muted">
              Already have an account?{" "}
              <Link href="/login" className="text-accent-solid underline hover:text-accent-hover">
                Sign in
              </Link>{" "}
              to see your current plan.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingCards } from "@/components/billing/pricing-cards";
import { useAuthState } from "@/hooks/use-auth-state";
import { useProStatus } from "@/hooks/use-pro-status";

export default function PricingPage() {
  const { userId, isLoading: authLoading } = useAuthState();
  const { plan } = useProStatus(userId);

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal nav */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
              <Flame className="h-4 w-4 fill-current text-white" />
            </div>
            <span className="font-bold text-foreground">Clockin</span>
          </Link>

          {!authLoading && (
            <div className="flex items-center gap-2">
              {userId ? (
                <Link href="/settings/billing">
                  <Button variant="outline" size="sm" className="border-border">
                    Manage Plan
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
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    >
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
      <main className="mx-auto max-w-5xl px-6 py-16 space-y-12">
        {/* Heading */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Start for free. Upgrade when you need more power.
            No hidden fees, no subscriptions you forget about.
          </p>
        </div>

        {/* Pricing cards */}
        {authLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : (
          <PricingCards currentPlan={userId ? plan : "free"} userId={userId} />
        )}

        {/* Bottom CTA for unauthenticated users */}
        {!authLoading && !userId && (
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-cyan-500 underline hover:text-cyan-400">
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

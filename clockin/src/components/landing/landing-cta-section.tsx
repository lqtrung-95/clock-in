"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuthState } from "@/hooks/use-auth-state";

export function LandingCtaSection() {
  const { isAuthenticated } = useAuthState();

  return (
    <section className="px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-prose text-center">
        <h2 className="text-title mb-5 text-ink">
          The work won&apos;t do itself. <span className="text-accent-solid">You will.</span>
        </h2>
        <p className="mx-auto mb-10 max-w-[42ch] text-lg text-ink-muted">
          No sign-up required. Open the app, pick a category, and start your first session in
          under 10 seconds.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/focus"
            className="group inline-flex items-center gap-2 rounded-sm bg-accent-solid px-8 py-4 text-lg font-semibold text-accent-fg transition-colors hover:bg-accent-hover"
          >
            {isAuthenticated ? "Open App" : "Start tracking"}
            <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          {!isAuthenticated && (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-sm border border-line-strong px-8 py-4 text-lg font-medium text-ink transition-colors hover:bg-surface-sunken"
            >
              Sign in
            </Link>
          )}
        </div>

        <p className="mt-6 text-sm text-ink-subtle">Free to start · Works as a guest · Install as a PWA</p>
      </div>
    </section>
  );
}

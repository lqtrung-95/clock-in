"use client";

import Link from "next/link";
import { useAuthState } from "@/hooks/use-auth-state";

export function LandingNav() {
  const { isAuthenticated, isLoading } = useAuthState();

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b border-line bg-surface/85 px-6 py-4 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-accent-solid">
          <svg className="h-4 w-4 text-accent-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <span className="text-lg font-bold tracking-tight text-ink">Effortful</span>
      </Link>

      {!isLoading && (
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/focus"
              className="rounded-sm bg-accent-solid px-5 py-2 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-hover"
            >
              Open App
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink">
                Sign in
              </Link>
              <Link
                href="/focus"
                className="rounded-sm bg-accent-solid px-5 py-2 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-hover"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

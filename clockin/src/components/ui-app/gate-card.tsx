"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Cloud, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataCard } from "./data-card";

/**
 * Merges the old auth/login-prompt.tsx and billing/upgrade-prompt.tsx into
 * one gate. Always shows what's behind the gate, never hides content
 * entirely.
 *
 * `pending` matters: useProStatus deliberately exposes isPending (not
 * isLoading) so the Pro check doesn't briefly read false mid-resolve. Pass
 * it through here rather than gating on `kind === "pro"` alone, or a paying
 * user sees an upgrade flash on every load.
 */
export function GateCard({
  kind,
  feature,
  description,
  pending = false,
  children,
}: {
  kind: "auth" | "pro";
  feature: string;
  description?: string;
  pending?: boolean;
  children?: ReactNode;
}) {
  const router = useRouter();

  if (pending) {
    return (
      <DataCard>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </DataCard>
    );
  }

  const Icon = kind === "auth" ? Cloud : Sparkles;
  const title = kind === "auth" ? `Sign in for ${feature}` : `Unlock ${feature}`;

  return (
    <DataCard className="items-center text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent-solid">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {kind === "auth" ? (
        <div className="flex gap-2">
          <Button onClick={() => router.push("/login")}>Sign in</Button>
          <Button variant="outline" onClick={() => router.push("/signup")}>
            Create account
          </Button>
        </div>
      ) : (
        <Button onClick={() => router.push("/settings/billing")}>
          <Sparkles className="h-4 w-4" />
          Upgrade to Pro
        </Button>
      )}
      {children}
    </DataCard>
  );
}

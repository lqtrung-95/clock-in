"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataCard } from "@/components/ui-app/data-card";
import { cn } from "@/lib/utils";

interface UpgradePromptProps {
  feature: string;
  description?: string;
  onUpgrade?: () => void;
  /** compact=true renders inline badge style; false=full card */
  compact?: boolean;
  className?: string;
}

/**
 * Soft gate component — shown when a free user encounters a Pro-only feature.
 * Never hides content entirely; always shows what's behind the gate.
 */
export function UpgradePrompt({
  feature,
  description,
  onUpgrade,
  compact = false,
  className,
}: UpgradePromptProps) {
  const router = useRouter();
  // Default CTA navigates to billing page; caller can override with onUpgrade
  const handleUpgrade = onUpgrade ?? (() => router.push("/settings/billing"));

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 rounded-sm border border-accent-solid/20 bg-accent-soft px-3 py-2", className)}>
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent-solid" />
        <span className="text-xs text-ink-muted">
          <span className="font-medium text-ink">{feature}</span> is a Pro feature
        </span>
        <Button size="sm" variant="ghost" onClick={handleUpgrade} className="ml-auto h-6 px-2 text-xs text-accent-solid">
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <DataCard className={cn("items-center text-center", className)}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-solid">
        <Sparkles className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-ink">Unlock {feature}</h3>
      {description && <p className="mt-1.5 text-sm text-ink-muted">{description}</p>}
      <Button onClick={handleUpgrade} className="mt-4">
        <Sparkles className="h-4 w-4" />
        Upgrade to Pro
      </Button>
    </DataCard>
  );
}

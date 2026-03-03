"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      <div className={cn("flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/5 px-3 py-2", className)}>
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-purple-400" />
        <span className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{feature}</span> is a Pro feature
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleUpgrade}
          className="ml-auto h-6 px-2 text-xs text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
        >
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <Card className={cn("border border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-card to-blue-500/5 p-6 text-center", className)}>
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/25">
        <Sparkles className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-base font-semibold text-foreground">Unlock {feature}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      )}
      <Button
        onClick={handleUpgrade}
        className="mt-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Upgrade to Pro
      </Button>
    </Card>
  );
}

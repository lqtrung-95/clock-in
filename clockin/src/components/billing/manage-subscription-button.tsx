"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleManage() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/billing/portal");
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Failed to open portal");
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to open subscription portal");
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleManage}
      disabled={isLoading}
      className="gap-2"
    >
      <ExternalLink className="h-3.5 w-3.5" />
      {isLoading ? "Opening..." : "Manage Subscription"}
    </Button>
  );
}

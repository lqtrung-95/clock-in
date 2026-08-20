"use client";

import { useRouter } from "next/navigation";
import { Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Persistent notice for guests that their data is local-only. Replaces auth/login-prompt.tsx's LoginBanner. */
export function LocalDataBanner({ message = "Your data is stored on this device. Sign in to sync it." }: { message?: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-line bg-surface-sunken px-4 py-3">
      <div className="flex items-center gap-2.5 text-sm text-ink-muted">
        <Cloud className="h-4 w-4 shrink-0 text-ink-subtle" />
        {message}
      </div>
      <Button size="sm" variant="outline" onClick={() => router.push("/login")} className="shrink-0">
        Sign in
      </Button>
    </div>
  );
}

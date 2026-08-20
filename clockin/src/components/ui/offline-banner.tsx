"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shows a slim banner when the browser loses network connectivity.
 * Uses navigator.onLine + online/offline events — no server dependency.
 */
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Set initial state after mount to avoid SSR mismatch
    setIsOffline(!navigator.onLine);

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed right-0 bottom-0 left-0 z-50 flex items-center justify-center gap-2",
        "bg-warn/90 px-4 py-2 text-sm font-medium text-accent-fg backdrop-blur-sm",
        "border-t border-warn shadow-lg",
        // On mobile, sit above the bottom nav (typically 56–64px tall)
        "pb-[calc(0.5rem+env(safe-area-inset-bottom))]",
      )}
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>You&apos;re offline — timer still works, data syncs when reconnected</span>
    </div>
  );
}

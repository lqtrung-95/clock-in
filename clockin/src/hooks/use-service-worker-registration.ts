"use client";

import { useEffect } from "react";

/**
 * Registers the service worker at /sw.js on mount (browser only).
 * Call once at the root layout level.
 */
export function useServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.error("[SW] Registration failed:", err));
  }, []);
}

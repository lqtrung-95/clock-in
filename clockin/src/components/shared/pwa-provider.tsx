"use client";

import { useServiceWorkerRegistration } from "@/hooks/use-service-worker-registration";
import { OfflineBanner } from "@/components/ui/offline-banner";

/**
 * Mounts once in the root layout.
 * - Registers the service worker for offline caching
 * - Renders the offline connectivity banner
 */
export function PwaProvider() {
  useServiceWorkerRegistration();
  return <OfflineBanner />;
}

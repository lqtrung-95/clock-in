"use client";

import { useCallback, useEffect, useRef } from "react";

/** Request browser notification permission on mount if not already granted/denied. */
export function useFocusNotifications() {
  const permissionRef = useRef<NotificationPermission>("default");

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    permissionRef.current = Notification.permission;
    if (Notification.permission === "default") {
      Notification.requestPermission().then((p) => { permissionRef.current = p; });
    }
  }, []);

  const notify = useCallback((title: string, body: string) => {
    if (typeof Notification === "undefined") return;
    if (permissionRef.current !== "granted") return;
    // Only fire if page is not visible (user switched tabs)
    if (!document.hidden) return;
    try {
      new Notification(title, {
        body,
        icon: "/icons/icon-192x192.png",
        tag: "focus-session",   // replace previous notification of same type
        requireInteraction: true,
      });
    } catch {
      // Silently ignore (e.g. secure context restrictions)
    }
  }, []);

  return { notify };
}

"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Sets data-immersive="true" on <html> while mounted. globals.css hides the
 * sidebar/topbar/tabbar via that attribute instead of relying on a z-index
 * coincidence — the old sidebar and the focus session's fullscreen view were
 * both z-50, which only worked by accident.
 */
export function ImmersiveBoundary({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute("data-immersive", "true");
    return () => document.documentElement.removeAttribute("data-immersive");
  }, []);

  return children;
}

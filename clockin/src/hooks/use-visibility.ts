"use client";

import { useEffect } from "react";

export function useVisibility(onVisible: () => void, onHidden: () => void) {
  useEffect(() => {
    const handler = () => {
      document.hidden ? onHidden() : onVisible();
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [onVisible, onHidden]);
}

"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

export function useFocusFullscreen(phase: string, waitingForNext: string | null) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        toast.error("Fullscreen not supported");
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Track native fullscreen state changes
  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  // Exit fullscreen when session ends or waiting for user to confirm next phase
  useEffect(() => {
    if ((phase === "idle" || waitingForNext) && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [phase, waitingForNext]);

  // Auto-hide controls after 3s of inactivity during active session
  useEffect(() => {
    if (phase === "idle") return;
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };
    window.addEventListener("mousemove", handleMouseMove);
    timeout = setTimeout(() => setShowControls(false), 3000);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, [phase]);

  return { isFullscreen, showControls, toggleFullscreen };
}

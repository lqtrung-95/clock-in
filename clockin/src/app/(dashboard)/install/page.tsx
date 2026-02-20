"use client";

import { useState, useEffect } from "react";
import { Smartphone, Monitor, Share, MoreHorizontal, Plus, Download, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "ios";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

const steps: Record<Platform, { icon: React.ReactNode; title: string; description: string }[]> = {
  ios: [
    {
      icon: <Share className="h-5 w-5" />,
      title: "Tap the Share button",
      description: 'Open Clockin in Safari, then tap the Share icon (□↑) at the bottom of the screen.',
    },
    {
      icon: <Plus className="h-5 w-5" />,
      title: 'Select "Add to Home Screen"',
      description: 'Scroll down in the Share sheet and tap "Add to Home Screen".',
    },
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      title: "Tap Add",
      description: 'Confirm by tapping "Add" in the top-right corner. Clockin will appear on your home screen.',
    },
  ],
  android: [
    {
      icon: <MoreHorizontal className="h-5 w-5" />,
      title: "Open the browser menu",
      description: "Open Clockin in Chrome, then tap the three-dot menu (⋮) in the top-right corner.",
    },
    {
      icon: <Download className="h-5 w-5" />,
      title: 'Tap "Add to Home screen"',
      description: 'Select "Add to Home screen" or "Install app" from the menu.',
    },
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      title: "Confirm install",
      description: 'Tap "Add" or "Install" in the prompt. Clockin will be installed as an app.',
    },
  ],
  desktop: [
    {
      icon: <Download className="h-5 w-5" />,
      title: "Click the install icon",
      description: "Look for the install icon (⊕) in the address bar on the right side in Chrome or Edge.",
    },
    {
      icon: <MoreHorizontal className="h-5 w-5" />,
      title: "Or use the browser menu",
      description: 'Click the three-dot menu → "Install Clockin..." or "Apps" → "Install this site as an app".',
    },
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      title: "Launch from desktop",
      description: "Clockin will open in its own window without browser UI, just like a native app.",
    },
  ],
};

const platformTabs: { id: Platform; label: string; icon: React.ReactNode }[] = [
  { id: "ios", label: "iPhone / iPad", icon: <Smartphone className="h-4 w-4" /> },
  { id: "android", label: "Android", icon: <Smartphone className="h-4 w-4" /> },
  { id: "desktop", label: "Desktop", icon: <Monitor className="h-4 w-4" /> },
];

export default function InstallPage() {
  const [platform, setPlatform] = useState<Platform>("ios");

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  // Check if already installed as PWA
  const isStandalone = typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-lg space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
            <Download className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Install App</h1>
            <p className="text-sm text-muted-foreground">Add Clockin to your home screen</p>
          </div>
        </div>

        {/* Already installed banner */}
        {isStandalone && (
          <div className="flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
            <p className="text-sm font-medium text-green-400">Clockin is already installed on this device!</p>
          </div>
        )}

        {/* Benefits card */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-foreground">Why install?</h2>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              "Instant launch from your home screen",
              "Full-screen experience, no browser UI",
              "Works offline — track time anywhere",
              "Faster load times after first install",
            ].map((b) => (
              <li key={b} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Platform tabs */}
        <div className="flex rounded-xl border border-border bg-card p-1 gap-1">
          {platformTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPlatform(tab.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-200",
                platform === tab.id
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps[platform].map((step, i) => (
            <div
              key={i}
              className="flex gap-4 rounded-2xl border border-border bg-card p-4"
            >
              {/* Step number + icon */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 text-cyan-400">
                  {step.icon}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Content */}
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* iOS Safari note */}
        {platform === "ios" && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
            <p className="text-xs text-amber-400">
              <span className="font-semibold">Note:</span> Installation only works in Safari on iOS. If you&apos;re using Chrome or another browser, open this page in Safari first.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Smartphone, Monitor, Share, MoreHorizontal, Plus, Download, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/ui-app/page-shell";
import { SEGMENTS } from "@/lib/navigation";

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
      description: 'Open Effortful in Safari, then tap the Share icon (□↑) at the bottom of the screen.',
    },
    {
      icon: <Plus className="h-5 w-5" />,
      title: 'Select "Add to Home Screen"',
      description: 'Scroll down in the Share sheet and tap "Add to Home Screen".',
    },
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      title: "Tap Add",
      description: 'Confirm by tapping "Add" in the top-right corner. Effortful will appear on your home screen.',
    },
  ],
  android: [
    {
      icon: <MoreHorizontal className="h-5 w-5" />,
      title: "Open the browser menu",
      description: "Open Effortful in Chrome, then tap the three-dot menu (⋮) in the top-right corner.",
    },
    {
      icon: <Download className="h-5 w-5" />,
      title: 'Tap "Add to Home screen"',
      description: 'Select "Add to Home screen" or "Install app" from the menu.',
    },
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      title: "Confirm install",
      description: 'Tap "Add" or "Install" in the prompt. Effortful will be installed as an app.',
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
      description: 'Click the three-dot menu → "Install Effortful..." or "Apps" → "Install this site as an app".',
    },
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      title: "Launch from desktop",
      description: "Effortful will open in its own window without browser UI, just like a native app.",
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
    <PageShell title="Settings" description="Add Effortful to your home screen" segments={SEGMENTS.settings} width="prose">
        {/* Already installed banner */}
        {isStandalone && (
          <div className="flex items-center gap-3 rounded-2xl border border-success/20 bg-success-soft px-4 py-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
            <p className="text-sm font-medium text-success">Effortful is already installed on this device!</p>
          </div>
        )}

        {/* Benefits card */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent-solid" />
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
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-solid" />
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
                  ? "bg-accent-solid text-accent-fg shadow-sm"
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
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent-solid/20 bg-accent-soft text-accent-solid">
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
          <div className="rounded-2xl border border-warn/20 bg-warn-soft px-4 py-3">
            <p className="text-xs text-warn">
              <span className="font-semibold">Note:</span> Installation only works in Safari on iOS. If you&apos;re using Chrome or another browser, open this page in Safari first.
            </p>
          </div>
        )}
    </PageShell>
  );
}

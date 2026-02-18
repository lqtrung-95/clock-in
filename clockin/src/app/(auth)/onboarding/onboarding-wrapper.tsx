"use client";

import dynamic from "next/dynamic";

const OnboardingContent = dynamic(
  () => import("./onboarding-content"),
  { ssr: false }
);

export function OnboardingWrapper() {
  return <OnboardingContent />;
}

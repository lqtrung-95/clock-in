import dynamic from "next/dynamic";

// Dynamically import with SSR disabled to avoid env var issues during build
const OnboardingContent = dynamic(
  () => import("./onboarding-content"),
  { ssr: false }
);

export default function OnboardingPage() {
  return <OnboardingContent />;
}

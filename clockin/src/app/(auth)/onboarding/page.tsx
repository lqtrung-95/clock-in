// This page must be dynamic to avoid env var issues during static generation
export const dynamic = 'force-dynamic';

import { OnboardingWrapper } from "./onboarding-wrapper";

export default function OnboardingPage() {
  return <OnboardingWrapper />;
}

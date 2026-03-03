import type { Metadata } from "next";
import { PricingPageContent } from "@/components/billing/pricing-page-content";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start Effortful for free. Upgrade to Pro for unlimited sessions, advanced analytics, and AI coaching. Simple, transparent pricing - no hidden fees.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing - Effortful",
    description:
      "Free forever plan. Upgrade to Pro for unlimited focus sessions, AI coaching, and advanced analytics.",
    url: "/pricing",
  },
};

export default function PricingPage() {
  return <PricingPageContent />;
}

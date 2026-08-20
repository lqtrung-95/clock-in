import { LandingNav } from "@/components/landing/landing-nav";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { FocusShowcaseSection } from "@/components/landing/focus-showcase-section";
import { LandingCtaSection } from "@/components/landing/landing-cta-section";
import { JsonLdSchema } from "@/components/shared/json-ld-schema";
import { PricingCards } from "@/components/billing/pricing-cards";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://effortful.app";

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Effortful",
  url: APP_URL,
  description:
    "A gamified focus tracker with Pomodoro timers, ambient video scenes, streaks, social leaderboards, and dream goal tracking. Stay in flow, every day.",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free plan available. Pro plan for advanced features.",
  },
  featureList: [
    "AI Focus Coach",
    "Pomodoro Timer",
    "Immersive Focus Mode",
    "Focus Rooms",
    "Deep Analytics",
    "Goals & Streaks",
  ],
};

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-surface text-ink">
      <JsonLdSchema schema={webAppSchema} />
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <FocusShowcaseSection />

      {/* Pricing section */}
      <section id="pricing" className="px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-wide">
          <div className="mb-12 border-b border-line pb-6 text-center">
            <h2 className="text-title text-ink">Simple pricing</h2>
            <p className="mt-2 text-base text-ink-muted">Free forever. Upgrade when you&apos;re ready.</p>
          </div>
          <PricingCards currentPlan="free" userId={null} />
        </div>
      </section>

      <LandingCtaSection />
      <footer className="border-t border-line py-8 text-center text-sm text-ink-subtle">
        © {new Date().getFullYear()} Effortful — built for makers, dreamers, and doers.
      </footer>
    </main>
  );
}

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
    <main className="min-h-screen bg-[#060614] text-white overflow-x-hidden">
      <JsonLdSchema schema={webAppSchema} />
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <FocusShowcaseSection />

      {/* Pricing section */}
      <section id="pricing" className="py-20 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Simple pricing
            </h2>
            <p className="mt-3 text-base text-white/50">
              Free forever. Upgrade when you&apos;re ready.
            </p>
          </div>
          <PricingCards currentPlan="free" userId={null} />
        </div>
      </section>

      <LandingCtaSection />
      <footer className="border-t border-white/5 py-8 text-center text-sm text-white/25">
        © {new Date().getFullYear()} Effortful - Built for makers, dreamers, and doers.
      </footer>
    </main>
  );
}

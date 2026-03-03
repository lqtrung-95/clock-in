import { LandingNav } from "@/components/landing/landing-nav";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { FocusShowcaseSection } from "@/components/landing/focus-showcase-section";
import { LandingCtaSection } from "@/components/landing/landing-cta-section";
import { JsonLdSchema } from "@/components/shared/json-ld-schema";

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
      <LandingCtaSection />
      <footer className="border-t border-white/5 py-8 text-center text-sm text-white/25">
        © {new Date().getFullYear()} Effortful - Built for makers, dreamers, and doers.
      </footer>
    </main>
  );
}

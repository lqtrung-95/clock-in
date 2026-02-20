import { LandingNav } from "@/components/landing/landing-nav";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { FocusShowcaseSection } from "@/components/landing/focus-showcase-section";
import { LandingCtaSection } from "@/components/landing/landing-cta-section";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#060614] text-white overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <FocusShowcaseSection />
      <LandingCtaSection />
      <footer className="border-t border-white/5 py-8 text-center text-sm text-white/25">
        © {new Date().getFullYear()} Clockin — Built for makers, dreamers, and doers.
      </footer>
    </main>
  );
}

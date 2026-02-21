import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function LandingCtaSection() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Glow */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-64 bg-gradient-to-r from-blue-600/10 via-cyan-600/15 to-blue-600/10 blur-3xl" />

      <div className="relative max-w-3xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
          The work won&apos;t do itself.{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            You will.
          </span>
        </h2>
        <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto">
          No sign-up required. Open the app, pick a category, and start your first session in
          under 10 seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/focus"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-lg shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300"
          >
            Start Tracking
            <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white/70 font-medium text-lg hover:bg-white/10 hover:text-white transition-all duration-300"
          >
            Sign in
          </Link>
        </div>

        <p className="mt-6 text-sm text-white/30">
          Free to start · Works as a guest · Install as a PWA
        </p>
      </div>
    </section>
  );
}

import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Ambient gradient orbs */}
      <div className="absolute top-1/4 -left-64 w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute bottom-1/4 -right-64 w-[500px] h-[500px] rounded-full bg-cyan-600/15 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-purple-700/10 blur-3xl" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/25 mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-sm text-blue-300 font-medium">Free to use · No account required</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
          Turn effort into{" "}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
            momentum
          </span>
        </h1>

        <p className="text-xl text-white/55 max-w-2xl mx-auto mb-10 leading-relaxed">
          Clockin combines Pomodoro timers, immersive focus sessions, streaks, social
          leaderboards, and dream goal tracking — everything you need to show up and do the work.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-lg shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300"
          >
            Start Tracking Free
          </Link>
          <a
            href="#features"
            className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white/70 font-medium text-lg hover:bg-white/10 hover:text-white transition-all duration-300"
          >
            See Features
          </a>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-center">
          {[
            { value: "3 timer modes", label: "Stopwatch, Pomodoro & Focus" },
            { value: "15+ scenes", label: "Video & static backgrounds" },
            { value: "100%", label: "Free, forever" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-white">{stat.value}</span>
              <span className="text-sm text-white/40">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/25 animate-bounce">
        <ChevronDown className="h-5 w-5" />
      </div>
    </section>
  );
}

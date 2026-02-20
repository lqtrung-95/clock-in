import { Timer, Maximize, BarChart3, Flame, Trophy, Mountain } from "lucide-react";

const FEATURES = [
  {
    icon: Timer,
    gradient: "from-blue-500 to-cyan-500",
    glow: "shadow-blue-500/20",
    title: "Pomodoro Timer",
    description:
      "Work in science-backed focused bursts. Choose 25/5, 50/10, or 90/20 presets, track your cycles, and celebrate completions with confetti.",
  },
  {
    icon: Maximize,
    gradient: "from-purple-500 to-pink-500",
    glow: "shadow-purple-500/20",
    title: "Immersive Focus Mode",
    description:
      "Enter fullscreen flow. Pick from Lofi, Rain, Fireplace, Ocean and more video scenes — or layer aurora, stars, and rain overlays over your own backgrounds.",
  },
  {
    icon: BarChart3,
    gradient: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-500/20",
    title: "Deep Analytics",
    description:
      "Heatmaps, daily bar charts, and category breakdowns. See exactly where your hours go, spot your best days, and understand your real patterns.",
  },
  {
    icon: Flame,
    gradient: "from-orange-500 to-red-500",
    glow: "shadow-orange-500/20",
    title: "Goals & Streaks",
    description:
      "Set daily, weekly, or monthly time targets per category. Build unbroken streaks and watch your consistency compound into results.",
  },
  {
    icon: Trophy,
    gradient: "from-indigo-500 to-violet-500",
    glow: "shadow-indigo-500/20",
    title: "Social Leaderboard",
    description:
      "Add friends and see who's putting in the most work this week. Friendly competition is one of the most powerful productivity hacks.",
  },
  {
    icon: Mountain,
    gradient: "from-amber-500 to-yellow-500",
    glow: "shadow-amber-500/20",
    title: "Dream Goal",
    description:
      "Declare your biggest life goal — 1,000 hours to master a skill, 500 hours to build a business. Track every session toward the summit.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">Everything you need</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Built for people who{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              do the work
            </span>
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            Not another to-do app. Clockin is a serious effort tracker for people who measure their progress in hours.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
              >
                {/* Icon */}
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg ${feature.glow} mb-5 transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

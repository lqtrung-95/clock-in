import { Timer, Maximize, BarChart3, Flame, Sparkles, Users } from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    gradient: "from-violet-500 to-purple-500",
    glow: "shadow-violet-500/20",
    title: "AI Focus Coach",
    description: "Get personalized insights, chat with your coach, auto-categorize tasks, and receive smart session suggestions based on your patterns.",
    badge: "New",
  },
  {
    icon: Timer,
    gradient: "from-blue-500 to-cyan-500",
    glow: "shadow-blue-500/20",
    title: "Pomodoro Timer",
    description: "Work in science-backed focused bursts. Choose 25/5, 50/10, or 90/20 presets — or set your own. Auto-start breaks or control manually.",
  },
  {
    icon: Maximize,
    gradient: "from-purple-500 to-pink-500",
    glow: "shadow-purple-500/20",
    title: "Immersive Focus Mode",
    description: "Fullscreen flow with ambient video scenes and layered visual effects. Disappear into deep work.",
  },
  {
    icon: Users,
    gradient: "from-teal-500 to-emerald-500",
    glow: "shadow-teal-500/20",
    title: "Focus Rooms",
    description: "Study together in real-time. Hosts run synchronized Pomodoro sessions for everyone at once.",
    badge: "New",
  },
  {
    icon: BarChart3,
    gradient: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-500/20",
    title: "Deep Analytics",
    description: "Heatmaps, daily charts, and category breakdowns. See exactly where your hours go.",
  },
  {
    icon: Flame,
    gradient: "from-orange-500 to-red-500",
    glow: "shadow-orange-500/20",
    title: "Goals & Streaks",
    description: "Set time targets per category, build unbroken streaks, and watch consistency compound into results.",
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
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  {"badge" in feature && feature.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-violet-500 to-purple-500 text-white uppercase tracking-wide">
                      {feature.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

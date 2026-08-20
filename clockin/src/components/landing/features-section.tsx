import { Timer, Maximize, BarChart3, Flame, Sparkles, Users } from "lucide-react";
import type { DataMetric } from "@/lib/data-metrics";
import { METRIC_CLASS } from "@/lib/data-metrics";

const FEATURES: { icon: typeof Sparkles; metric: DataMetric; title: string; description: string; badge?: string }[] = [
  {
    icon: Sparkles,
    metric: "xp",
    title: "AI Focus Coach",
    description: "Personalized insights, a chat coach, auto-categorized tasks, and session suggestions based on your patterns.",
    badge: "New",
  },
  {
    icon: Timer,
    metric: "focus",
    title: "Pomodoro Timer",
    description: "Work in science-backed bursts. Choose 25/5, 50/10, or 90/20 — or set your own. Auto-start breaks or control manually.",
  },
  {
    icon: Maximize,
    metric: "dream",
    title: "Immersive Focus Mode",
    description: "Fullscreen flow with ambient video scenes and layered visual effects. Disappear into deep work.",
  },
  {
    icon: Users,
    metric: "goal",
    title: "Focus Rooms",
    description: "Study together in real time. Hosts run synchronized Pomodoro sessions for everyone at once.",
    badge: "New",
  },
  {
    icon: BarChart3,
    metric: "neutral",
    title: "Deep Analytics",
    description: "Heatmaps, daily charts, and category breakdowns. See exactly where your hours go.",
  },
  {
    icon: Flame,
    metric: "streak",
    title: "Goals & Streaks",
    description: "Set time targets per category, build unbroken streaks, and watch consistency compound into results.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-content">
        <div className="mb-12 flex items-end justify-between gap-6 border-b border-line pb-6">
          <div>
            <p className="text-label mb-2 text-accent-solid">Everything you need</p>
            <h2 className="text-title text-ink">Built for people who do the work</h2>
          </div>
          <p className="hidden max-w-[32ch] text-sm text-ink-muted sm:block">
            Not another to-do app — a serious effort tracker for people who measure progress in hours.
          </p>
        </div>

        <div className="grid gap-x-10 sm:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            const color = METRIC_CLASS[feature.metric].text;
            return (
              <div key={feature.title} className="flex gap-4 border-b border-line py-6 first:pt-0 sm:[&:nth-child(-n+2)]:pt-0">
                <Icon className={`h-5 w-5 shrink-0 ${color}`} />
                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <h3 className="text-section text-ink">{feature.title}</h3>
                    {feature.badge && (
                      <span className="text-label rounded-full border border-line-strong px-2 py-0.5 text-accent-solid">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-ink-muted">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";

const XP_BARS = [35, 55, 25, 100, 70, 20, 48];

export function HeroSection() {
  return (
    <section className="px-4 pt-32 pb-8 sm:pt-40">
      <div className="mx-auto max-w-content overflow-hidden rounded-lg border border-line bg-surface-raised shadow-card">
        <div className="grid md:grid-cols-[1.1fr_0.9fr]">
          {/* Copy */}
          <div className="flex flex-col justify-center gap-6 p-8 sm:p-12">
            <span className="text-label inline-flex w-fit items-center gap-2 rounded-full border border-line-strong px-3 py-1.5 text-accent-solid">
              <span className="h-1.5 w-1.5 rounded-full bg-data-goal" />
              No account required · Open beta
            </span>

            <h1 className="text-display text-ink">
              Turn effort into <span className="text-accent-solid">momentum</span>
            </h1>

            <p className="max-w-[42ch] text-lg text-ink-muted">
              AI coaching, Pomodoro timers, immersive focus sessions, and streaks that actually
              make you show up.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/focus"
                className="rounded-sm bg-accent-solid px-6 py-3 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-hover"
              >
                Start tracking
              </Link>
              <a
                href="#features"
                className="rounded-sm border border-line-strong px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-sunken"
              >
                See features
              </a>
            </div>

            <div className="flex gap-7 pt-2">
              {[
                { value: "15+", label: "Ambient scenes" },
                { value: "Free", label: "No card needed" },
                { value: "AI", label: "Session coaching" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-0.5">
                  <span className="text-data text-xl text-ink">{stat.value}</span>
                  <span className="text-label text-ink-subtle">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product artifact */}
          <div className="relative hidden min-h-[420px] items-center justify-center border-t border-line bg-surface-sunken md:flex md:border-t-0 md:border-l">
            <div
              className="w-[78%] -rotate-2 rounded-md border border-line bg-surface-raised p-6 shadow-overlay"
            >
              <div className="mb-5 flex items-center gap-4">
                <div
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-full"
                  style={{ background: `conic-gradient(var(--accent-solid) 68%, var(--surface-sunken) 0)` }}
                >
                  <span className="block h-[42px] w-[42px] rounded-full bg-surface-raised" />
                </div>
                <div>
                  <p className="text-lg font-bold text-ink">Level 7</p>
                  <p className="text-label text-ink-subtle">2,340 XP</p>
                </div>
              </div>
              <div className="flex h-11 items-end gap-1.5">
                {XP_BARS.map((h, i) => (
                  <span
                    key={i}
                    className={`flex-1 rounded-t-sm ${h === 100 ? "bg-data-focus" : "bg-data-focus/30"}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="absolute right-[8%] bottom-[14%] flex rotate-2 items-center gap-2 rounded-md border border-line bg-surface-raised px-3.5 py-2.5 text-xs font-semibold text-ink shadow-overlay">
              <span className="h-1.5 w-1.5 rounded-full bg-data-goal" />
              12-day streak
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

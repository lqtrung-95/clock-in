import { Music, Video, Layers, Sun, Plus } from "lucide-react";

const SHOWCASE_ITEMS = [
  { icon: Video, label: "8 built-in scenes + custom YouTube links" },
  { icon: Layers, label: "8 animated overlays — Aurora, Snow, Fireflies & more" },
  { icon: Music, label: "Ambient sounds with volume control" },
  { icon: Sun, label: "Brightness, fullscreen & auto-hiding controls" },
];

export function FocusShowcaseSection() {
  return (
    <section className="px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-content">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Copy */}
          <div>
            <p className="text-label mb-3 text-accent-solid">Focus mode</p>
            <h2 className="text-title mb-6 text-ink">Your office, reimagined</h2>
            <p className="mb-8 max-w-[42ch] text-lg text-ink-muted">
              Step into full-screen focus mode and make distractions impossible. Pick a scene,
              layer on effects, add ambient sound — your timer runs quietly behind it all.
            </p>

            <div className="flex flex-col divide-y divide-line">
              {SHOWCASE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3 py-3 first:pt-0">
                    <Icon className="h-4 w-4 shrink-0 text-accent-solid" />
                    <p className="text-sm text-ink-muted">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Focus session device preview — a deliberately dark panel, like the
              real session it's showing, regardless of the page's own theme. */}
          <div className="relative">
            <div className="relative aspect-video overflow-hidden rounded-md border border-line shadow-overlay">
              <div className="absolute inset-0 bg-[linear-gradient(160deg,#2b1a0f,#120b06)]" />
              <div
                className="absolute inset-0"
                style={{ background: "radial-gradient(circle at 30% 20%, rgba(240,168,104,0.18), transparent 55%)" }}
              />

              <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-[#F0A868]/30 bg-[#2b1a0f]/80 px-3 py-1.5">
                <div className="h-2 w-2 animate-pulse rounded-full bg-[#F0A868]" />
                <span className="text-label text-[#F5EDE3]">Focus time</span>
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="relative flex h-40 w-40 items-center justify-center">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(245,237,227,0.1)" strokeWidth="6" />
                    <circle
                      cx="80"
                      cy="80"
                      r="72"
                      fill="none"
                      stroke="#F0A868"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={452}
                      strokeDashoffset={452 * 0.38}
                    />
                  </svg>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-data font-mono text-4xl text-[#F5EDE3]">24:13</span>
                    <span className="text-xs text-[#F5EDE3]/50">Cycle 2 of 4</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full ${i < 2 ? "w-7 bg-[#F0A868]" : "w-2 bg-[#F5EDE3]/20"}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 flex items-center gap-2.5 rounded-md border border-line bg-surface-raised px-4 py-3 shadow-overlay">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-accent-soft">
                <Plus className="h-4 w-4 text-accent-solid" />
              </div>
              <div>
                <p className="mb-0.5 text-xs leading-none text-ink-subtle">Custom scene</p>
                <p className="text-sm font-semibold text-ink">Add any YouTube link</p>
              </div>
            </div>

            <div className="absolute -right-4 -bottom-4 rounded-md border border-line bg-surface-raised px-4 py-3 shadow-overlay">
              <p className="mb-1.5 text-xs text-ink-subtle">Ambient sound</p>
              <div className="flex items-center gap-2">
                <div className="flex h-4 items-end gap-0.5">
                  {[3, 5, 4, 6, 3, 5, 4].map((h, i) => (
                    <div key={i} className="w-1 rounded-full bg-accent-solid" style={{ height: `${h * 4}px` }} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-ink">Rain</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

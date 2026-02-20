import { Music, Video, Layers, Sun, Plus } from "lucide-react";

const SHOWCASE_ITEMS = [
  {
    icon: Video,
    label: "8 built-in scenes + your own",
    desc: "Lofi Girl, Rain Window, Fireplace, Ocean Waves, Forest, Snowfall, Coffee Shop, Starry Night — or paste any YouTube link",
  },
  {
    icon: Layers,
    label: "5 animated overlays",
    desc: "Aurora borealis, floating particles, vignette pulse, color gradient, falling rain",
  },
  {
    icon: Music,
    label: "4 ambient sounds",
    desc: "Heavy rain, howling wind, coffee shop murmur, rolling thunder — with volume control",
  },
  {
    icon: Sun,
    label: "Full control",
    desc: "Brightness slider, fullscreen toggle, video mute, auto-hiding controls",
  },
];

export function FocusShowcaseSection() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background glow — blue/cyan to match app */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/8 to-transparent" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: copy */}
          <div>
            <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">Focus Mode</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Your office,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                reimagined
              </span>
            </h2>
            <p className="text-lg text-white/55 mb-10 leading-relaxed">
              Step into full-screen focus mode and make distractions impossible. Pick a scene,
              layer on effects, add ambient sound — and disappear into deep work. Your timer
              runs quietly behind it all.
            </p>

            <div className="space-y-5">
              {SHOWCASE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
                      <Icon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{item.label}</p>
                      <p className="text-sm text-white/45 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: mockup matching actual focus page UI */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a1a] aspect-video shadow-2xl shadow-black/60">
              {/* Background gradient matching app */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-[#0a0a1a] to-cyan-900/20" />

              {/* Top-left phase badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600/80 to-cyan-600/80 border border-blue-400/30 shadow-lg">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide">FOCUS TIME</span>
              </div>

              {/* Timer display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                {/* Circular ring hint */}
                <div className="relative flex items-center justify-center w-40 h-40">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                    <circle
                      cx="80" cy="80" r="72"
                      fill="none"
                      stroke="url(#timerGrad)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={452}
                      strokeDashoffset={452 * 0.38}
                    />
                    <defs>
                      <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-4xl font-mono font-bold text-white tabular-nums tracking-tight">24:13</span>
                    <span className="text-xs text-white/50">Cycle 2 of 4</span>
                  </div>
                </div>

                {/* Cycle dots */}
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full ${
                        i < 2
                          ? "w-7 bg-gradient-to-r from-blue-500 to-cyan-400"
                          : "w-2 bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Darkening overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 pointer-events-none" />
            </div>

            {/* Custom video badge */}
            <div className="absolute -bottom-4 -left-4 flex items-center gap-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 shadow-xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-400/20">
                <Plus className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-white/50 leading-none mb-0.5">Custom Scene</p>
                <p className="text-sm font-semibold text-white">Add any YouTube link</p>
              </div>
            </div>

            {/* Ambient sound badge */}
            <div className="absolute -bottom-4 -right-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 shadow-xl">
              <p className="text-xs text-white/50 mb-1.5">Ambient Sound</p>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5 items-end h-4">
                  {[3, 5, 4, 6, 3, 5, 4].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-full"
                      style={{ height: `${h * 4}px` }}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-white">Rain</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

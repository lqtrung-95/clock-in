import { Music, Video, Layers, Sun } from "lucide-react";

const SHOWCASE_ITEMS = [
  {
    icon: Video,
    label: "8 ambient video scenes",
    desc: "Lofi Girl, Rain Window, Fireplace, Ocean Waves, Forest, Snowfall, Coffee Shop, Starry Night",
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
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-purple-600/10 blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div>
            <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">Focus Mode</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Your office,{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                reimagined
              </span>
            </h2>
            <p className="text-lg text-white/55 mb-10 leading-relaxed">
              Step into full-screen focus mode and make distractions impossible. Choose a scene
              that matches your mood, layer on effects, add ambient sound, and disappear into
              deep work. Your timer runs quietly in the background.
            </p>

            <div className="space-y-4">
              {SHOWCASE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 border border-purple-500/20">
                      <Icon className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{item.label}</p>
                      <p className="text-sm text-white/45 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: visual mockup */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/60 aspect-video shadow-2xl shadow-black/60">
              {/* Fake fullscreen timer UI */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-cyan-900/20" />

              {/* Timer display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="text-xs font-bold text-white/60 uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/30">
                  Focus Time
                </div>
                <div className="text-6xl sm:text-7xl font-mono font-bold text-white tabular-nums drop-shadow-2xl">
                  24:13
                </div>
                <div className="text-white/50 text-sm">Cycle 2 of 4</div>
                <div className="flex gap-2 mt-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full transition-all ${
                        i < 2 ? "w-8 bg-gradient-to-r from-blue-500 to-cyan-400" : "w-2.5 bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Ambient overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 shadow-xl">
              <p className="text-xs text-white/50 mb-1">Ambient Sound</p>
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
                <span className="text-sm font-medium text-white">Rain</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

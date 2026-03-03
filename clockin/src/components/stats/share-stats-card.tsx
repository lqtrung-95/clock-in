"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Image as ImageIcon, Flame, Tag, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format, startOfWeek } from "date-fns";
import type { TimeEntry } from "@/types/timer";

interface ShareStatsCardProps {
  entries: TimeEntry[];
  streak: number;
}

/** Derives this-week stats from entries */
function deriveWeekStats(entries: TimeEntry[]) {
  const weekStart = startOfWeek(new Date());
  const weekEntries = entries.filter(
    (e) => e.started_at && new Date(e.started_at) >= weekStart && (e.duration_seconds ?? 0) > 0
  );

  const totalSeconds = weekEntries.reduce((s, e) => s + (e.duration_seconds ?? 0), 0);
  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const totalFocusTime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  // Top category by total seconds
  const byCategory: Record<string, number> = {};
  weekEntries.forEach((e) => {
    if (!e.category?.name) return;
    byCategory[e.category.name] = (byCategory[e.category.name] ?? 0) + (e.duration_seconds ?? 0);
  });
  const topCategory =
    Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return { totalFocusTime, sessions: weekEntries.length, topCategory };
}

/** Inner card rendered to image — keep styling self-contained */
function StatsCard({
  cardRef,
  totalFocusTime,
  sessions,
  streak,
  topCategory,
}: {
  cardRef: React.RefObject<HTMLDivElement | null>;
  totalFocusTime: string;
  sessions: number;
  streak: number;
  topCategory: string;
}) {
  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 w-full"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      {/* Subtle glow blobs */}
      <div className="pointer-events-none absolute -top-8 -left-8 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 -right-8 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">My week in focus</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {format(startOfWeek(new Date()), "MMM d")} – {format(new Date(), "MMM d, yyyy")}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 tracking-wider">effortful.app</span>
        </div>

        {/* Total focus time — hero stat */}
        <div>
          <p className="text-4xl font-extrabold text-white tracking-tight">{totalFocusTime}</p>
          <p className="text-sm text-slate-400">total focus time</p>
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Calendar, label: "Sessions", value: String(sessions) },
            { icon: Flame, label: "Day streak", value: String(streak) },
            { icon: Tag, label: "Top category", value: topCategory },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl bg-white/5 px-3 py-2.5">
              <Icon className="h-3.5 w-3.5 text-blue-400 mb-1" />
              <p className="text-sm font-bold text-white truncate">{value}</p>
              <p className="text-[10px] text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ShareStatsCard({ entries, streak }: ShareStatsCardProps) {
  const [open, setOpen] = useState(false);
  const [copying, setCopying] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { totalFocusTime, sessions, topCategory } = deriveWeekStats(entries);

  async function handleCopyImage() {
    if (!cardRef.current) return;
    setCopying(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast.success("Image copied to clipboard");
    } catch {
      toast.error("Copy failed — try saving the image manually");
    } finally {
      setCopying(false);
    }
  }

  function handleCopyText() {
    const text =
      `My week on effortful.app\n` +
      `Focus time: ${totalFocusTime}\n` +
      `Sessions: ${sessions}\n` +
      `Streak: ${streak} days\n` +
      `Top category: ${topCategory}`;
    navigator.clipboard.writeText(text).then(
      () => toast.success("Text copied"),
      () => toast.error("Copy failed")
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5"
      >
        <Share2 className="h-4 w-4" />
        Share my week
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Share your week</DialogTitle>
          </DialogHeader>

          <StatsCard
            cardRef={cardRef}
            totalFocusTime={totalFocusTime}
            sessions={sessions}
            streak={streak}
            topCategory={topCategory}
          />

          <div className="flex gap-2 mt-2">
            <Button
              className="flex-1 gap-1.5"
              onClick={handleCopyImage}
              disabled={copying}
            >
              <ImageIcon className="h-4 w-4" />
              {copying ? "Copying…" : "Copy as image"}
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={handleCopyText}
            >
              <Copy className="h-4 w-4" />
              Copy text
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toPng } from "html-to-image";
import { Share2, Twitter, Facebook, Linkedin, Download, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareCardProps {
  userName: string;
  stats: {
    totalHours: number;
    sessions: number;
    streak: number;
    focusScore?: number;
  };
  period: "daily" | "weekly" | "monthly";
}

const periodLabels = {
  daily: "Today",
  weekly: "This Week",
  monthly: "This Month",
};

function ProgressCardPreview({
  userName,
  stats,
  period,
}: {
  userName: string;
  stats: ShareCardProps["stats"];
  period: string;
}) {
  return (
    <div
      className="w-[400px] p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{userName}</h2>
          <p className="text-purple-300">{periodLabels[period as keyof typeof periodLabels]} Focus Report</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl">
          ⏱️
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur">
          <p className="text-3xl font-bold text-blue-400">{stats.totalHours.toFixed(1)}</p>
          <p className="text-xs text-gray-400">Hours</p>
        </div>
        <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur">
          <p className="text-3xl font-bold text-green-400">{stats.sessions}</p>
          <p className="text-xs text-gray-400">Sessions</p>
        </div>
        <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur">
          <p className="text-3xl font-bold text-orange-400">{stats.streak}</p>
          <p className="text-xs text-gray-400">Day Streak</p>
        </div>
      </div>

      {stats.focusScore && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Focus Score</span>
            <span className="font-bold">{stats.focusScore}/100</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              style={{ width: `${stats.focusScore}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <p className="text-sm text-gray-400">Clockin - Focus Together</p>
        <p className="text-xs text-gray-500">#Productivity #Focus</p>
      </div>
    </div>
  );
}

export function ShareCard({ userName, stats, period }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const generateImage = async () => {
    if (!cardRef.current) return;

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
      });

      // Download
      const link = document.createElement("a");
      link.download = `focus-report-${period}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  const shareToTwitter = async () => {
    const text = `I focused for ${stats.totalHours.toFixed(1)} hours with ${stats.sessions} sessions this ${period}! 🔥\n\nCurrent streak: ${stats.streak} days\n\nJoin me on Clockin!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const shareToFacebook = () => {
    const url = "https://clockin.app";
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  const copyToClipboard = async () => {
    const text = `I focused for ${stats.totalHours.toFixed(1)} hours with ${stats.sessions} sessions this ${period}! Current streak: ${stats.streak} days 🔥`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Your Progress</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Card Preview */}
          <div className="overflow-x-auto pb-4">
            <div ref={cardRef} className="inline-block">
              <ProgressCardPreview userName={userName} stats={stats} period={period} />
            </div>
          </div>

          {/* Share Options */}
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={shareToTwitter} variant="outline" className="gap-2">
              <Twitter className="h-4 w-4 text-blue-400" />
              Twitter
            </Button>
            <Button onClick={shareToFacebook} variant="outline" className="gap-2">
              <Facebook className="h-4 w-4 text-blue-600" />
              Facebook
            </Button>
            <Button onClick={generateImage} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button onClick={copyToClipboard} variant="outline" className="gap-2">
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied!" : "Copy Text"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Share2 } from "lucide-react";
import confetti from "canvas-confetti";

interface MilestoneModalProps {
  milestone: number;
  open: boolean;
  onClose: () => void;
}

const MILESTONE_MESSAGES: Record<number, { title: string; message: string }> = {
  1: { title: "First Steps!", message: "You've reached 10% of your dream goal!" },
  2: { title: "Quarter Way!", message: "You've reached 25% of your dream goal!" },
  3: { title: "Halfway There!", message: "You've reached 50% of your dream goal!" },
  4: { title: "Almost There!", message: "You've reached 75% of your dream goal!" },
  5: { title: "Dream Achieved!", message: "Congratulations! You've completed your dream goal!" },
};

export function MilestoneModal({ milestone, open, onClose }: MilestoneModalProps) {
  useEffect(() => {
    if (open && milestone > 0) {
      // Trigger confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#FFD700", "#FFA500", "#FF6347"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#FFD700", "#FFA500", "#FF6347"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [open, milestone]);

  const content = MILESTONE_MESSAGES[milestone];
  if (!content) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl">{content.title}</DialogTitle>
          <DialogDescription className="text-base">
            {content.message}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-2">
          <Button onClick={onClose}>Continue</Button>
          <Button variant="outline" onClick={onClose}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

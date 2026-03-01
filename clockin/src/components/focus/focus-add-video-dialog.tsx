"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FocusAddVideoDialogProps {
  open: boolean;
  newVideoUrl: string;
  newVideoTitle: string;
  onOpenChange: (open: boolean) => void;
  onUrlChange: (url: string) => void;
  onTitleChange: (title: string) => void;
  onAdd: () => void;
}

export function FocusAddVideoDialog({
  open,
  newVideoUrl,
  newVideoTitle,
  onOpenChange,
  onUrlChange,
  onTitleChange,
  onAdd,
}: FocusAddVideoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Video</DialogTitle>
          <DialogDescription>Paste a YouTube URL and give it a name.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">YouTube URL</label>
            <Input
              placeholder="https://youtube.com/watch?v=..."
              value={newVideoUrl}
              onChange={(e) => onUrlChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="My Video"
              value={newVideoTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              maxLength={20}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onAdd}>Add Video</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

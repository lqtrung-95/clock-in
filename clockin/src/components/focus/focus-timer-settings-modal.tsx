"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Timer, Volume2, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  type FocusTimerSettings,
  type AlarmSound,
  playAlarmWithWebAudio,
} from "@/hooks/use-focus-timer-settings";

interface Props {
  open: boolean;
  onClose: () => void;
  settings: FocusTimerSettings;
  onSave: (updates: Partial<FocusTimerSettings>) => void;
}

function NumberInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) =>
          onChange(Math.min(max, Math.max(min, parseInt(e.target.value) || min)))
        }
        className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground text-center font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <p className="text-[10px] text-center text-muted-foreground">min</p>
    </div>
  );
}

export function FocusTimerSettingsModal({ open, onClose, settings, onSave }: Props) {
  const [local, setLocal] = useState<FocusTimerSettings>(settings);

  // Reset local state each time modal opens
  useEffect(() => {
    if (open) setLocal(settings);
  }, [open, settings]);

  const handleSave = () => {
    onSave(local);
    onClose();
  };

  const previewAlarm = () => {
    playAlarmWithWebAudio(local.alarmSound, local.alarmVolume);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="border border-border bg-card max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">Timer Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-1">
          {/* Timer durations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Time (minutes)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <NumberInput
                label="Pomodoro"
                value={local.workMinutes}
                min={1}
                max={120}
                onChange={(v) => setLocal((p) => ({ ...p, workMinutes: v }))}
              />
              <NumberInput
                label="Short Break"
                value={local.shortBreakMinutes}
                min={1}
                max={60}
                onChange={(v) => setLocal((p) => ({ ...p, shortBreakMinutes: v }))}
              />
              <NumberInput
                label="Long Break"
                value={local.longBreakMinutes}
                min={1}
                max={120}
                onChange={(v) => setLocal((p) => ({ ...p, longBreakMinutes: v }))}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Long Break Interval</p>
                <p className="text-xs text-muted-foreground">Pomodoros before a long break</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLocal((p) => ({ ...p, longBreakInterval: Math.max(1, p.longBreakInterval - 1) }))}
                  className="h-7 w-7 rounded-lg border border-border bg-card text-foreground hover:bg-muted flex items-center justify-center text-sm font-bold"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-mono font-semibold text-foreground">
                  {local.longBreakInterval}
                </span>
                <button
                  onClick={() => setLocal((p) => ({ ...p, longBreakInterval: Math.min(10, p.longBreakInterval + 1) }))}
                  className="h-7 w-7 rounded-lg border border-border bg-card text-foreground hover:bg-muted flex items-center justify-center text-sm font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Auto-start */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Auto-start
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Auto-start breaks</p>
                <p className="text-xs text-muted-foreground">Jump to break when work ends</p>
              </div>
              <Switch
                checked={local.autoStartBreak}
                onCheckedChange={(v) => setLocal((p) => ({ ...p, autoStartBreak: v }))}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Auto-start pomodoros</p>
                <p className="text-xs text-muted-foreground">Jump to work when break ends</p>
              </div>
              <Switch
                checked={local.autoStartWork}
                onCheckedChange={(v) => setLocal((p) => ({ ...p, autoStartWork: v }))}
              />
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Alarm sound */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Alarm Sound
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={local.alarmSound}
                onValueChange={(v) =>
                  setLocal((p) => ({ ...p, alarmSound: v as AlarmSound }))
                }
              >
                <SelectTrigger className="flex-1 border-border bg-muted text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border border-border bg-card">
                  <SelectItem value="bell" className="text-foreground">Bell</SelectItem>
                  <SelectItem value="digital" className="text-foreground">Digital</SelectItem>
                  <SelectItem value="chime" className="text-foreground">Chime</SelectItem>
                  <SelectItem value="none" className="text-foreground">None</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={previewAlarm}
                disabled={local.alarmSound === "none" || local.alarmVolume === 0}
                className="border-border text-foreground hover:bg-muted"
              >
                Test
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Volume</Label>
                <span className="text-xs font-mono text-muted-foreground">
                  {local.alarmVolume}%
                </span>
              </div>
              <Slider
                value={[local.alarmVolume]}
                onValueChange={([v]) => setLocal((p) => ({ ...p, alarmVolume: v }))}
                min={0}
                max={100}
                step={5}
                disabled={local.alarmSound === "none"}
                className="w-full"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

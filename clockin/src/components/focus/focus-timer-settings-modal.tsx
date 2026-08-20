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
      <Label className="text-xs text-ink-muted">{label}</Label>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) =>
          onChange(Math.min(max, Math.max(min, parseInt(e.target.value) || min)))
        }
        className="w-full rounded-lg border border-line bg-muted px-3 py-2 text-sm text-ink text-center font-mono focus:outline-none focus:ring-1 focus:ring-accent-ring"
      />
      <p className="text-[10px] text-center text-ink-muted">min</p>
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
      <DialogContent className="border border-line bg-card max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-ink">Timer Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-1">
          {/* Timer durations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-accent-solid" />
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
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

            <div className="flex items-center justify-between rounded-xl border border-line bg-surface-sunken px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">Long Break Interval</p>
                <p className="text-xs text-ink-muted">Pomodoros before a long break</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLocal((p) => ({ ...p, longBreakInterval: Math.max(1, p.longBreakInterval - 1) }))}
                  className="h-7 w-7 rounded-lg border border-line bg-card text-ink hover:bg-surface-sunken flex items-center justify-center text-sm font-bold"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-mono font-semibold text-ink">
                  {local.longBreakInterval}
                </span>
                <button
                  onClick={() => setLocal((p) => ({ ...p, longBreakInterval: Math.min(10, p.longBreakInterval + 1) }))}
                  className="h-7 w-7 rounded-lg border border-line bg-card text-ink hover:bg-surface-sunken flex items-center justify-center text-sm font-bold"
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
              <Zap className="h-4 w-4 text-accent-solid" />
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                Auto-start
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-line bg-surface-sunken px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">Auto-start breaks</p>
                <p className="text-xs text-ink-muted">Jump to break when work ends</p>
              </div>
              <Switch
                checked={local.autoStartBreak}
                onCheckedChange={(v) => setLocal((p) => ({ ...p, autoStartBreak: v }))}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-line bg-surface-sunken px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">Auto-start pomodoros</p>
                <p className="text-xs text-ink-muted">Jump to work when break ends</p>
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
              <Volume2 className="h-4 w-4 text-accent-solid" />
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
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
                <SelectTrigger className="flex-1 border-line bg-muted text-ink">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border border-line bg-surface-raised">
                  <SelectItem value="bell" className="text-ink">Bell</SelectItem>
                  <SelectItem value="digital" className="text-ink">Digital</SelectItem>
                  <SelectItem value="chime" className="text-ink">Chime</SelectItem>
                  <SelectItem value="none" className="text-ink">None</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={previewAlarm}
                disabled={local.alarmSound === "none" || local.alarmVolume === 0}
                className="border-line text-ink hover:bg-surface-sunken"
              >
                Test
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-ink-muted">Volume</Label>
                <span className="text-xs font-mono text-ink-muted">
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

            <div className="flex items-center justify-between rounded-xl border border-line bg-surface-sunken px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">Repeat alarm</p>
                <p className="text-xs text-ink-muted">Keep ringing until you tap the screen</p>
              </div>
              <Switch
                checked={local.alarmRepeat}
                disabled={local.alarmSound === "none"}
                onCheckedChange={(v) => setLocal((p) => ({ ...p, alarmRepeat: v }))}
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-accent-solid text-accent-fg hover:bg-accent-hover"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

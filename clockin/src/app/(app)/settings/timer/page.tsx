"use client";

import { PageShell } from "@/components/ui-app/page-shell";
import { Section } from "@/components/ui-app/section";
import { DataCard } from "@/components/ui-app/data-card";
import { Field } from "@/components/ui-app/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFocusTimerSettings, playAlarmWithWebAudio, type AlarmSound } from "@/hooks/use-focus-timer-settings";
import { SEGMENTS } from "@/lib/navigation";

/**
 * Previously only reachable via a 260-line modal opened from the Focus
 * setup screen. Giving it a route means settings persist the same way as
 * every other preference page — change, saved immediately, no explicit
 * Save button. useFocusTimerSettings already persists to localStorage on
 * every update, so this page is a direct read/write over it.
 */
export default function TimerSettingsPage() {
  const { settings, updateSettings } = useFocusTimerSettings();

  return (
    <PageShell title="Settings" description="Timer durations, auto-advance, and the session-end alarm." segments={SEGMENTS.settings}>
      <Section title="Durations">
        <DataCard>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Pomodoro (min)">
              <Input
                type="number"
                min={1}
                max={120}
                value={settings.workMinutes}
                onChange={(e) => updateSettings({ workMinutes: clamp(e.target.value, 1, 120) })}
              />
            </Field>
            <Field label="Short break (min)">
              <Input
                type="number"
                min={1}
                max={60}
                value={settings.shortBreakMinutes}
                onChange={(e) => updateSettings({ shortBreakMinutes: clamp(e.target.value, 1, 60) })}
              />
            </Field>
            <Field label="Long break (min)">
              <Input
                type="number"
                min={1}
                max={120}
                value={settings.longBreakMinutes}
                onChange={(e) => updateSettings({ longBreakMinutes: clamp(e.target.value, 1, 120) })}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between rounded-sm border border-line bg-surface-sunken px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink">Long break interval</p>
              <p className="text-xs text-ink-muted">Pomodoros before a long break</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => updateSettings({ longBreakInterval: Math.max(1, settings.longBreakInterval - 1) })}
              >
                −
              </Button>
              <span className="w-6 text-center text-sm font-semibold tabular-nums text-ink">{settings.longBreakInterval}</span>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => updateSettings({ longBreakInterval: Math.min(10, settings.longBreakInterval + 1) })}
              >
                +
              </Button>
            </div>
          </div>
        </DataCard>
      </Section>

      <Section title="Auto-start">
        <DataCard>
          <div className="flex items-center justify-between rounded-sm border border-line bg-surface-sunken px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink">Auto-start breaks</p>
              <p className="text-xs text-ink-muted">Jump to break when work ends</p>
            </div>
            <Switch checked={settings.autoStartBreak} onCheckedChange={(v) => updateSettings({ autoStartBreak: v })} />
          </div>
          <div className="flex items-center justify-between rounded-sm border border-line bg-surface-sunken px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink">Auto-start pomodoros</p>
              <p className="text-xs text-ink-muted">Jump to work when break ends</p>
            </div>
            <Switch checked={settings.autoStartWork} onCheckedChange={(v) => updateSettings({ autoStartWork: v })} />
          </div>
        </DataCard>
      </Section>

      <Section title="Alarm">
        <DataCard>
          <div className="flex items-center gap-2">
            <Select value={settings.alarmSound} onValueChange={(v) => updateSettings({ alarmSound: v as AlarmSound })}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bell">Bell</SelectItem>
                <SelectItem value="digital">Digital</SelectItem>
                <SelectItem value="chime">Chime</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => playAlarmWithWebAudio(settings.alarmSound, settings.alarmVolume)}
              disabled={settings.alarmSound === "none" || settings.alarmVolume === 0}
            >
              Test
            </Button>
          </div>

          <Field label="Volume" hint={`${settings.alarmVolume}%`}>
            <Slider
              value={[settings.alarmVolume]}
              onValueChange={([v]) => updateSettings({ alarmVolume: v })}
              min={0}
              max={100}
              step={5}
              disabled={settings.alarmSound === "none"}
            />
          </Field>

          <div className="flex items-center justify-between rounded-sm border border-line bg-surface-sunken px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink">Repeat alarm</p>
              <p className="text-xs text-ink-muted">Keep ringing until you tap the screen</p>
            </div>
            <Switch
              checked={settings.alarmRepeat}
              disabled={settings.alarmSound === "none"}
              onCheckedChange={(v) => updateSettings({ alarmRepeat: v })}
            />
          </div>
        </DataCard>
      </Section>
    </PageShell>
  );
}

function clamp(raw: string, min: number, max: number): number {
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

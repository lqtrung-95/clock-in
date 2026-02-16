# Phase 04: Pomodoro & Focus Mode

## Context Links
- [Parent Plan](./plan.md)
- [Frontend Research](./research/researcher-01-frontend-stack.md) — Web Audio API, canvas-confetti, Page Visibility API
- Depends on: [Phase 03](./phase-03-timer-and-entries.md)

## Overview
- **Priority:** P1
- **Status:** pending
- **Effort:** 8h
- **Description:** Pomodoro timer with presets (25/5, 50/10, 90/20) + custom intervals. Focus mode: full-screen immersive UI with curated background images, ambient sounds (Web Audio API), YouTube/Spotify playlist embed. Session completion celebrations with canvas-confetti + stat summary.

## Key Insights
- **Pomodoro extends timer:** Same timestamp-based engine. Pomodoro adds cycle tracking (work→break→work→break) and auto-transitions.
- **Web Audio API autoplay:** Browsers require user gesture before audio plays. Must play after explicit user interaction. Use `AudioContext.resume()` pattern.
- **Ambient sounds:** Ship as Opus/MP3 files (~200-500KB each). Use `loop: true` on Audio element or `AudioBufferSourceNode.loop`. Preload on focus mode entry.
- **Background images:** 10-20 curated WebP files (< 200KB each). Ship in `/public/backgrounds/`. Lazy-load non-active.
- **canvas-confetti:** ~5KB, vanilla JS. Fire on cycle/session completion. No performance concern for one-shot animation.
- **Playlist embed:** YouTube iframe or Spotify embed. No auth needed for public playlists. Use `allow="autoplay"` attribute.

## Requirements

### Functional
- Pomodoro presets: 25/5, 50/10, 90/20 (work/break minutes)
- Custom work/break intervals (saved to user_preferences)
- Visual cycle indicator: shows current cycle (e.g., 2/4), work vs break phase
- Auto-transition: work → break → work (with notification sound)
- Pause/resume pomodoro (pauses current phase)
- Stop pomodoro early (saves completed cycles)
- Each pomodoro work phase creates a time_entry (type='pomodoro')
- Focus mode: full-screen overlay (covers dashboard shell)
- Background image picker (grid of thumbnails)
- Ambient sounds: rain, cafe, forest, white noise, ocean, fireplace
- Volume control slider
- YouTube/Spotify playlist embed in focus mode
- Session completion: confetti burst + stat summary (total time, cycles completed, category)
- Browser notification on cycle completion (if permitted)
- Pomodoro state persists across page reload (Zustand persist)

### Non-Functional
- Audio latency < 100ms on play/pause
- Focus mode renders at 60fps (no jank from timer updates)
- Background images lazy-loaded (only active image in memory)
- Total ambient sound files < 3MB

## Architecture

### Pomodoro State Machine
```
IDLE → (start) → WORKING → (timer ends) → BREAK → (timer ends) → WORKING → ...
                         → (pause) → PAUSED_WORK → (resume) → WORKING
                  BREAK  → (pause) → PAUSED_BREAK → (resume) → BREAK
                  Any    → (stop)  → IDLE (save session)

After final cycle: WORKING → COMPLETED → IDLE (save + celebrate)
```

### Zustand Pomodoro Store Shape
```typescript
interface PomodoroState {
  status: 'idle' | 'working' | 'break' | 'paused_work' | 'paused_break' | 'completed';
  preset: '25/5' | '50/10' | '90/20' | 'custom';
  workMinutes: number;
  breakMinutes: number;
  totalCycles: number;
  currentCycle: number;          // 1-based
  phaseStartedAt: number | null; // Unix ms
  phasePausedAt: number | null;
  phaseAccumulatedMs: number;
  categoryId: string | null;
  sessionId: string | null;      // pomodoro_sessions.id

  // Actions
  start: (categoryId: string, preset: PomodoroPreset) => void;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<PomodoroSession>;
  completePhase: () => void;     // Auto-called when phase timer ends
}
```

### Audio Architecture
```
User enters focus mode → AudioContext created (suspended)
User taps "Enable Sound" → AudioContext.resume() (user gesture)
  → Load selected sound file (fetch → ArrayBuffer → decodeAudioData)
  → Create AudioBufferSourceNode → connect to GainNode → connect to destination
  → source.loop = true; source.start()

Volume slider → GainNode.gain.value = 0.0–1.0
Switch sound → Stop current source → Load new → Start
Exit focus mode → Stop source → Close AudioContext
```

### Focus Mode Layout
```
┌──────────────────────────────────────┐
│  [Background Image - Full Screen]     │
│                                       │
│     ┌─────────────────────┐          │
│     │  Category: Study     │          │
│     │                      │          │
│     │    ██████████████    │          │
│     │    █  25:00     █    │          │
│     │    █  Cycle 2/4 █    │          │
│     │    ██████████████    │          │
│     │                      │          │
│     │  [Pause]    [Stop]   │          │
│     └─────────────────────┘          │
│                                       │
│  ┌────────┐  ┌────────────────┐      │
│  │🔊 Rain │  │ ▶ Spotify/YT  │      │
│  │ ━━━━○━ │  │   Embed       │      │
│  └────────┘  └────────────────┘      │
│                              [Exit ×] │
└──────────────────────────────────────┘
```

## Related Code Files

### Files to Create
- `src/stores/pomodoro-store.ts` — Zustand store with persist
- `src/hooks/use-pomodoro.ts` — Pomodoro tick + phase transition hook
- `src/hooks/use-audio.ts` — Web Audio API management hook
- `src/components/pomodoro/pomodoro-timer.tsx` — Countdown display + progress ring
- `src/components/pomodoro/pomodoro-presets.tsx` — Preset selector buttons
- `src/components/pomodoro/cycle-progress.tsx` — Visual cycle dots/bar
- `src/components/focus/focus-mode-overlay.tsx` — Full-screen container
- `src/components/focus/background-picker.tsx` — Image selection grid
- `src/components/focus/ambient-sound-player.tsx` — Sound selector + volume
- `src/components/focus/playlist-embed.tsx` — YouTube/Spotify iframe
- `src/components/shared/confetti-trigger.tsx` — canvas-confetti wrapper
- `src/app/(dashboard)/focus/page.tsx` — Focus mode entry page
- `src/data/background-images.ts` — Image metadata array
- `public/backgrounds/*.webp` — 10-20 background images
- `public/sounds/*.mp3` — 6 ambient sound files

### Files to Modify
- `src/services/time-entry-service.ts` — Add pomodoro-specific entry creation
- `src/stores/timer-store.ts` — Integrate with pomodoro flow (optional, may keep separate)

## Implementation Steps

### 1. Create Pomodoro store
`src/stores/pomodoro-store.ts`:
- Implement state machine (idle → working → break → ...)
- `start()`: Create pomodoro_session in Supabase, start first work phase, create time_entry
- `completePhase()`: If work phase → transition to break; if break → increment cycle, start work. If final cycle → status = completed
- `stop()`: Save completed_cycles to pomodoro_sessions, stop any active time_entry
- Persist: status, phaseStartedAt, currentCycle, sessionId, categoryId

### 2. Create Pomodoro tick hook
`src/hooks/use-pomodoro.ts`:
```typescript
function usePomodoro() {
  const store = usePomodoroStore(useShallow(...));
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (store.status !== 'working' && store.status !== 'break') return;
    const phaseMs = (store.status === 'working' ? store.workMinutes : store.breakMinutes) * 60 * 1000;
    let rafId: number;

    const tick = () => {
      const elapsed = Date.now() - store.phaseStartedAt! - store.phaseAccumulatedMs;
      const left = Math.max(0, phaseMs - elapsed);
      setRemaining(left);

      if (left <= 0) {
        store.completePhase(); // Auto-transition
        return;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [store.status, store.phaseStartedAt, store.phaseAccumulatedMs]);

  return { remaining, formatted: formatDuration(remaining), ...store };
}
```

### 3. Create Web Audio hook
`src/hooks/use-audio.ts`:
```typescript
function useAudio() {
  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const play = async (soundUrl: string) => {
    if (!contextRef.current) {
      contextRef.current = new AudioContext();
      gainRef.current = contextRef.current.createGain();
      gainRef.current.connect(contextRef.current.destination);
    }
    await contextRef.current.resume(); // Requires user gesture

    const response = await fetch(soundUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await contextRef.current.decodeAudioData(arrayBuffer);

    sourceRef.current?.stop();
    const source = contextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = true;
    source.connect(gainRef.current!);
    source.start();
    sourceRef.current = source;
  };

  const setVolume = (v: number) => {
    if (gainRef.current) gainRef.current.gain.value = v;
  };

  const stop = () => { sourceRef.current?.stop(); sourceRef.current = null; };
  const cleanup = () => { stop(); contextRef.current?.close(); };

  return { play, stop, setVolume, cleanup };
}
```

### 4. Create background image data
`src/data/background-images.ts`:
```typescript
export const backgroundImages = [
  { id: 'mountain-lake', name: 'Mountain Lake', file: '/backgrounds/mountain-lake.webp' },
  { id: 'forest-path', name: 'Forest Path', file: '/backgrounds/forest-path.webp' },
  { id: 'ocean-sunset', name: 'Ocean Sunset', file: '/backgrounds/ocean-sunset.webp' },
  { id: 'rainy-window', name: 'Rainy Window', file: '/backgrounds/rainy-window.webp' },
  { id: 'cozy-cafe', name: 'Cozy Cafe', file: '/backgrounds/cozy-cafe.webp' },
  { id: 'starry-night', name: 'Starry Night', file: '/backgrounds/starry-night.webp' },
  { id: 'zen-garden', name: 'Zen Garden', file: '/backgrounds/zen-garden.webp' },
  { id: 'library', name: 'Library', file: '/backgrounds/library.webp' },
  { id: 'northern-lights', name: 'Northern Lights', file: '/backgrounds/northern-lights.webp' },
  { id: 'autumn-park', name: 'Autumn Park', file: '/backgrounds/autumn-park.webp' },
] as const;

export const ambientSounds = [
  { id: 'rain', name: 'Rain', file: '/sounds/rain.mp3', icon: 'cloud-rain' },
  { id: 'cafe', name: 'Cafe', file: '/sounds/cafe.mp3', icon: 'coffee' },
  { id: 'forest', name: 'Forest', file: '/sounds/forest.mp3', icon: 'trees' },
  { id: 'white-noise', name: 'White Noise', file: '/sounds/white-noise.mp3', icon: 'radio' },
  { id: 'ocean', name: 'Ocean', file: '/sounds/ocean.mp3', icon: 'waves' },
  { id: 'fireplace', name: 'Fireplace', file: '/sounds/fireplace.mp3', icon: 'flame' },
] as const;
```

### 5. Build Pomodoro timer component
`src/components/pomodoro/pomodoro-timer.tsx`:
- Circular progress ring (SVG) showing remaining time
- Large countdown text (MM:SS) in center
- Phase label: "WORK" or "BREAK" with color coding
- Smooth ring animation via CSS `stroke-dashoffset`

### 6. Build preset selector
`src/components/pomodoro/pomodoro-presets.tsx`:
- Button group: 25/5 | 50/10 | 90/20 | Custom
- Custom: two number inputs (work minutes, break minutes)
- Cycle count selector (default 4, range 1-10)
- Save custom preset to user_preferences via Supabase

### 7. Build cycle progress indicator
`src/components/pomodoro/cycle-progress.tsx`:
- Row of dots/circles representing total cycles
- Filled = completed, pulsing = current, empty = remaining
- e.g., `● ● ◉ ○` for cycle 3/4

### 8. Build focus mode overlay
`src/components/focus/focus-mode-overlay.tsx`:
- Full-viewport overlay (z-50, fixed position)
- Background image as `<Image>` with object-cover
- Semi-transparent dark overlay for text readability
- Timer/pomodoro component centered
- Bottom bar: ambient sound controls + playlist embed
- Exit button (top-right corner)
- Escape key to exit
- Prevent body scroll when active

### 9. Build background picker
`src/components/focus/background-picker.tsx`:
- Grid of thumbnail images (lazy-loaded)
- Click to select → updates background
- Save preference to user_preferences
- Highlighted border on selected

### 10. Build ambient sound player
`src/components/focus/ambient-sound-player.tsx`:
- Horizontal list of sound buttons with icons
- Active sound highlighted
- Volume slider (0–100%)
- Play/stop on tap (requires user gesture for first play)
- Save preference to user_preferences

### 11. Build playlist embed
`src/components/focus/playlist-embed.tsx`:
- Two tabs: YouTube | Spotify
- YouTube: input field for playlist URL → render iframe
- Spotify: input field for playlist URL → render Spotify embed
- Store last used playlist URL in preferences
- Compact player (minimal height, ~80px)

### 12. Build confetti trigger
`src/components/shared/confetti-trigger.tsx`:
```typescript
import confetti from 'canvas-confetti';

export function triggerConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'],
  });
}

// Session complete celebration (bigger)
export function triggerSessionComplete() {
  const duration = 3000;
  const end = Date.now() + duration;
  const frame = () => {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}
```

### 13. Build session completion summary
After pomodoro completes, show modal/card with:
- Total focused time (sum of work phases)
- Cycles completed
- Category tracked
- Confetti animation fires
- "Start Another" or "Done" buttons

### 14. Create focus page
`src/app/(dashboard)/focus/page.tsx`:
- Entry point: select category + preset → enter focus mode
- Renders FocusModeOverlay when active
- Pre-loads user's preferred background + sound from preferences

### 15. Source ambient sound + background files
- Background images: source from Unsplash (free license), optimize to WebP < 200KB each
- Ambient sounds: source from freesound.org (CC0 license), convert to MP3, loop-ready, ~200-500KB each
- Place in `public/backgrounds/` and `public/sounds/`

### 16. Add browser notifications
```typescript
// Request permission on first focus mode entry
if (Notification.permission === 'default') {
  await Notification.requestPermission();
}

// On phase complete
if (Notification.permission === 'granted') {
  new Notification('Clockin', {
    body: phase === 'work' ? 'Break time! Take a rest.' : 'Back to work! Stay focused.',
    icon: '/icons/icon-192x192.png',
  });
}
```

## Todo List
- [ ] Create Pomodoro Zustand store with persist
- [ ] Create Pomodoro tick hook with auto-transition
- [ ] Create Web Audio API hook
- [ ] Source + optimize 10 background images (WebP)
- [ ] Source + optimize 6 ambient sounds (MP3)
- [ ] Create background-images.ts data file
- [ ] Build PomodoroTimer component (progress ring + countdown)
- [ ] Build PomodoroPresets component
- [ ] Build CycleProgress component
- [ ] Build FocusModeOverlay (full-screen)
- [ ] Build BackgroundPicker
- [ ] Build AmbientSoundPlayer
- [ ] Build PlaylistEmbed (YouTube + Spotify)
- [ ] Build confetti trigger utility
- [ ] Build session completion summary modal
- [ ] Create focus page
- [ ] Add browser notification on phase completion
- [ ] Save preferences (background, sound, preset) to Supabase
- [ ] Test: full pomodoro cycle (4x work/break) completes correctly
- [ ] Test: pause/resume during work and break phases
- [ ] Test: stop early saves correct completed_cycles
- [ ] Test: ambient sound plays after user gesture, loops seamlessly
- [ ] Test: background image loads and displays correctly
- [ ] Test: confetti fires on session completion
- [ ] Test: pomodoro persists through page reload

## Success Criteria
- Full Pomodoro cycle runs correctly (work → break → work → ... → complete)
- Audio plays without errors after user interaction
- Focus mode is truly full-screen, blocks dashboard navigation
- Session completion shows confetti + accurate summary
- Preferences saved and restored between sessions
- Works on mobile (touch interactions, responsive layout)

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Safari Web Audio restrictions | High | Test early on iOS Safari; use Audio element fallback |
| Large audio files slow loading | Medium | Compress to ~200KB; preload on focus entry |
| YouTube embed blocked by CSP | Medium | Configure `frame-src` in CSP; test embed URLs |
| Background images too large | Low | Optimize to WebP < 200KB; lazy-load thumbnails |
| Focus mode z-index conflicts | Low | Use z-50; test with all UI layers |

## Security Considerations
- Audio files served from same origin (no CORS issues)
- YouTube/Spotify embeds: use `sandbox` attribute on iframe for isolation
- No user-uploaded content in MVP (curated backgrounds only)
- Notification API: request permission explicitly, handle denial gracefully

## Next Steps
- Phase 05: Dashboard + analytics (consumes pomodoro session data)

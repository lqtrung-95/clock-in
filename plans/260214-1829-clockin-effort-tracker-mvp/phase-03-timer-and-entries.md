# Phase 03: Timer & Entries

## Context Links
- [Parent Plan](./plan.md)
- [Frontend Research](./research/researcher-01-frontend-stack.md)
- Depends on: [Phase 02](./phase-02-database-and-auth.md)

## Overview
- **Priority:** P1 (core product functionality)
- **Status:** pending
- **Effort:** 10h
- **Description:** Build the timestamp-based timer engine, manual time entry form, category CRUD with templates, and Zustand stores with persist middleware. Implements Page Visibility API for background tab accuracy and Supabase Realtime for cross-device sync.

## Key Insights
- **Timer accuracy:** Store `started_at` timestamp; calculate elapsed on each tick via `Date.now() - startedAt`. Never rely on `setInterval` accumulation.
- **Page Visibility API:** Detect tab inactive → store pause timestamp. On refocus → compute delta. Timer continues running (just UI frozen in background).
- **Zustand persist:** Built-in `persist` middleware auto-syncs to localStorage. Use `onRehydrateStorage()` to validate stale state on reload.
- **requestAnimationFrame:** Use for UI tick updates in foreground. Store holds state, component drives render loop. Prevents store churn.
- **Realtime:** Subscribe to `time_entries` changes filtered by user_id for cross-device sync.

## Requirements

### Functional
- Start/stop/pause timer with single button
- Timer displays HH:MM:SS, updates ~60fps in foreground
- Select category before/during timer
- Timer persists across page reloads (Zustand persist → localStorage)
- Timer recovers correct elapsed time after background tab (Page Visibility API)
- Stop timer → save time_entry to Supabase with calculated duration_seconds
- Manual entry form: date picker, start time, end time OR duration, category, notes
- Category CRUD: create, edit, archive (soft delete), reorder
- 6 preset categories seeded on signup (handled in Phase 02 trigger)
- Quick-start widget: shows last used category, one-tap to start timer
- Active timer indicator in navigation (pulsing dot or timer badge)
- Supabase Realtime: if timer started on device A, device B shows conflict dialog ("Timer running on another device. Take over?")
<!-- Updated: Validation Session 1 - Changed from passive sync to conflict dialog -->

### Non-Functional
- Timer accuracy within 1 second over 8-hour session
- Offline: timer state in localStorage continues; sync on reconnect
- < 16ms render time for timer tick (60fps target)

## Architecture

### Timer State Machine
```
IDLE → (start) → RUNNING → (pause) → PAUSED → (resume) → RUNNING
                         → (stop)  → IDLE (save entry)
                  PAUSED → (stop)  → IDLE (save entry)
```

### Zustand Timer Store Shape
```typescript
interface TimerState {
  status: 'idle' | 'running' | 'paused';
  categoryId: string | null;
  startedAt: number | null;        // Unix ms timestamp
  pausedAt: number | null;         // Unix ms when paused
  accumulatedMs: number;           // Total paused time accumulated
  lastEntryId: string | null;      // For quick-start
  lastCategoryId: string | null;   // For quick-start

  // Actions
  start: (categoryId: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<TimeEntry>;
  reset: () => void;
}
```

### Timer Tick Hook
```typescript
// use-timer.ts
function useTimer() {
  const { status, startedAt, accumulatedMs } = useTimerStore(useShallow(...));
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (status !== 'running' || !startedAt) return;
    let rafId: number;
    const tick = () => {
      setElapsed(Date.now() - startedAt - accumulatedMs);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [status, startedAt, accumulatedMs]);

  return { elapsed, formatted: formatDuration(elapsed) };
}
```

### Data Flow
```
User taps Start → timerStore.start(categoryId)
  → Store sets: status=running, startedAt=Date.now(), categoryId
  → Zustand persist → localStorage
  → INSERT time_entry (started_at, category_id, ended_at=NULL) to Supabase
  → Realtime broadcasts to other devices

User taps Stop → timerStore.stop()
  → Calculate: duration = Date.now() - startedAt - accumulatedMs
  → UPDATE time_entry SET ended_at=now(), duration_seconds=duration/1000
  → Store resets to idle
  → Return saved entry for UI (confetti, summary)
```

## Related Code Files

### Files to Create
- `src/stores/timer-store.ts` — Zustand store with persist
- `src/stores/category-store.ts` — Categories cache store
- `src/hooks/use-timer.ts` — Timer tick + elapsed time hook
- `src/hooks/use-visibility.ts` — Page Visibility API hook
- `src/hooks/use-supabase.ts` — Supabase browser client hook
- `src/services/time-entry-service.ts` — CRUD operations for time_entries
- `src/services/category-service.ts` — CRUD operations for categories
- `src/types/timer.ts` — Timer-related TypeScript types
- `src/lib/utils.ts` — Add `formatDuration()` helper
- `src/components/timer/timer-display.tsx` — HH:MM:SS clock face
- `src/components/timer/timer-controls.tsx` — Start/stop/pause buttons
- `src/components/timer/quick-start-widget.tsx` — Resume last activity
- `src/components/entries/entry-list.tsx` — Time entries table
- `src/components/entries/entry-form.tsx` — Manual entry dialog
- `src/components/entries/entry-card.tsx` — Single entry row
- `src/components/categories/category-list.tsx` — Category grid
- `src/components/categories/category-form.tsx` — Create/edit dialog
- `src/components/categories/category-badge.tsx` — Inline badge
- `src/app/(dashboard)/timer/page.tsx` — Timer page
- `src/app/(dashboard)/entries/page.tsx` — Entries list page
- `src/app/(dashboard)/categories/page.tsx` — Categories page
- `src/data/preset-categories.ts` — Category templates (for display)

## Implementation Steps

### 1. Create timer types
`src/types/timer.ts`:
```typescript
export type TimerStatus = 'idle' | 'running' | 'paused';
export type EntryType = 'timer' | 'manual' | 'pomodoro';

export interface TimeEntry {
  id: string;
  user_id: string;
  category_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  entry_type: EntryType;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  category?: Category;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  sort_order: number;
  is_archived: boolean;
}
```

### 2. Create Page Visibility hook
`src/hooks/use-visibility.ts`:
```typescript
export function useVisibility(onVisible: () => void, onHidden: () => void) {
  useEffect(() => {
    const handler = () => {
      document.hidden ? onHidden() : onVisible();
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [onVisible, onHidden]);
}
```

### 3. Create Zustand timer store with persist
`src/stores/timer-store.ts`:
- State: status, categoryId, startedAt, pausedAt, accumulatedMs, lastCategoryId
- Actions: start, pause, resume, stop (async → saves to Supabase), reset
- Persist middleware with `name: 'clockin-timer'`
- `onRehydrateStorage`: validate that persisted running timer still makes sense (check if startedAt is within last 24h)

### 4. Create timer tick hook
`src/hooks/use-timer.ts`:
- Uses `requestAnimationFrame` loop when status === 'running'
- Returns `{ elapsedMs, formatted, status, categoryId }`
- Integrates with `useVisibility` to handle background tabs

### 5. Create time entry service
`src/services/time-entry-service.ts`:
```typescript
export const timeEntryService = {
  async startTimer(userId: string, categoryId: string): Promise<TimeEntry> {
    const { data, error } = await supabase
      .from('time_entries')
      .insert({ user_id: userId, category_id: categoryId, started_at: new Date().toISOString(), entry_type: 'timer' })
      .select().single();
    if (error) throw error;
    return data;
  },

  async stopTimer(entryId: string, durationSeconds: number): Promise<TimeEntry> {
    const { data, error } = await supabase
      .from('time_entries')
      .update({ ended_at: new Date().toISOString(), duration_seconds: durationSeconds })
      .eq('id', entryId)
      .select().single();
    if (error) throw error;
    return data;
  },

  async createManualEntry(entry: ManualEntryInput): Promise<TimeEntry> { ... },
  async getEntries(userId: string, dateRange: DateRange): Promise<TimeEntry[]> { ... },
  async deleteEntry(entryId: string): Promise<void> { ... },
  async getActiveEntry(userId: string): Promise<TimeEntry | null> { ... },
};
```

### 6. Create category service
`src/services/category-service.ts`:
- `getCategories(userId)` — fetch all non-archived, ordered by sort_order
- `createCategory(input)` — insert new
- `updateCategory(id, input)` — update name/color/icon
- `archiveCategory(id)` — set is_archived = true
- `reorderCategories(ids[])` — batch update sort_order

### 7. Build timer display component
`src/components/timer/timer-display.tsx`:
- Large HH:MM:SS text (monospace font for stability)
- Category name + color indicator above timer
- Pulsing animation when running
- Subtle color shift based on elapsed time

### 8. Build timer controls component
`src/components/timer/timer-controls.tsx`:
- Category selector dropdown (required before start)
- Large start/pause button (toggle)
- Stop button (appears when running/paused)
- Discard button (cancel without saving)

### 9. Build quick-start widget
`src/components/timer/quick-start-widget.tsx`:
- Shows last used category from store
- "Resume: [Category Name]" with one-tap start
- Falls back to category selector if no history

### 10. Build manual entry form
`src/components/entries/entry-form.tsx`:
- Dialog/sheet with: date picker, start time, end time, OR duration input
- Category selector, notes textarea
- Auto-calculates duration from start/end times
- Validates: end > start, duration > 0, category required

### 11. Build entry list
`src/components/entries/entry-list.tsx`:
- Fetch entries for selected date range (default: last 7 days)
- Group by date
- Each entry shows: category badge, duration, time range, notes preview
- Delete action with confirmation

### 12. Build category management
`src/components/categories/category-list.tsx` + `category-form.tsx`:
- Grid of category cards with color + icon
- Create new category dialog (name, color picker, icon selector)
- Edit existing category
- Archive (soft delete) with confirmation
- Drag-to-reorder (optional: use `@dnd-kit/core` or simple up/down arrows)

### 13. Set up Supabase Realtime subscription
In dashboard layout or timer page:
```typescript
useEffect(() => {
  const channel = supabase
    .channel('timer-sync')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'time_entries',
      filter: `user_id=eq.${userId}`,
    }, (payload) => {
      // Sync timer state from other device
      handleRealtimeUpdate(payload);
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [userId]);
```

### 14. Create timer page
`src/app/(dashboard)/timer/page.tsx`:
- Server component wrapper → fetch active entry if any
- Client components: TimerDisplay, TimerControls, QuickStartWidget
- Below timer: recent entries (last 5)

### 15. Create entries page
`src/app/(dashboard)/entries/page.tsx`:
- Date range filter (today, 7d, 30d, custom)
- EntryList component
- "Add Manual Entry" button → opens EntryForm dialog

### 16. Create categories page
`src/app/(dashboard)/categories/page.tsx`:
- CategoryList with CRUD
- Archived categories toggle

## Todo List
- [ ] Create timer types (`src/types/timer.ts`)
- [ ] Create Page Visibility hook
- [ ] Create Zustand timer store with persist
- [ ] Create timer tick hook (requestAnimationFrame)
- [ ] Create time entry service (start, stop, manual, list, delete)
- [ ] Create category service (CRUD + reorder)
- [ ] Build TimerDisplay component
- [ ] Build TimerControls component
- [ ] Build QuickStartWidget component
- [ ] Build EntryForm (manual entry dialog)
- [ ] Build EntryList + EntryCard
- [ ] Build CategoryList + CategoryForm + CategoryBadge
- [ ] Create timer page
- [ ] Create entries page
- [ ] Create categories page
- [ ] Set up Supabase Realtime subscription for timer sync
- [ ] Add `formatDuration()` to utils
- [ ] Test: start/stop timer → entry saved with correct duration
- [ ] Test: pause/resume → accumulated pause time excluded
- [ ] Test: page reload → timer resumes from localStorage
- [ ] Test: background tab → correct elapsed on refocus
- [ ] Test: manual entry → validates and saves correctly
- [ ] Test: category CRUD → create, edit, archive works

## Success Criteria
- Timer accurate within 1 second over 8-hour session
- Timer persists through page reload
- Background tab doesn't cause timer drift
- Manual entries save with correct duration
- Categories CRUD fully functional
- Quick-start shows last category and launches timer
- Entries list displays grouped by date
- Realtime sync: timer started on tab A appears on tab B

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Timer drift in background tabs | High | Timestamp-based; never accumulate intervals |
| localStorage quota exceeded | Low | Timer state is < 1KB; only store essential fields |
| Realtime connection drops | Medium | Supabase auto-reconnects; show sync status badge |
| Zustand hydration mismatch (SSR) | Medium | Use `skipHydration` or dynamic import for timer components |

## Security Considerations
- time_entry_service always passes `user_id` from auth context, never from client input
- RLS policies enforce server-side; client is defense-in-depth
- Validate duration_seconds > 0 and < 86400 (24h max single entry)
- Sanitize notes field (XSS prevention via React default escaping)

## Next Steps
- Phase 04: Pomodoro timer (extends timer store)
- Phase 05: Dashboard (consumes time entries data)

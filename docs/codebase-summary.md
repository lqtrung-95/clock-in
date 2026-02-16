# Clockin - Product Requirements Document (PRD)

**Product:** Clockin - Effort Tracker
**Type:** Motivation-driven time tracking PWA
**Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Supabase, Zustand, Recharts

---

## 1. Authentication & User Management

**Status:** Complete

- Email/password auth via Supabase
- Guest mode (localStorage-based, no login required)
- Onboarding flow: new users select preset categories
- OAuth callback handler
- Auth state hook for session persistence
- Login prompt banners for guest users

**DB:** `profiles` (id, user_id, display_name, avatar_url, timezone)

---

## 2. Timer / Stopwatch

**Status:** Complete

- Start/pause/stop timer with category selection
- Real-time display via `requestAnimationFrame`
- Persistent state (Zustand + localStorage, survives refresh)
- Tab visibility handling (continues in background)
- 24h stale timer auto-reset
- Guest mode support
- Quick-start widget with category shortcuts

**DB:** `time_entries` (id, user_id, category_id, started_at, ended_at, duration_seconds, entry_type, notes)
**Store:** timer-store (status, categoryId, startedAt, pausedAt, accumulatedMs)

---

## 3. Pomodoro Timer

**Status:** Complete

- Configurable work/break presets (25/5, 50/10, 90/20)
- Multi-cycle support (default 4)
- Circular progress indicator
- Phase transitions (work -> break -> work)
- Auto-complete with notification
- Session recovery after browser close
- Saves completed work sessions to time entries
- Confetti on session completion

**DB:** `pomodoro_sessions` (id, user_id, time_entry_id, work_minutes, break_minutes, completed_cycles, total_cycles, status)
**Store:** pomodoro-store (phase, cycle, totalCycles, workMinutes, breakMinutes, startedAt, completedSessions)

---

## 4. Focus Mode

**Status:** Complete

- Immersive fullscreen timer experience
- **Video backgrounds** (8 YouTube embeds): Lofi Girl, Rain, Fireplace, Ocean, Forest, Snow, Coffee Shop, Starry Night
- **Static image backgrounds** (7 Unsplash): Forest, Ocean, Mountain, Night Sky, Rain, Library, Cafe
- **Animated overlays** (5): Aurora, Particles/Stars, Rain, Vignette, Gradient
- **Ambient sounds** (4): Rain, Wind, Coffee, Thunder with volume control
- Background brightness slider
- Auto-hide controls on mouse inactivity
- Fullscreen toggle, video mute toggle
- Ken Burns effect on static images
- Works with both stopwatch and Pomodoro timer

---

## 5. Categories

**Status:** Complete

- CRUD operations for tracking categories
- Color picker + icon selection
- Drag-to-reorder with sort_order
- Archive/restore (soft delete)
- 8 preset categories: Work, Study, Exercise, Reading, Side Project, Creative, Meditation, Language
- Guest mode: full CRUD in localStorage

**DB:** `categories` (id, user_id, name, color, icon, sort_order, is_archived)

---

## 6. Time Entries & History

**Status:** Complete

- Manual entry creation (start/end time, duration, notes)
- Edit and delete existing entries
- History view with period filter (7/30 days)
- Entry type differentiation (timer/manual/pomodoro)
- Category display with color badges
- Guest mode support

---

## 7. Dashboard

**Status:** Complete

- Today's stats: hours tracked, session count
- Weekly activity bar chart (7-day)
- Current streak + longest streak display
- Active timer widget (conditional, when running)
- Active goals preview (top 3 with progress bars)
- Recent entries list (last 5)
- Quick actions: Track Time, Focus Mode
- Glass morphism design with gradient backgrounds

---

## 8. Statistics & Analytics

**Status:** Complete

- Daily bar chart with period selection (7/14/30 days)
- Category breakdown pie chart
- 4 stat cards: total hours, sessions, streak, avg minutes
- Tab interface: Daily Hours / By Category
- Recharts visualizations, responsive
- Guest mode: shows local data (limited)

---

## 9. Goals

**Status:** Complete | Auth required

- Create time goals: daily/weekly/monthly
- Set target minutes per period
- Optional category filtering
- Real-time progress calculation with percentage
- Progress bar visualization
- Goal deletion

**DB:** `goals` (id, user_id, category_id, target_minutes, period, is_active)

---

## 10. Streaks

**Status:** Complete | Auth required

- Track consecutive days of activity
- Auto-update on time logging
- Current streak + longest streak
- Displayed on dashboard and goals page

**DB:** `streaks` (id, user_id, current_streak, longest_streak, last_active_date)

---

## 11. Badges (Gamification)

**Status:** Placeholder - definitions only, no UI/logic

- 12 badge definitions: first entry, streak milestones (3/7/30 days), hour milestones (10/50/100h), pomodoro count, category diversity, early bird, night owl
- DB schema exists but earning logic not implemented
- No badge display page

**DB:** `user_badges` (id, user_id, badge_key, earned_at)

---

## 12. Challenges

**Status:** Placeholder - definitions only, no UI/logic

- 6 challenge definitions:
  - Daily: 1h, 2h, 4h goals
  - Weekly: 10h, 20h, 40h goals
- DB schema exists but activation/progress logic not implemented
- No challenge UI

**DB:** `challenges` (id, user_id, challenge_key, target_minutes, progress_minutes, period_start, period_end, status)

---

## 13. Settings & Preferences

**Status:** Complete

- Theme: light/dark/system
- Pomodoro preset preference
- Email digest toggle (auth only)
- Saves to DB (auth) or localStorage (guest)

**DB:** `user_preferences` (id, user_id, theme, preferred_background, preferred_ambient_sound, pomodoro_preset, custom_work_minutes, custom_break_minutes, email_digest_enabled)

---

## 14. PWA

**Status:** Partial

- Manifest.json configured (name, icons, theme)
- Apple web app capable metadata
- **Missing:** Service worker, offline caching, push notifications, offline data sync

---

## 15. Layout & Navigation

**Status:** Complete

- Floating sidebar (desktop) with active route highlighting
- Mobile bottom navigation
- 8 routes: Dashboard, Track, Focus, History, Stats, Goals, Categories, Settings
- Auth state display + sign in/out
- Fully responsive

---

## 16. Guest Mode

**Status:** Complete

- Full offline functionality without auth
- localStorage keys: guest-entries, guest-categories, guest-sessions, guest-preferences
- Timer + Pomodoro state persistence (Zustand persist)
- Default categories for guests
- **Missing:** Data migration guest -> auth user on signup

---

## 17. Cross-device Timer Conflict Resolution

**Status:** Partial

- 24h stale timer detection + auto-reset on rehydration
- **Missing:** Real-time cross-device sync via Supabase Realtime, active conflict detection

---

## Implementation Status Summary

| Feature | Status | Guest Mode |
|---|---|---|
| Authentication | Complete | N/A (guest mode itself) |
| Timer/Stopwatch | Complete | Yes |
| Pomodoro Timer | Complete | Yes |
| Focus Mode | Complete | Yes |
| Categories | Complete | Yes |
| Time Entries | Complete | Yes |
| Dashboard | Complete | Yes (limited) |
| Statistics | Complete | Yes (limited) |
| Goals | Complete | Auth only |
| Streaks | Complete | Auth only |
| Badges | Placeholder | Auth only |
| Challenges | Placeholder | Auth only |
| Settings | Complete | Yes |
| PWA | Partial | Yes |
| Navigation | Complete | Yes |
| Guest Mode | Complete | N/A |
| Cross-device Sync | Partial | N/A |

## Gaps / Future Work

1. **Badge earning system** - UI + logic to award and display badges
2. **Challenge system** - UI + activation + progress tracking
3. **Service worker** - offline caching, push notifications
4. **Guest -> auth migration** - transfer localStorage data on signup
5. **Real-time sync** - cross-device timer via Supabase Realtime
6. **Motivational messages** - definitions exist (`motivational-messages.ts`) but usage unclear

## Database Schema (11 migrations)

1. `profiles` - user profile data
2. `categories` - tracking categories
3. `time_entries` - logged time records
4. `pomodoro_sessions` - pomodoro session metadata
5. `streaks` - streak tracking
6. `goals` - time goals
7. `user_badges` - earned badges
8. `challenges` - active challenges
9. `user_preferences` - user settings
10. RLS policies (row-level security)
11. Triggers & functions (auto-updates)

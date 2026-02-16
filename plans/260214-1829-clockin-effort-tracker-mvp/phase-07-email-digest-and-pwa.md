# Phase 07: Email Digest & PWA Polish

## Context Links
- [Parent Plan](./plan.md)
- [Backend Research](./reports/researcher-02-backend-infra.md) — pg_cron, Resend, Edge Functions
- Depends on: [Phase 02](./phase-02-database-and-auth.md), [Phase 06](./phase-06-gamification.md)

## Overview
- **Priority:** P2
- **Status:** pending
- **Effort:** 6h
- **Description:** Weekly email digest via Supabase Edge Function + pg_cron + Resend. PWA offline caching finalization (IndexedDB for timer state, service worker caching strategies). Dark/light mode polish. Settings page. Final PWA manifest + icons. Performance optimization pass.

## Key Insights
- **pg_cron:** Supabase-native PostgreSQL scheduler. Create cron job that calls Edge Function URL via `net.http_post`. Runs inside Supabase infra, no external scheduler needed.
- **Resend:** Email API with React-based templates. TypeScript SDK. Free tier: 100 emails/day. Store API key in Edge Function secrets.
- **Edge Functions:** Deno-based. Access Supabase DB with service role key (bypasses RLS). Deploy via `supabase functions deploy`.
- **Offline sync:** IndexedDB for structured data (pending entries). localStorage for UI state (timer, preferences). Service worker handles asset caching. On reconnect: push pending entries from IndexedDB sync queue.
- **Conflict dialog:** For cross-device timer conflicts, show user a dialog ("Timer running on another device. Take over?"). For offline entry sync, use last-write-wins on `updated_at` timestamps (acceptable since entries are immutable once completed).
<!-- Updated: Validation Session 1 - Changed from LWW to conflict dialog for active timers -->

## Requirements

### Functional

**Weekly Email Digest:**
- Sent every Monday 9am UTC (configurable in user_preferences)
- Content: total hours last week, top categories, streak status, goals progress, motivational message
- User can enable/disable in settings (email_digest_enabled)
- Skip if user had 0 entries last week
- Track last_digest_sent_at to prevent duplicates
- Unsubscribe link in email footer

**Offline PWA:**
- Timer continues working offline (localStorage state)
- Manual entries queued in IndexedDB when offline
- Sync queue processes on reconnect (background sync)
- "Offline" indicator in UI when disconnected
- App shell cached (HTML, CSS, JS) for instant offline load
- Service worker update prompt ("New version available — Refresh")

**Settings Page:**
- Profile: display name, avatar (from OAuth), timezone
- Theme: light / dark / system
- Pomodoro defaults: preset, custom work/break minutes
- Focus mode: default background, default ambient sound
- Email digest: enabled/disabled toggle
- Data: export entries (CSV) — stretch goal, defer if time-constrained
- Account: logout, delete account (with confirmation)

**Dark/Light Mode:**
- System preference auto-detect via next-themes
- Manual toggle in header/settings
- Persisted to user_preferences
- All components respect theme (shadcn/ui handles this natively)
- Focus mode respects theme for non-background elements

### Non-Functional
- Email sends within 30s of cron trigger
- Offline → online sync within 5s of reconnect
- Service worker cache < 5MB total
- Settings page loads < 1s

## Architecture

### Email Digest Flow
```
pg_cron (Monday 9am UTC)
  → HTTP POST to Edge Function URL (with auth header)
  → Edge Function:
     1. Query users WHERE email_digest_enabled = true
        AND (last_digest_sent_at IS NULL OR last_digest_sent_at < now() - interval '6 days')
     2. For each user:
        a. Query time_entries (last 7 days) → aggregate stats
        b. Query streaks → current/longest
        c. Query goals → progress
        d. Render HTML email from template
        e. Send via Resend API
        f. Update last_digest_sent_at
     3. Log results (success/failure count)
```

### Offline Sync Architecture
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   App UI    │────▶│  Zustand     │────▶│ localStorage│
│ (React)     │     │  (timer)     │     │ (persist)   │
│             │     └──────────────┘     └─────────────┘
│             │
│             │     ┌──────────────┐     ┌─────────────┐
│             │────▶│  Services    │────▶│  Supabase   │
│             │     │ (CRUD)       │     │  (online)   │
│             │     │              │     └─────────────┘
│             │     │   if offline │     ┌─────────────┐
│             │     │   ─────────▶ │────▶│ IndexedDB   │
│             │     │              │     │ (sync queue)│
│             │     └──────────────┘     └─────────────┘
│             │                                │
│             │     On reconnect:              │
│             │     ◀──────────────────────────┘
│             │     Process sync queue → POST to Supabase
└─────────────┘
```

### Service Worker Cache Strategy
```
Precache (install):
  - App shell (HTML, CSS, JS bundles)
  - PWA icons
  - Fonts

Runtime cache:
  - Background images: CacheFirst (rarely change)
  - Ambient sounds: CacheFirst (static assets)
  - API responses: NetworkFirst (fresh data preferred, fallback to cache)
  - Supabase auth: NetworkOnly (never cache auth)
```

## Related Code Files

### Files to Create
- `supabase/functions/weekly-digest/index.ts` — Edge Function
- `src/lib/offline-sync.ts` — IndexedDB + sync queue logic
- `src/hooks/use-online-status.ts` — Online/offline detection hook
- `src/components/shared/offline-indicator.tsx` — "Offline" badge
- `src/components/shared/update-prompt.tsx` — SW update notification
- `src/app/(dashboard)/settings/page.tsx` — Settings page
- `src/components/settings/profile-settings.tsx` — Profile section
- `src/components/settings/theme-settings.tsx` — Theme toggle
- `src/components/settings/pomodoro-settings.tsx` — Pomodoro defaults
- `src/components/settings/notification-settings.tsx` — Email digest toggle
- `src/components/settings/account-settings.tsx` — Logout + delete
- `src/components/layout/top-nav-bar.tsx` — Add theme toggle + offline indicator

### Files to Modify
- `src/app/sw.ts` — Finalize cache strategies
- `src/app/layout.tsx` — Add online status provider, update prompt
- `src/stores/preferences-store.ts` — Zustand store for preferences
- `src/services/time-entry-service.ts` — Add offline queue fallback
- `next.config.ts` — CSP headers, PWA metadata

## Implementation Steps

### 1. Create Edge Function for weekly digest
`supabase/functions/weekly-digest/index.ts`:
```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);
const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

Deno.serve(async (req) => {
  // Verify cron secret header
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${Deno.env.get("CRON_SECRET")}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Get eligible users
  const { data: users } = await supabase
    .from("user_preferences")
    .select("user_id, profiles(display_name, user:auth.users(email))")
    .eq("email_digest_enabled", true)
    .or("last_digest_sent_at.is.null,last_digest_sent_at.lt." + sixDaysAgo());

  let sent = 0;
  let failed = 0;

  for (const user of users || []) {
    try {
      const stats = await getUserWeeklyStats(user.user_id);
      if (stats.totalSeconds === 0) continue; // Skip inactive users

      const html = renderDigestEmail(user, stats);
      await resend.emails.send({
        from: "Clockin <digest@clockin.app>",
        to: [user.email],
        subject: `Your Week in Review — ${formatHours(stats.totalSeconds)} logged`,
        html,
      });

      await supabase
        .from("user_preferences")
        .update({ last_digest_sent_at: new Date().toISOString() })
        .eq("user_id", user.user_id);

      sent++;
    } catch (e) {
      console.error(`Failed for user ${user.user_id}:`, e);
      failed++;
    }
  }

  return new Response(JSON.stringify({ sent, failed }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

### 2. Set up pg_cron job
```sql
-- Run in Supabase SQL Editor (one-time setup)
SELECT cron.schedule(
  'weekly-digest',
  '0 9 * * 1',  -- Every Monday at 9am UTC
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/weekly-digest',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
```

### 3. Create email HTML template
Inline-styled HTML (email-safe):
- Header: Clockin logo + "Your Week in Review"
- Stats grid: Total hours | Top category | Streak | Focus score
- Category breakdown bars (inline CSS)
- Goal progress section
- Motivational message
- Footer: settings link + unsubscribe link

### 4. Deploy Edge Function
```bash
npx supabase functions deploy weekly-digest
npx supabase secrets set RESEND_API_KEY=re_xxxxx
npx supabase secrets set CRON_SECRET=your-random-secret
```

### 5. Implement offline sync module
`src/lib/offline-sync.ts`:
```typescript
const DB_NAME = 'clockin-offline';
const STORE_NAME = 'sync-queue';

interface SyncItem {
  id: string;
  action: 'insert' | 'update' | 'delete';
  table: string;
  data: Record<string, unknown>;
  timestamp: number;
}

export const offlineSync = {
  async addToQueue(item: Omit<SyncItem, 'id' | 'timestamp'>): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await tx.store.add({
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    });
  },

  async processQueue(): Promise<{ success: number; failed: number }> {
    const db = await openDB();
    const items = await db.getAll(STORE_NAME);
    let success = 0, failed = 0;

    for (const item of items) {
      try {
        await syncToSupabase(item);
        await db.delete(STORE_NAME, item.id);
        success++;
      } catch {
        failed++;
      }
    }
    return { success, failed };
  },

  async getPendingCount(): Promise<number> {
    const db = await openDB();
    return db.count(STORE_NAME);
  },
};
```

### 6. Create online status hook
`src/hooks/use-online-status.ts`:
```typescript
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      offlineSync.processQueue(); // Auto-sync on reconnect
    };
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return isOnline;
}
```

### 7. Create offline indicator
`src/components/shared/offline-indicator.tsx`:
- Small badge/pill in top nav: "Offline" (yellow)
- Shows pending sync count: "3 entries pending"
- Disappears when online + synced

### 8. Create SW update prompt
`src/components/shared/update-prompt.tsx`:
- Listen for service worker update event
- Show toast/banner: "New version available" + "Refresh" button
- On click: `registration.waiting.postMessage({ type: 'SKIP_WAITING' })` + reload

### 9. Finalize service worker
`src/app/sw.ts`:
- Ensure precache includes app shell
- CacheFirst for `/backgrounds/*` and `/sounds/*`
- NetworkFirst for API routes
- Skip caching for auth endpoints
- Handle SW update lifecycle (skipWaiting + clientsClaim)

### 10. Create preferences store
`src/stores/preferences-store.ts`:
```typescript
interface PreferencesState {
  theme: 'light' | 'dark' | 'system';
  preferredBackground: string;
  preferredAmbientSound: string;
  pomodoroPreset: string;
  emailDigestEnabled: boolean;

  setTheme: (theme: string) => void;
  setBackground: (bg: string) => void;
  setSound: (sound: string) => void;
  syncFromServer: (prefs: UserPreferences) => void;
  syncToServer: () => Promise<void>;
}
```

### 11. Build settings page
`src/app/(dashboard)/settings/page.tsx`:
- Sections: Profile, Appearance, Pomodoro, Notifications, Account
- Each section is a separate component (< 200 lines each)
- Save changes immediately (optimistic update + Supabase sync)

### 12. Build profile settings
`src/components/settings/profile-settings.tsx`:
- Display name input
- Avatar (read-only from OAuth, or upload future)
- Timezone selector (Intl.supportedValuesOf('timeZone'))
- Save button

### 13. Build theme settings
`src/components/settings/theme-settings.tsx`:
- Three-way toggle: Light | Dark | System
- Preview of selected theme
- Uses next-themes `setTheme()`
- Sync to user_preferences

### 14. Build notification settings
`src/components/settings/notification-settings.tsx`:
- Email digest: toggle on/off
- Browser notifications: toggle + permission request
- Notification time preference (future)

### 15. Build account settings
`src/components/settings/account-settings.tsx`:
- Logout button → `supabase.auth.signOut()` → redirect to /login
- Delete account: confirmation dialog → "Type DELETE to confirm"
  → Delete all user data (CASCADE handles it) → sign out
  → Note: use Edge Function or server action for account deletion (needs service role)

### 16. Add theme toggle to navigation
In `src/components/layout/top-nav-bar.tsx`:
- Sun/Moon icon button
- Cycles: system → light → dark → system
- Visible on all pages

### 17. Performance optimization
- Verify Lighthouse PWA score > 90
- Add `<link rel="preload">` for critical fonts
- Lazy-load Recharts (dynamic import)
- Image optimization: next/image for all images
- Bundle analysis: `npm run build && npx @next/bundle-analyzer`

### 18. Final PWA manifest
Ensure `layout.tsx` metadata includes:
```typescript
export const metadata: Metadata = {
  title: "Clockin - Track Your Effort",
  description: "Motivation-driven time tracking with Pomodoro, streaks, and gamification",
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Clockin",
  },
};
```

### 19. Create proper PWA icons
- `public/icons/icon-192x192.png` — for Android
- `public/icons/icon-512x512.png` — for splash screen
- `public/icons/apple-touch-icon.png` — 180x180 for iOS
- `public/favicon.ico` — 32x32

## Todo List
- [ ] Create weekly-digest Edge Function
- [ ] Create email HTML template
- [ ] Set up pg_cron job
- [ ] Deploy Edge Function + set secrets
- [ ] Implement IndexedDB offline sync module
- [ ] Create online status hook
- [ ] Create offline indicator component
- [ ] Create SW update prompt component
- [ ] Finalize service worker cache strategies
- [ ] Create preferences Zustand store
- [ ] Build settings page
- [ ] Build profile settings component
- [ ] Build theme settings component
- [ ] Build notification settings component
- [ ] Build account settings component (logout + delete)
- [ ] Add theme toggle to top nav
- [ ] Create proper PWA icons (192, 512, apple-touch)
- [ ] Finalize PWA manifest metadata
- [ ] Modify time-entry-service for offline fallback
- [ ] Performance optimization pass (Lighthouse)
- [ ] Test: email digest sends with correct stats
- [ ] Test: offline timer works + syncs on reconnect
- [ ] Test: PWA installable on iOS + Android
- [ ] Test: dark/light/system theme works everywhere
- [ ] Test: settings save and persist correctly
- [ ] Test: account deletion cascades all data
- [ ] Test: SW update prompt appears on new deployment

## Success Criteria
- Weekly digest email delivers with accurate stats
- App works offline (timer, cached shell)
- Pending entries sync within 5s of reconnect
- PWA installable on iOS Safari + Android Chrome
- Lighthouse PWA score > 90
- Dark/light mode consistent across all pages
- Settings save and restore correctly
- Account deletion removes all user data

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| pg_cron not enabled on Supabase plan | High | Verify plan supports pg_cron; fallback: Vercel Cron |
| Resend free tier limit (100/day) | Medium | Batch users; monitor daily count; upgrade if needed |
| IndexedDB not available (private browsing) | Medium | Fallback to localStorage queue; graceful degradation |
| iOS Safari PWA limitations | Medium | Test thoroughly; document known limitations |
| Edge Function cold start latency | Low | Acceptable for cron (not user-facing) |

## Security Considerations
- Edge Function authenticates via CRON_SECRET header (prevents unauthorized triggers)
- Service role key only in Edge Function (never in client)
- Email unsubscribe link uses signed token (prevents unauthorized unsubscribe)
- Account deletion uses server action with auth verification
- Offline sync queue validated server-side on sync (prevent tampered data)
- CSP headers configured in next.config.ts (frame-src for YouTube/Spotify)

## Next Steps
- Post-MVP: Phase 2 features (social, heatmap, push notifications, data export)
- Monitor: email delivery rates, PWA install rates, offline usage patterns

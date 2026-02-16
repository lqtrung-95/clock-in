# Phase 02: Database & Auth

## Context Links
- [Parent Plan](./plan.md)
- [Backend Research](./reports/researcher-02-backend-infra.md)
- [PRD](../reports/brainstorm-260214-1829-clockin-effort-tracker-prd.md)
- Depends on: [Phase 01](./phase-01-project-setup.md)

## Overview
- **Priority:** P1 (blocks all data-dependent phases)
- **Status:** pending
- **Effort:** 8h
- **Description:** Create complete Supabase database schema with all tables, indexes, RLS policies, triggers. Implement email/password + Google OAuth auth flow with @supabase/ssr middleware-based session management and protected routes.

## Key Insights
- @supabase/ssr stores JWT in httpOnly cookies via middleware (not localStorage)
- RLS policies use `auth.uid()` for user isolation; index user_id columns for perf
- UUIDs v4 via `gen_random_uuid()` for all primary keys
- Store all timestamps in UTC; app layer handles display timezone
- `updated_at` auto-managed by database trigger
- Partial index on `time_entries WHERE ended_at IS NULL` for active timer queries

## Requirements

### Functional
- Email/password signup + login
- Google OAuth signup + login
- Session refresh via middleware on every request
- Protected routes: all /dashboard/* require auth
- Public routes: /, /login, /signup
- OAuth callback handler at /callback
- User profile auto-created on first sign-in (trigger)
- All tables have RLS enabled; users see only their own data
- Onboarding category picker after first signup (user selects from presets)
<!-- Updated: Validation Session 1 - Changed from auto-seed to onboarding picker -->

### Non-Functional
- All foreign keys indexed for RLS performance
- Cascading deletes for user data cleanup
- UTC timestamps everywhere
- Database migrations versioned and reproducible

## Architecture

### Data Model
```
auth.users (Supabase managed)
    │
    ├── profiles (1:1)
    │       user_id, display_name, avatar_url, timezone, created_at, updated_at
    │
    ├── categories (1:many)
    │       id, user_id, name, color, icon, sort_order, is_archived, created_at, updated_at
    │
    ├── time_entries (1:many)
    │       id, user_id, category_id (FK→categories), started_at, ended_at,
    │       duration_seconds, entry_type (timer|manual|pomodoro), notes, created_at, updated_at
    │
    ├── pomodoro_sessions (1:many, linked to time_entries)
    │       id, user_id, time_entry_id (FK→time_entries), work_minutes, break_minutes,
    │       completed_cycles, total_cycles, status (active|completed|cancelled), created_at
    │
    ├── streaks (1:1)
    │       id, user_id, current_streak, longest_streak, last_active_date, updated_at
    │
    ├── goals (1:many)
    │       id, user_id, category_id (FK→categories, nullable), target_minutes,
    │       period (daily|weekly|monthly), is_active, created_at, updated_at
    │
    ├── user_badges (1:many)
    │       id, user_id, badge_key, earned_at
    │
    ├── challenges (1:many)
    │       id, user_id, challenge_key, target_minutes, progress_minutes,
    │       period_start, period_end, status (active|completed|expired), created_at
    │
    └── user_preferences (1:1)
            id, user_id, theme (light|dark|system), preferred_background,
            preferred_ambient_sound, pomodoro_preset, custom_work_minutes,
            custom_break_minutes, email_digest_enabled, last_digest_sent_at,
            created_at, updated_at
```

### Auth Flow
```
User → /login → Supabase Auth (email or Google) → Cookie set by middleware
     → Redirect to /dashboard
     → Middleware checks session on every request
     → If expired → Refresh token → Continue
     → If invalid → Redirect to /login
```

## Related Code Files

### Files to Create
- `supabase/migrations/00001_create-profiles.sql`
- `supabase/migrations/00002_create-categories.sql`
- `supabase/migrations/00003_create-time-entries.sql`
- `supabase/migrations/00004_create-pomodoro-sessions.sql`
- `supabase/migrations/00005_create-streaks.sql`
- `supabase/migrations/00006_create-goals.sql`
- `supabase/migrations/00007_create-user-badges.sql`
- `supabase/migrations/00008_create-challenges.sql`
- `supabase/migrations/00009_create-user-preferences.sql`
- `supabase/migrations/00010_create-rls-policies.sql`
- `supabase/migrations/00011_create-triggers-and-functions.sql`
- `src/lib/supabase/middleware.ts`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/app/(auth)/callback/route.ts`
- `src/components/auth/login-form.tsx`
- `src/components/auth/signup-form.tsx`
- `src/types/database.ts`

## Implementation Steps

### 1. Initialize Supabase project
```bash
npx supabase init
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

### 2. Migration: profiles table
```sql
-- 00001_create-profiles.sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### 3. Migration: categories table
```sql
-- 00002_create-categories.sql
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  icon TEXT DEFAULT 'clock',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_user_id ON public.categories(user_id);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
```

### 4. Migration: time_entries table
```sql
-- 00003_create-time-entries.sql
CREATE TYPE public.entry_type AS ENUM ('timer', 'manual', 'pomodoro');

CREATE TABLE public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  entry_type public.entry_type NOT NULL DEFAULT 'timer',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX idx_time_entries_user_date ON public.time_entries(user_id, (started_at::date));
CREATE INDEX idx_time_entries_date_range ON public.time_entries(started_at, ended_at);
CREATE INDEX idx_time_entries_active ON public.time_entries(user_id) WHERE ended_at IS NULL;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
```

### 5. Migration: pomodoro_sessions table
```sql
-- 00004_create-pomodoro-sessions.sql
CREATE TYPE public.pomodoro_status AS ENUM ('active', 'completed', 'cancelled');

CREATE TABLE public.pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  time_entry_id UUID REFERENCES public.time_entries(id) ON DELETE SET NULL,
  work_minutes INTEGER NOT NULL DEFAULT 25,
  break_minutes INTEGER NOT NULL DEFAULT 5,
  completed_cycles INTEGER NOT NULL DEFAULT 0,
  total_cycles INTEGER NOT NULL DEFAULT 4,
  status public.pomodoro_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pomodoro_user_id ON public.pomodoro_sessions(user_id);
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
```

### 6. Migration: streaks table
```sql
-- 00005_create-streaks.sql
CREATE TABLE public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_streaks_user_id ON public.streaks(user_id);
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
```

### 7. Migration: goals table
```sql
-- 00006_create-goals.sql
CREATE TYPE public.goal_period AS ENUM ('daily', 'weekly', 'monthly');

CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  target_minutes INTEGER NOT NULL,
  period public.goal_period NOT NULL DEFAULT 'weekly',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_goals_user_id ON public.goals(user_id);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
```

### 8. Migration: user_badges table
```sql
-- 00007_create-user-badges.sql
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_key)
);

CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
```

### 9. Migration: challenges table
```sql
-- 00008_create-challenges.sql
CREATE TYPE public.challenge_status AS ENUM ('active', 'completed', 'expired');

CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_key TEXT NOT NULL,
  target_minutes INTEGER NOT NULL,
  progress_minutes INTEGER NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status public.challenge_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_challenges_user_id ON public.challenges(user_id);
CREATE INDEX idx_challenges_active ON public.challenges(user_id) WHERE status = 'active';
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
```

### 10. Migration: user_preferences table
```sql
-- 00009_create-user-preferences.sql
CREATE TYPE public.theme_mode AS ENUM ('light', 'dark', 'system');
CREATE TYPE public.pomodoro_preset AS ENUM ('25/5', '50/10', '90/20', 'custom');

CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme public.theme_mode NOT NULL DEFAULT 'system',
  preferred_background TEXT DEFAULT 'default',
  preferred_ambient_sound TEXT DEFAULT 'none',
  pomodoro_preset public.pomodoro_preset NOT NULL DEFAULT '25/5',
  custom_work_minutes INTEGER DEFAULT 25,
  custom_break_minutes INTEGER DEFAULT 5,
  email_digest_enabled BOOLEAN NOT NULL DEFAULT true,
  last_digest_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_prefs_user_id ON public.user_preferences(user_id);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
```

### 11. Migration: RLS policies
```sql
-- 00010_create-rls-policies.sql

-- Profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (user_id = auth.uid());

-- Categories
CREATE POLICY "Users can view own categories"
  ON public.categories FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own categories"
  ON public.categories FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own categories"
  ON public.categories FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own categories"
  ON public.categories FOR DELETE USING (user_id = auth.uid());

-- Time Entries
CREATE POLICY "Users can view own entries"
  ON public.time_entries FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own entries"
  ON public.time_entries FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own entries"
  ON public.time_entries FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own entries"
  ON public.time_entries FOR DELETE USING (user_id = auth.uid());

-- Pomodoro Sessions
CREATE POLICY "Users can view own pomodoro"
  ON public.pomodoro_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own pomodoro"
  ON public.pomodoro_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own pomodoro"
  ON public.pomodoro_sessions FOR UPDATE USING (user_id = auth.uid());

-- Streaks
CREATE POLICY "Users can view own streaks"
  ON public.streaks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own streaks"
  ON public.streaks FOR UPDATE USING (user_id = auth.uid());

-- Goals
CREATE POLICY "Users can view own goals"
  ON public.goals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own goals"
  ON public.goals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own goals"
  ON public.goals FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own goals"
  ON public.goals FOR DELETE USING (user_id = auth.uid());

-- User Badges
CREATE POLICY "Users can view own badges"
  ON public.user_badges FOR SELECT USING (user_id = auth.uid());

-- Challenges
CREATE POLICY "Users can view own challenges"
  ON public.challenges FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own challenges"
  ON public.challenges FOR UPDATE USING (user_id = auth.uid());

-- User Preferences
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE USING (user_id = auth.uid());
```

### 12. Migration: triggers and functions
```sql
-- 00011_create-triggers-and-functions.sql

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.streaks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile, streaks, preferences on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );

  -- Create streaks record
  INSERT INTO public.streaks (user_id) VALUES (NEW.id);

  -- Create preferences
  INSERT INTO public.user_preferences (user_id) VALUES (NEW.id);

  -- NOTE: Categories NOT seeded here. User picks via onboarding page after first login.
  -- Validation Session 1: Changed from auto-seed to onboarding category picker.

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 13. Implement middleware auth helper
`src/lib/supabase/middleware.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") ||
                     request.nextUrl.pathname.startsWith("/signup");
  const isPublicPage = request.nextUrl.pathname === "/" || isAuthPage;

  if (!user && !isPublicPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

### 14. Create OAuth callback route
`src/app/(auth)/callback/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
```

### 15. Create login page + form
Login page renders `<LoginForm />` component with:
- Email + password fields
- "Sign in with Google" button (calls `supabase.auth.signInWithOAuth({ provider: "google" })`)
- Link to /signup
- Error handling + loading states

### 16. Create signup page + form
Signup page renders `<SignupForm />` component with:
- Email + password + confirm password fields
- "Sign up with Google" button
- Link to /login
- Password validation (min 8 chars)

### 17. Configure Google OAuth in Supabase Dashboard
- Go to Supabase Dashboard → Authentication → Providers → Google
- Add Client ID + Secret from Google Cloud Console
- Set redirect URL: `{SUPABASE_URL}/auth/v1/callback`

### 18. Generate TypeScript types
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/types/database.ts
```

### 19. Run migrations
```bash
npx supabase db push
```

## Todo List
- [ ] Initialize Supabase CLI + link project
- [ ] Create all migration files (00001–00011)
- [ ] Run migrations against Supabase
- [ ] Configure Google OAuth in Supabase Dashboard
- [ ] Generate TypeScript types from schema
- [ ] Implement middleware auth helper
- [ ] Create OAuth callback route
- [ ] Create login page + LoginForm component
- [ ] Create signup page + SignupForm component
- [ ] Create dashboard layout (protected shell)
- [ ] Create onboarding category picker page (src/app/(auth)/onboarding/page.tsx)
- [ ] Test: email signup → profile auto-created (no categories yet)
- [ ] Test: Google OAuth → profile auto-created
- [ ] Test: first login → redirect to onboarding category picker
- [ ] Test: onboarding → selected categories created for user
- [ ] Test: unauthenticated user redirected to /login
- [ ] Test: authenticated user on /login redirected to /

## Success Criteria
- All tables created with correct schema
- RLS policies block cross-user access
- Email signup creates profile + streaks + preferences + 6 preset categories
- Google OAuth creates profile with name + avatar from Google
- Middleware redirects correctly (protected ↔ public routes)
- Session refresh works (no unexpected logouts)
- TypeScript types generated and importable

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Google OAuth misconfiguration | High | Follow Supabase docs exactly; test in dev first |
| RLS policy gaps | Critical | Test each policy with different user contexts |
| Trigger failure on signup | High | Test both email + OAuth paths; check Supabase logs |
| Cookie refresh race conditions | Medium | Use official @supabase/ssr patterns; avoid custom cookie logic |

## Security Considerations
- All tables have RLS enabled — no exceptions
- `handle_new_user()` uses SECURITY DEFINER (runs as table owner, not user)
- Never expose Supabase service role key in client code
- OAuth callback validates `code` parameter before exchange
- Password minimum 8 characters enforced by Supabase Auth config

## Next Steps
- Phase 03: Timer engine + time entries + categories CRUD
- Phase 07: Email digest (depends on user_preferences table)

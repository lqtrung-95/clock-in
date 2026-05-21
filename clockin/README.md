# Effortful

**Effortful** is a motivation-driven focus and time-tracking web app. It combines Pomodoro timers, immersive focus sessions, gamification, AI coaching, analytics, and social accountability — built for people who measure progress in hours, not checkboxes.

Part of the [EffortCounter](https://github.com/) monorepo (`clockin/` is the Next.js application).

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [Focus & Timer](#focus--timer)
  - [Time Tracking & History](#time-tracking--history)
  - [Categories & Goals](#categories--goals)
  - [Dream Goal Visualization](#dream-goal-visualization)
  - [Gamification](#gamification)
  - [Stats & Analytics](#stats--analytics)
  - [AI Focus Coach](#ai-focus-coach)
  - [Social & Focus Rooms](#social--focus-rooms)
  - [Account, Settings & PWA](#account-settings--pwa)
  - [Billing (Free / Pro / Lifetime)](#billing-free--pro--lifetime)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Database](#database)
- [Scripts](#scripts)
- [Deployment](#deployment)

---

## Overview

Effortful is not a generic to-do app. It is designed around **deep work sessions**: start a focus block, pick a category, earn XP, keep streaks alive, and visualize long-term progress toward a “dream goal.”

You can use the app **without signing in** — guest mode stores entries and categories in `localStorage`. Sign up with Supabase Auth to sync across devices, unlock social features, and persist gamification progress.

---

## Features

### Focus & Timer

The **Focus** page (`/focus`) is the primary entry point for starting work.

| Feature | Description |
|--------|-------------|
| **Pomodoro presets** | Built-in **25/5**, **50/10**, and **90/20** work/break cycles |
| **Custom timer** | Configure work duration, break duration, number of cycles, and auto-start behavior |
| **Stopwatch / manual tracking** | Track time outside Pomodoro via dashboard and history flows |
| **Category + task description** | Tag each session with a category and optional task note |
| **Immersive focus session** | Full-screen mode with auto-hiding controls, brightness adjustment, and session overlay |
| **Static backgrounds** | Curated Unsplash scenes (forest, ocean, mountain, night sky, rain, library, cafe) |
| **Video backgrounds** | Built-in ambient YouTube loops (e.g. lofi, rain, fireplace) plus **custom YouTube URLs** (Pro) |
| **Animated overlays** | Layer effects such as Aurora, Snow, Fireflies, and more on top of backgrounds |
| **Ambient sounds** | Background audio with volume control during setup and sessions |
| **Today’s stats on setup** | Quick view of today’s focus time before you start |
| **Active goals preview** | See in-progress category goals from the focus setup screen |
| **Onboarding coachmarks** | First-time tips for presets, categories, and starting a session |
| **Focus notifications** | Browser notifications for session/break transitions (when permitted) |
| **Dream crystal in session** | 3D crystal companion that reflects your XP level during focus |

### Time Tracking & History

| Feature | Description |
|--------|-------------|
| **Automatic session logging** | Completed focus/Pomodoro sessions save as time entries |
| **Manual entries** | Add or edit sessions from the history UI |
| **History list** | Browse past sessions with category, duration, and timestamps |
| **Guest history** | Local-only history for unauthenticated users |
| **History retention** | **Free:** last **7 days** · **Pro:** up to **365 days** |
| **CSV export** | Export time entries to CSV (**Pro**) |

### Categories & Goals

| Feature | Description |
|--------|-------------|
| **Categories** | Color-coded labels with icons; preset templates available |
| **Category limit** | **Free:** up to **5** categories · **Pro:** unlimited |
| **Per-category goals** | Set weekly/daily time targets per category |
| **Goal progress** | Progress bars and completion tracking on the Goals page |
| **Streaks** | Current streak, longest streak, and streak-aware badges |
| **Dashboard summary** | Daily/weekly overview, quick timer widget, and highlights |

### Dream Goal Visualization

Long-horizon goals rendered as interactive **Three.js** scenes (`/dream`).

| Theme | Visual metaphor |
|-------|-----------------|
| **Mountain Climb** | Ascend from base camp to summit |
| **Castle Builder** | Build a kingdom piece by piece |
| **Magical Tree** | Grow from seed to cosmic tree |
| **Space Journey** | Travel from Earth to distant galaxies |

Additional behavior:

- Set **title**, **description**, and **target hours**
- Progress syncs from logged focus time
- **Milestones** at 0%, 10%, 25%, 50%, 75%, and 100% with celebration modal
- Theme switcher and progress ring on Goals page
- Immersive mountain view and shared journey trail components

### Gamification

| Feature | Description |
|--------|-------------|
| **XP & levels** | Earn XP from focus time; level up over time |
| **XP progress bar** | Visible on Achievements and related UI |
| **Achievement badges** | 16+ badges (time, streaks, sessions, consistency, challenges, Pomodoro, categories) with rarity tiers: Common, Rare, Epic, Legendary |
| **Daily challenges** | e.g. 1h / 2h / 4h focus in a day |
| **Weekly challenges** | e.g. 10h / 20h / 40h per week |
| **Crystal evolution** | 3D crystal shape upgrades by level (icosahedron → dodecahedron → … → torus knot) |
| **Crystal customization** | Unlock colors and themes (Classic, Ethereal, Inferno, Ocean, Cosmic, Forest) by level |
| **Achievements page** | Tabs for badges, challenges, crystal preview, and stats |
| **Confetti** | Celebration effects on milestones (canvas-confetti) |

### Stats & Analytics

The **Stats** page (`/stats`) provides data-driven views of your habits.

| Feature | Description |
|--------|-------------|
| **Summary cards** | Total time, sessions, streak, and period comparisons |
| **Calendar heatmap** | GitHub-style contribution graph of focus days |
| **Focus time bar chart** | Daily focus minutes over a selectable range |
| **Category breakdown** | Pie chart of time by category |
| **Period tabs** | Switch between daily / weekly / monthly views |
| **Share stats card** | Generate a shareable stats image |
| **AI focus insights** | Pattern-based tips (best time of day, top category, trends) — see [AI](#ai-focus-coach) |
| **Advanced analytics** | Fuller charts and history depth for **Pro** users |

### AI Focus Coach

Powered by **Groq** (server-side API routes). Requires authentication; several features are **Pro-only** or quota-limited.

| Feature | Access | Description |
|--------|--------|-------------|
| **AI session suggestion** | Pro | Suggests category, duration (25/50/90), and short reason from recent patterns |
| **AI category suggestion** | Pro | Auto-suggest category from task description text |
| **AI coach chat** | Pro | Conversational productivity coach panel |
| **AI focus insights** | Free: **3/month** · Pro: **unlimited** | Best time of day, top category, avg session length, weekly trend, actionable tip |
| **AI insights card** | Stats / Social | Summarized insights from recent entries |

### Social & Focus Rooms

Available on the **Social** page (`/social`). Most social features require sign-in; **Focus Rooms** require **Pro**.

| Feature | Description |
|--------|-------------|
| **Friends** | Add friends, view profiles, manage friend list |
| **Leaderboards** | Compare focus stats with friends and global rankings |
| **Focus rooms** | Create/join virtual study rooms (public or private, max participants) |
| **Synchronized Pomodoro** | Room host runs timer phases for all participants |
| **Room chat** | Real-time messages inside a focus room session |
| **Share card** | Shareable progress card with hours, sessions, streak, focus score |
| **Avatar uploads** | Profile photos stored in Supabase Storage |

### Account, Settings & PWA

| Feature | Description |
|--------|-------------|
| **Supabase Auth** | Email/password sign up and login |
| **OAuth callback** | Auth callback route for session handling |
| **Onboarding** | First-time setup flow for new users |
| **Profile** | Display name and avatar (upload or URL) |
| **Appearance** | Light / dark / system theme |
| **Email digest toggle** | Weekly digest preference (Resend-backed cron) |
| **Guest preferences** | Theme and digest prefs stored locally when logged out |
| **Install page** | PWA install instructions for iOS, Android, and desktop (`/install`) |
| **Service worker** | Offline-capable PWA with manifest (`/public/manifest.json`, `sw.js`) |
| **Offline banner** | UI indicator when network is unavailable |
| **Landing page** | Marketing site with hero, feature grid, focus showcase, pricing CTA |
| **SEO** | `sitemap.ts`, `robots.ts`, Open Graph image, JSON-LD schema |

### Billing (Free / Pro / Lifetime)

Subscriptions are handled via **Polar** (checkout, customer portal, webhooks).

| Plan | Price (listed) | Highlights |
|------|----------------|------------|
| **Free** | $0 | Pomodoro + custom timer, up to 5 categories, 7-day history, basic stats & streaks, basic achievements, 3 AI insights/month |
| **Pro Monthly** | $2.99/mo | Unlimited categories & history, unlimited AI insights, AI coach chat, advanced stats, CSV export, custom themes, focus rooms |
| **Pro Annual** | $19.99/yr | Everything in Pro Monthly (~44% savings vs monthly) |
| **Lifetime** | One-time | All Pro features, no renewals, future Pro features included |

Billing UI: `/pricing`, `/settings/billing`, plan badge in sidebar, upgrade prompts on gated features.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS 4 + [shadcn/ui](https://ui.shadcn.com) (Radix primitives) |
| Backend | [Supabase](https://supabase.com) — Auth, PostgreSQL, RLS, Realtime, Storage |
| State | [Zustand](https://zustand.docs.pmnd.rs) (timer, categories, gamification, dream goals) |
| Data fetching | [TanStack Query](https://tanstack.com/query) |
| Charts | [Recharts](https://recharts.org) |
| 3D | [Three.js](https://threejs.org) + React Three Fiber + Drei + postprocessing |
| AI | [Groq SDK](https://groq.com) |
| Payments | [Polar](https://polar.sh) |
| Email | Resend (weekly digest) |
| PWA | Service worker + web app manifest |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (URL + anon key)
- Optional: Groq API key (AI), Polar credentials (billing), Resend API key (email digest)

### Install & run

```bash
cd clockin
npm install
cp .env.local.example .env.local   # fill in values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Landing:** `/`
- **Start focusing (guest-friendly):** `/focus`
- **Sign in:** `/login` · **Sign up:** `/signup`

### Supabase setup

Apply migrations from `supabase/migrations/` to your Supabase project (CLI or dashboard). Migrations cover profiles, categories, time entries, Pomodoro sessions, streaks, goals, badges, challenges, dream goals, social/focus rooms, subscriptions, and RLS policies.

---

## Environment Variables

Copy `.env.local.example` to `.env.local`:

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `NEXT_PUBLIC_APP_URL` | Yes | App URL (e.g. `http://localhost:3000`) |
| `GROQ_API_KEY` | For AI | Groq API for coach/insights/suggestions |
| `POLAR_ACCESS_TOKEN` | For billing | Polar API token |
| `POLAR_WEBHOOK_SECRET` | For billing | Webhook signature verification |
| `POLAR_PRO_MONTHLY_PRODUCT_ID` | For billing | Pro monthly product ID |
| `POLAR_PRO_ANNUAL_PRODUCT_ID` | For billing | Pro annual product ID |
| `POLAR_LIFETIME_PRODUCT_ID` | For billing | Lifetime product ID |
| `NEXT_PUBLIC_POLAR_*_PRODUCT_ID` | For billing | Client-side product IDs for checkout |
| `RESEND_API_KEY` | Optional | Weekly email digest |

---

## Project Structure

```
clockin/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # login, signup, onboarding, callback
│   │   ├── (dashboard)/        # focus, dashboard, history, stats, goals,
│   │   │                       # achievements, social, categories, settings,
│   │   │                       # dream, install, focus-room/[id]
│   │   ├── api/                # ai, billing, checkout, webhooks, cron
│   │   ├── pricing/            # public pricing page
│   │   └── page.tsx            # landing page
│   ├── components/             # UI by domain (focus, stats, dream-goal, …)
│   ├── hooks/                  # auth, timer, pomodoro, gamification, social, …
│   ├── services/               # Supabase data access layer
│   ├── stores/                 # Zustand stores
│   ├── data/                   # static definitions (badges, challenges, crystals)
│   ├── lib/                    # supabase clients, guest storage, export, billing helpers
│   └── types/                  # TypeScript types
├── supabase/
│   ├── migrations/             # SQL schema + RLS
│   └── functions/              # edge functions (e.g. weekly-digest)
├── public/                     # PWA assets, sounds, backgrounds, icons
├── docs/                       # feature backlog
└── plans/                      # implementation plans & reports
```

### Main routes

| Route | Page |
|-------|------|
| `/` | Landing |
| `/focus` | Focus setup & sessions |
| `/dashboard` | Summary & quick timer |
| `/history` | Session history |
| `/stats` | Analytics & heatmap |
| `/goals` | Category goals, streaks, dream goal summary |
| `/dream` | Dream goal 3D visualization |
| `/achievements` | XP, badges, challenges, crystal |
| `/social` | Friends, leaderboard, focus rooms, share |
| `/focus-room/[id]` | Joined focus room session |
| `/categories` | Manage categories |
| `/settings` | Profile, theme, preferences |
| `/settings/billing` | Subscription management |
| `/pricing` | Plans & checkout |
| `/install` | PWA install guide |

---

## Database

PostgreSQL on Supabase with row-level security. Core tables include:

- `profiles` — display name, avatar, preferences  
- `categories`, `time_entries`, `pomodoro_sessions`  
- `streaks`, `goals`  
- `user_stats`, `user_badges`, `badge_definitions`, `weekly_challenges`  
- `crystal_customizations`  
- `dream_goals`, `dream_goal_progress_history`  
- `friendships`, focus room tables, `focus_room_sessions`, messages  
- `user_subscriptions` — Polar plan type, AI usage counters  

See `supabase/migrations/` for the full schema.

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

---

## Deployment

Optimized for [Vercel](https://vercel.com). Set all environment variables in the project settings. Configure Polar webhooks to point at `/api/webhooks/polar`. Ensure `NEXT_PUBLIC_APP_URL` matches your production domain.

---

## License

Private project — see repository root for license terms.

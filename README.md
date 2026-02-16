# Clockin - Effort Tracker

A motivation-driven time tracking PWA with Pomodoro timer, focus mode, streaks, and gamification.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Auth, Database, Realtime)
- **State:** Zustand
- **Charts:** Recharts

## Getting Started

```bash
cd clockin
npm install
cp .env.local.example .env.local  # fill in Supabase credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features (MVP)

- Stopwatch & manual time entry
- Pomodoro timer with configurable intervals
- Focus mode with ambient sounds & backgrounds
- Categories & color-coded tracking
- Dashboard with daily/weekly/monthly analytics
- Streaks, badges, and challenges
- PWA (installable, offline-capable)
- Cross-device timer conflict resolution

## Project Structure

```
clockin/           # Next.js app
  src/
    app/           # App Router pages
    components/    # UI components
    hooks/         # Custom React hooks
    lib/           # Utilities & Supabase clients
    services/      # Data access layer
    stores/        # Zustand stores
    types/         # TypeScript types
    data/          # Static data & definitions
  supabase/        # Database migrations
plans/             # Implementation plans
```

## License

Private project.

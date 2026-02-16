# Frontend/UX Research: Clockin (Next.js 15 PWA)

## 1. Next.js 15 App Router + Supabase Auth

**Best Practice:** Use `@supabase/ssr` package (official, actively maintained). Implement auth in middleware (`middleware.ts`) for route protection before rendering. Use server components with `createServerClient()` for database queries; client components with `createBrowserClient()` for interactive features.

**Session Handling:** Store JWT in httpOnly cookie via middleware. Refresh tokens automatically via middleware on each request. Avoid exposing tokens in localStorage. In server components, access user via `getUser()` from Supabase client; in client components, use `useEffect` with `onAuthStateChange()` listener.

**Protected Routes:** Use middleware to check `user` existence before rendering. Return redirect response for unauthenticated requests. This runs before rendering, preventing flash of unauthorized content.

## 2. PWA Setup: Serwist vs next-pwa

**Serwist:** Modern, actively maintained (2025+), framework-agnostic. Better TypeScript support, cleaner API. Recommended for greenfield Next.js 15 projects.

**next-pwa:** Older, less frequent updates. Still functional but Serwist is preferred choice for new projects. Repository activity slower.

**Service Worker for Timers:** Use Workbox precaching for app shell. Background sync for timer completion notifications. Install event for cache strategy. Note: Service workers cannot run timers accurately in background; instead, store timer state locally, use `Page Visibility API` to detect tab focus, and notify when user returns.

## 3. Web Audio API for Ambient Sound

**Seamless Looping:** Use AudioContext with `loop: true` for Audio element OR use `ended` event to queue next playback. Opus codec preferred (smaller file). Preload audio on app init, not on demand.

**Autoplay Policy:** Modern browsers require user interaction before audio plays. Solution: Play audio after first user interaction (click, tap). Use visual indicator ("ambient sound on/off"). Mute by default, let user enable.

**Volume Control:** Implement via `GainNode` in Web Audio API. Persist setting to localStorage using Zustand. Test across browsers (Safari has stricter autoplay policies).

## 4. Pomodoro Timer Patterns

**Accuracy with Inactive Tabs:** `Page Visibility API` detects tab visibility. Capture timestamp when tab becomes inactive, compare elapsed time when tab refocuses. This is more accurate than relying on `setInterval()` which pauses in background tabs.

**Recommended Pattern:**
- Store timer start time (Unix timestamp) in Zustand
- Use `requestAnimationFrame()` for UI updates in foreground
- On tab visibility change, calculate elapsed time delta
- Fire notification on cycle completion via Notification API

**Avoid:** Using `setInterval()` alone—it's unreliable in background. Use timestamp comparison instead.

## 5. Recharts vs Chart.js

**Recharts:** Built for React, smaller bundle (12–15 KB gzipped), excellent TypeScript support, native responsive design, bars/lines/areas composable. Default styling integrates cleanly with Tailwind. **Winner for React.**

**Chart.js:** ~10 KB gzipped, imperative API (jQuery-style), requires react-chartjs-2 wrapper. More verbose configuration. Better for complex canvas customization.

**Recommendation:** Use **Recharts** for Clockin. Simpler React integration, responsive by default, and ecosystem matches modern Next.js patterns.

## 6. Confetti/Celebration Libraries

**canvas-confetti:** 5–6 KB gzipped, vanilla JavaScript, no React overhead. Canvas-based, hardware-accelerated. Works in service workers. Best performance.

**react-confetti:** ~4 KB gzipped, React wrapper, adds lifecycle management overhead. Simpler JSX integration but heavier in practice.

**Recommendation:** Use **canvas-confetti** directly (import as vanilla). Call after Pomodoro cycle completes. One-time animation; not performance-sensitive.

## 7. Zustand for Timer State

**Pattern:**
```
Create store with: timerStartTime, timerDuration, isRunning, sessionType.
Subscribe to visibility changes → pause/resume timers.
Persist state via localStorage middleware: persist() plugin (built-in).
useShallow() hook for granular updates to avoid unnecessary re-renders.
```

**Middleware Sync:** Zustand's `persist` middleware automatically syncs to localStorage. On app reload, hydrate from storage. Use `onRehydrateStorage()` callback to validate persisted state.

**Tick Updates:** Use `requestAnimationFrame()` in component (not in store) for UI updates. Store holds state, component drives animation loop. This separates concerns and prevents store churn.

---

## Summary Table

| Topic | Choice | Rationale |
|-------|--------|-----------|
| Auth | @supabase/ssr | Official, SSR-first, TypeScript-ready |
| PWA | Serwist | Actively maintained, modern API |
| Audio | Web Audio API | Fine-grained control, no library needed |
| Timer | Visibility API + timestamps | Accurate, background-safe |
| Charts | Recharts | React-native, small, responsive |
| Confetti | canvas-confetti | Smallest, best performance |
| State | Zustand + persist | Minimal, localStorage-ready |

---

## Key Risks & Mitigations

1. **Autoplay Policy Rejection:** Requires user interaction. Mitigation: Prominent UI toggle, clear UX affordance.
2. **Background Timer Drift:** `setInterval()` pauses. Mitigation: Use timestamp comparison + `Page Visibility API`.
3. **Service Worker Caching Stale Assets:** Serwist cache version mismatches. Mitigation: Use content hash in asset names, clear old caches in activate event.

---

**Knowledge Cutoff:** Feb 2025 | **Project:** Clockin (Next.js 15 PWA)

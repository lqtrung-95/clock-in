# Backend Infrastructure Research: Clockin PWA + Supabase

**Date:** 2026-02-14 | **Focus:** Next.js 15 PWA with Supabase backend architecture

---

## 1. Scheduled Emails (Digest Architecture)

**Pattern:** Supabase Edge Functions + pg_cron + Resend
- **Trigger:** Use Supabase `pg_cron` extension (installed by default) to schedule database-level cron jobs that invoke Edge Functions via webhooks
- **Implementation:** Create `cron.job()` in PostgreSQL; Edge Function reads user preferences, generates digest HTML, calls Resend API (POST `/emails/send`)
- **Resend Integration:** Use Resend TypeScript SDK; store API key in Edge Function secrets via Supabase dashboard
- **Best Practice:** Store digest state in `last_digest_sent` timestamp on users table; check weekly interval to prevent duplicates; implement exponential backoff for failed sends
- **Reference:** Supabase docs recommend Edge Functions for async background jobs; pg_cron is production-grade for PostgreSQL scheduling

---

## 2. Row Level Security (RLS) Patterns

**Multi-Tenant Isolation:**
- **User-Owned Data:** `auth.uid()` policies on time_entries table
  ```sql
  CREATE POLICY "Users see own entries"
    ON time_entries FOR SELECT
    USING (user_id = auth.uid());
  ```
- **Team/Org Scope:** Join through users→teams table; check team_id via RLS
- **Critical:** Always enable RLS at table level; never rely solely on application logic
- **Performance:** Index foreign key columns (user_id, team_id) for RLS evaluation speed
- **Audit Trail:** Use `updated_at` trigger + separate audit log table with RLS for compliance

---

## 3. Realtime Subscriptions (Timer State Sync)

**Channel Pattern:**
- Subscribe to `time_entries:user_id=*` channels; filter by user_id in channel name
- Use presence feature for "active timers" — broadcast timer status to team members viewing shared dashboard
- **Performance:** Realtime scales to 100+ concurrent connections per project; avoid broad "*" subscriptions on high-frequency tables
- **Best Practice:** Throttle updates (batch every 5-10s for timer ticks); use compression for large payloads
- **Implementation:** Next.js can use `supabase-js` client library; reconnect automatically on network recovery

---

## 4. Database Schema Design

**IDs:** UUIDs (v4 or v7)
- Preferred for distributed systems; v7 adds timestamp for better index locality (faster range queries)
- Supabase auto-generates via `gen_random_uuid()` default

**Timestamps:**
- Use `created_at` (immutable) and `updated_at` (auto-trigger)
- Set timezone to UTC; application layer handles display
- Index both for historical queries and audit trails

**time_entries Table Indexing:**
```sql
CREATE INDEX idx_time_entries_user_date
  ON time_entries(user_id, DATE(started_at));
CREATE INDEX idx_time_entries_date_range
  ON time_entries(started_at, ended_at);
```
- First index accelerates weekly digest queries (user + date range)
- Second index supports date-range filters across all users (analytics)
- Partial indexes for active entries: `WHERE ended_at IS NULL`

---

## 5. Offline-First PWA + Supabase

**Sync Strategy:**
- Cache timer state in IndexedDB (structured, queryable); localStorage for UI state (preferences)
- On reconnect: diff local vs remote; detect conflicts (concurrent edits same timer)
- **Conflict Resolution:** Last-write-wins (update by `updated_at` timestamp) or application-level merge (calculate total duration correctly)
- **Resync Flow:** Queue local changes → POST to Edge Function validation → upsert to DB → notify Realtime subscribers
- **Best Practice:** Optimistic UI updates + eventual consistency; show "syncing..." badge

**IndexedDB Schema:**
- Separate object stores: `time_entries`, `sync_queue` (failed ops), `user_state`
- Use compound keys: `[user_id, entry_id]` for efficient offline filtering

---

## 6. Weekly Email Digest Architecture

**Flow:**
1. **Schedule:** pg_cron (Monday 9am UTC) → HTTP POST to Edge Function endpoint
2. **Edge Function:** Query time_entries (last 7 days), aggregate by project/task, render HTML template
3. **Template:** Use Resend React components or plain HTML; include stats (total hours, tasks completed)
4. **Send:** Call Resend API; log result in `email_logs` table for tracking
5. **Fallback:** If Edge Function fails, pg_cron retries 3x with exponential backoff

**Observability:** Monitor Edge Function logs via Supabase dashboard; set up alerts for failed sends via email or Discord webhook

---

## Implementation Priorities (MVP)

1. **Week 1:** RLS policies + basic schema (time_entries, users)
2. **Week 2:** Offline caching (IndexedDB) + Realtime subscriptions
3. **Week 3:** Edge Function for digest + pg_cron scheduling
4. **Week 4:** Resend integration + template testing

---

## Unresolved Questions

- Conflict resolution strategy for concurrent timer edits (last-write-wins vs manual merge)?
- Email digest frequency preferences — per-user customization table needed?
- Realtime presence for team collaboration — scope of MVP?
- Backup/disaster recovery plan for Edge Function failures?

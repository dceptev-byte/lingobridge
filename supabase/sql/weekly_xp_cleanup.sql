-- ─────────────────────────────────────────────────────────────────────────────
-- weekly_xp_cleanup.sql
-- Run once in the Supabase SQL editor to enable pg_cron and schedule cleanup.
--
-- What it does:
--   • Enables the pg_cron extension (requires Supabase project with pg_cron enabled
--     in the Dashboard → Database → Extensions → pg_cron).
--   • Schedules a weekly job at 00:00 UTC every Monday to DELETE weekly_xp rows
--     that are older than 4 weeks. Current + recent weeks are kept for history.
--
-- The leaderboard itself does NOT need a "reset" — each week's XP lives in its
-- own row (weekStart key). A new week starts naturally when the app inserts a
-- new row with this week's Monday date.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Enable pg_cron (idempotent)
create extension if not exists pg_cron;

-- 2. Schedule weekly cleanup (every Monday at 00:00 UTC)
--    Cron syntax: minute hour day-of-month month day-of-week
select cron.schedule(
  'weekly-xp-cleanup',          -- job name (unique)
  '0 0 * * 1',                  -- every Monday 00:00 UTC
  $$
    delete from weekly_xp
    where "weekStart" < now() - interval '4 weeks';
  $$
);

-- To view scheduled jobs:
-- select * from cron.job;

-- To unschedule:
-- select cron.unschedule('weekly-xp-cleanup');

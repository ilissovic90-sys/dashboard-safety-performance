-- SCG SAFETY 360: public dashboard, read-only database access
-- Run this once in Supabase SQL Editor.
-- Visitors can read HSE dashboard records without signing in.
-- No browser visitor can insert, update, or delete records.

alter table public.profiles enable row level security;
alter table public.hse_actions enable row level security;
alter table public.hse_incidents enable row level security;
alter table public.hse_metrics enable row level security;

-- Profiles are private and are no longer used by the public dashboard.
revoke all on table public.profiles from anon, authenticated;

-- Public dashboard data: grant SELECT only.
revoke all on table public.hse_actions from anon, authenticated;
revoke all on table public.hse_incidents from anon, authenticated;
revoke all on table public.hse_metrics from anon, authenticated;
grant select on table public.hse_actions to anon, authenticated;
grant select on table public.hse_incidents to anon, authenticated;
grant select on table public.hse_metrics to anon, authenticated;

-- Remove the previous login-based policies.
drop policy if exists "users read actions" on public.hse_actions;
drop policy if exists "hse create actions" on public.hse_actions;
drop policy if exists "hse update actions" on public.hse_actions;
drop policy if exists "admin delete actions" on public.hse_actions;
drop policy if exists "users read incidents" on public.hse_incidents;
drop policy if exists "hse create incidents" on public.hse_incidents;
drop policy if exists "hse update incidents" on public.hse_incidents;
drop policy if exists "admin delete incidents" on public.hse_incidents;
drop policy if exists "users read metrics" on public.hse_metrics;
drop policy if exists "hse manage metrics" on public.hse_metrics;

-- Anonymous visitors may read all rows intended for the dashboard.
drop policy if exists "public read actions" on public.hse_actions;
create policy "public read actions" on public.hse_actions
for select to anon, authenticated using (true);

drop policy if exists "public read incidents" on public.hse_incidents;
create policy "public read incidents" on public.hse_incidents
for select to anon, authenticated using (true);

drop policy if exists "public read metrics" on public.hse_metrics;
create policy "public read metrics" on public.hse_metrics
for select to anon, authenticated using (true);

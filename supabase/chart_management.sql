-- SCG SAFETY 360 - Advanced chart management
-- Run this migration in Supabase SQL Editor after schema.sql and admin_access.sql.
create table if not exists public.hse_chart_configs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  chart_type text not null check (chart_type in ('bar','line','pie')),
  dimension text not null default 'label' check (dimension in ('label','department','period')),
  metric_keys uuid[] not null default '{}',
  visible boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists hse_chart_configs_created_at_idx
  on public.hse_chart_configs(created_at desc);

alter table public.hse_chart_configs enable row level security;
revoke all on table public.hse_chart_configs from anon, authenticated;
grant select on table public.hse_chart_configs to anon, authenticated;
grant insert, update, delete on table public.hse_chart_configs to authenticated;

drop policy if exists "public read chart configs" on public.hse_chart_configs;
create policy "public read chart configs" on public.hse_chart_configs
  for select to anon, authenticated using (true);

drop policy if exists "hse create chart configs" on public.hse_chart_configs;
create policy "hse create chart configs" on public.hse_chart_configs
  for insert to authenticated with check (public.can_edit_hse() and created_by = auth.uid());

drop policy if exists "hse update chart configs" on public.hse_chart_configs;
create policy "hse update chart configs" on public.hse_chart_configs
  for update to authenticated using (public.can_edit_hse()) with check (public.can_edit_hse());

drop policy if exists "hse delete chart configs" on public.hse_chart_configs;
create policy "hse delete chart configs" on public.hse_chart_configs
  for delete to authenticated using (public.can_edit_hse());

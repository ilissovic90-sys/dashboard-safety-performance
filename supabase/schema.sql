-- SCG SAFETY PERFORMANCE 360 — Supabase schema
-- Run in Supabase SQL Editor as project owner.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'viewer' check (role in ('admin','hse','viewer')),
  created_at timestamptz not null default now()
);

create table if not exists public.hse_actions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  area text,
  owner text,
  due_date date,
  priority text not null default 'Medium' check (priority in ('Low','Medium','High','Critical')),
  status text not null default 'Open' check (status in ('Open','In progress','Closed')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hse_incidents (
  id uuid primary key default gen_random_uuid(),
  event_date date not null,
  event_type text not null,
  area text not null,
  severity text not null default 'Medium' check (severity in ('Low','Medium','High','Critical')),
  description text,
  status text not null default 'Open',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.hse_metrics (
  id uuid primary key default gen_random_uuid(),
  metric_key text not null,
  metric_label text not null,
  metric_value numeric not null default 0,
  unit text,
  period_start date,
  period_end date,
  department text,
  source_note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists hse_actions_created_at_idx on public.hse_actions(created_at desc);
create index if not exists hse_incidents_event_date_idx on public.hse_incidents(event_date desc);
create index if not exists hse_metrics_period_idx on public.hse_metrics(period_start, period_end);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;

create or replace function public.can_edit_hse()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role in ('admin','hse')); $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles(id,email,full_name,role)
  values(new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',''),'viewer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.hse_actions enable row level security;
alter table public.hse_incidents enable row level security;
alter table public.hse_metrics enable row level security;

drop policy if exists "profiles read self or admin" on public.profiles;
create policy "profiles read self or admin" on public.profiles for select to authenticated
using (id = auth.uid() or public.is_admin());
drop policy if exists "admins update profiles" on public.profiles;
create policy "admins update profiles" on public.profiles for update to authenticated
using (public.is_admin()) with check (public.is_admin());
drop policy if exists "users read actions" on public.hse_actions;
create policy "users read actions" on public.hse_actions for select to authenticated using (true);
drop policy if exists "hse create actions" on public.hse_actions;
create policy "hse create actions" on public.hse_actions for insert to authenticated
with check (public.can_edit_hse() and created_by = auth.uid());
drop policy if exists "hse update actions" on public.hse_actions;
create policy "hse update actions" on public.hse_actions for update to authenticated
using (public.can_edit_hse()) with check (public.can_edit_hse());
drop policy if exists "admin delete actions" on public.hse_actions;
create policy "admin delete actions" on public.hse_actions for delete to authenticated using (public.is_admin());

drop policy if exists "users read incidents" on public.hse_incidents;
create policy "users read incidents" on public.hse_incidents for select to authenticated using (true);
drop policy if exists "hse create incidents" on public.hse_incidents;
create policy "hse create incidents" on public.hse_incidents for insert to authenticated
with check (public.can_edit_hse() and created_by = auth.uid());
drop policy if exists "hse update incidents" on public.hse_incidents;
create policy "hse update incidents" on public.hse_incidents for update to authenticated
using (public.can_edit_hse()) with check (public.can_edit_hse());
drop policy if exists "admin delete incidents" on public.hse_incidents;
create policy "admin delete incidents" on public.hse_incidents for delete to authenticated using (public.is_admin());

drop policy if exists "users read metrics" on public.hse_metrics;
create policy "users read metrics" on public.hse_metrics for select to authenticated using (true);
drop policy if exists "hse manage metrics" on public.hse_metrics;
create policy "hse manage metrics" on public.hse_metrics for all to authenticated
using (public.can_edit_hse()) with check (public.can_edit_hse());

-- Bootstrap: after creating your first account, run this once with its auth.users UUID:
-- update public.profiles set role='admin' where id='YOUR_AUTH_USER_UUID';
-- Never expose the Supabase service_role key in the frontend.

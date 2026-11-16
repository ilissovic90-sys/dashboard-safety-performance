-- SCG SAFETY 360: public dashboard + secure HSE administration
-- Run once in Supabase SQL Editor after public_read_only.sql.
grant usage on schema public to anon, authenticated;

-- Public visitors keep SELECT only. Signed-in authorized HSE users can manage records.
grant select on table public.profiles to authenticated;
grant select, insert, update, delete on table public.hse_actions, public.hse_incidents, public.hse_metrics to authenticated;
revoke insert, update, delete on table public.hse_actions, public.hse_incidents, public.hse_metrics from anon;

drop policy if exists "profile self read" on public.profiles;
create policy "profile self read" on public.profiles
for select to authenticated using (id = auth.uid());

drop policy if exists "hse insert actions" on public.hse_actions;
create policy "hse insert actions" on public.hse_actions
for insert to authenticated with check (public.can_edit_hse() and created_by = auth.uid());
drop policy if exists "hse update actions" on public.hse_actions;
create policy "hse update actions" on public.hse_actions
for update to authenticated using (public.can_edit_hse()) with check (public.can_edit_hse());
drop policy if exists "admin delete actions" on public.hse_actions;
create policy "admin delete actions" on public.hse_actions
for delete to authenticated using (public.is_admin());

drop policy if exists "hse insert incidents" on public.hse_incidents;
create policy "hse insert incidents" on public.hse_incidents
for insert to authenticated with check (public.can_edit_hse() and created_by = auth.uid());
drop policy if exists "hse update incidents" on public.hse_incidents;
create policy "hse update incidents" on public.hse_incidents
for update to authenticated using (public.can_edit_hse()) with check (public.can_edit_hse());
drop policy if exists "admin delete incidents" on public.hse_incidents;
create policy "admin delete incidents" on public.hse_incidents
for delete to authenticated using (public.is_admin());

drop policy if exists "hse insert metrics" on public.hse_metrics;
create policy "hse insert metrics" on public.hse_metrics
for insert to authenticated with check (public.can_edit_hse());
drop policy if exists "hse update metrics" on public.hse_metrics;
create policy "hse update metrics" on public.hse_metrics
for update to authenticated using (public.can_edit_hse()) with check (public.can_edit_hse());
drop policy if exists "admin delete metrics" on public.hse_metrics;
create policy "admin delete metrics" on public.hse_metrics
for delete to authenticated using (public.is_admin());

-- Existing public SELECT policies remain active; anonymous visitors cannot write.

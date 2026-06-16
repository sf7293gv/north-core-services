-- Replace uid-based policies with role-based ones which are more reliable
-- and work correctly with the Supabase JS client's session management.

drop policy if exists "Allow auth updates" on public.settings;
drop policy if exists "Allow auth inserts" on public.settings;

create policy "Allow auth updates"
  on public.settings for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Allow auth inserts"
  on public.settings for insert
  with check (auth.role() = 'authenticated');

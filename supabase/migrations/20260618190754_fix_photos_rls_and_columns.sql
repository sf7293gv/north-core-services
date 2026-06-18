-- Add missing UPDATE policy (was never created — caused silent 0-row updates).
-- Also add the visible/display_order/size columns introduced for the photo management upgrade.

-- New columns (idempotent)
alter table public.photos
  add column if not exists visible       boolean default true,
  add column if not exists display_order integer default 0,
  add column if not exists size          text    default 'medium';

-- Enforce size values (skip if constraint already exists)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'photos_size_check' and conrelid = 'public.photos'::regclass
  ) then
    alter table public.photos
      add constraint photos_size_check check (size in ('small', 'medium', 'large'));
  end if;
end
$$;

-- UPDATE policy (the missing one)
drop policy if exists "Allow auth updates" on public.photos;
create policy "Allow auth updates"
  on public.photos for update
  using      (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

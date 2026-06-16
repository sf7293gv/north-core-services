create table if not exists public.bookings (
  id             uuid        default gen_random_uuid() primary key,
  full_name      text,
  phone          text,
  email          text,
  service        text,
  preferred_date date,
  message        text,
  status         text        not null default 'new',
  created_at     timestamptz default now()
);

alter table public.bookings enable row level security;

-- Drop conflicting policies before recreating so this migration is idempotent
drop policy if exists "Allow public inserts" on public.bookings;
drop policy if exists "Allow auth reads"     on public.bookings;
drop policy if exists "Allow auth updates"   on public.bookings;
drop policy if exists "Allow auth deletes"   on public.bookings;

create policy "Allow public inserts"
  on public.bookings for insert
  with check (true);

create policy "Allow auth reads"
  on public.bookings for select
  using (auth.role() = 'authenticated');

create policy "Allow auth updates"
  on public.bookings for update
  using (auth.role() = 'authenticated');

create policy "Allow auth deletes"
  on public.bookings for delete
  using (auth.role() = 'authenticated');

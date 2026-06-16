-- Add NCS-specific columns to the pre-existing bookings table.
-- Uses IF NOT EXISTS so this is safe to re-run.
alter table public.bookings
  add column if not exists full_name      text,
  add column if not exists phone          text,
  add column if not exists email          text,
  add column if not exists service        text,
  add column if not exists preferred_date date,
  add column if not exists message        text,
  add column if not exists status         text;

-- Set a default for status and back-fill any null rows
alter table public.bookings
  alter column status set default 'new';

update public.bookings
  set status = 'new'
  where status is null;

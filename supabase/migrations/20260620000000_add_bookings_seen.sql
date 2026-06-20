-- Add `seen` flag so admins can track which bookings they've reviewed.
-- Defaults false so all existing and new bookings start as unseen.

alter table public.bookings
  add column if not exists seen boolean default false;

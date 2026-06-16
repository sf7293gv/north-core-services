create table public.photos (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  category text not null,
  created_at timestamptz default now()
);

alter table public.photos enable row level security;

create policy "Allow public reads"
  on public.photos for select
  using (true);

create policy "Allow auth inserts"
  on public.photos for insert
  with check (auth.role() = 'authenticated');

create policy "Allow auth deletes"
  on public.photos for delete
  using (auth.role() = 'authenticated');
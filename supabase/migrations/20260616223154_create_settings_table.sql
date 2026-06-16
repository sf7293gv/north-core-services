create table if not exists public.settings (
  id            integer     primary key default 1,
  phone         text,
  email         text,
  facebook_url  text,
  instagram_url text,
  google_url    text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.settings enable row level security;

drop policy if exists "Allow public reads" on public.settings;
drop policy if exists "Allow auth updates" on public.settings;
drop policy if exists "Allow auth inserts" on public.settings;

create policy "Allow public reads"
  on public.settings for select
  using (true);

create policy "Allow auth updates"
  on public.settings for update
  using (auth.uid() is not null);

create policy "Allow auth inserts"
  on public.settings for insert
  with check (auth.uid() is not null);

-- Seed the single settings row so upsert always finds id=1
insert into public.settings (id) values (1) on conflict do nothing;

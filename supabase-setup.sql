-- Run this once in Supabase: left sidebar -> SQL Editor -> New query ->
-- paste this in -> Run.

create table if not exists public.kutty_shared (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

alter table public.kutty_shared enable row level security;

-- The site has no user accounts (it is gated by the shared password), so the
-- anonymous key is allowed to read and write this one table. Nothing else in
-- the database is exposed.
drop policy if exists "kutty house full access" on public.kutty_shared;
create policy "kutty house full access"
  on public.kutty_shared
  for all
  to anon
  using (true)
  with check (true);

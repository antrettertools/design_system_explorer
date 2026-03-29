-- =============================================================
-- dsygn.cloud — Initial Schema (Phase 1)
-- Run once in Supabase SQL Editor after creating the project.
-- =============================================================

-- Users profile table (extends auth.users)
create table public.users (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text,
  username    text not null unique,
  plan        text not null default 'free' check (plan in ('free', 'paid')),
  paid_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- Row Level Security
alter table public.users enable row level security;

-- Authenticated users can read their own row
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

-- Anon key can read username + id — required by hosted viewer (/s/:username/:slug)
create policy "users_select_username_public" on public.users
  for select using (true);

create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

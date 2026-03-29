-- Phase 2: Design saves table
-- Run this in the Supabase SQL Editor after 001_initial_schema.sql

create table public.designs (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid not null references public.users(id) on delete cascade,
  name        text not null,
  slug        text,
  data        jsonb not null,
  is_public   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(user_id, slug)
);

-- Row Level Security
alter table public.designs enable row level security;

-- Owners can CRUD their own designs
create policy "designs_crud_own" on public.designs
  for all using (auth.uid() = user_id);

-- Anyone can read public designs (needed for hosted page viewer in Phase 4)
create policy "designs_select_public" on public.designs
  for select using (is_public = true);

-- Auto-update updated_at on row changes
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger designs_updated_at
  before update on public.designs
  for each row execute function public.set_updated_at();

-- Phase 4: Design version history
-- Run in the Supabase SQL Editor after 002_designs_table.sql

create table public.versions (
  id          uuid default gen_random_uuid() primary key,
  design_id   uuid references public.designs(id) on delete cascade,
  name        text,                -- optional user-set label
  data        jsonb not null,      -- full ShareSnapshot at time of save
  created_at  timestamptz default now()
);

-- RLS: only the design owner can read/write their versions
alter table public.versions enable row level security;

create policy "users can manage their own versions"
  on public.versions
  for all
  using (
    design_id in (
      select id from public.designs where user_id = auth.uid()
    )
  );

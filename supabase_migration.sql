-- Run this once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).
--
-- Fixes: POST .../heat_assessments?on_conflict=assessment_id returning 404.
-- That happened because the app tries to persist every analysis to this
-- table, but the table was never created in your Supabase project.

create table if not exists public.heat_assessments (
  id bigint generated always as identity primary key,
  assessment_id text not null unique,
  site_name text,
  location text,
  activity_type text,
  decision_status text,
  threshold_temp numeric,
  current_temp numeric,
  heat_index numeric,
  data_payload jsonb,
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  created_at timestamptz not null default now()
);

-- Row Level Security: on by default in Supabase. Without a policy, every
-- request (including the anon/publishable key the app uses) is denied,
-- which would also show up as an error — just a 401/403 instead of 404.
alter table public.heat_assessments enable row level security;

-- Hackathon-simple policy: anyone holding your publishable anon key can
-- read/write. Fine for a judged demo; tighten before any real deployment
-- (e.g. restrict writes to `auth.uid() = user_id`).
create policy "Allow anon read/write for demo"
  on public.heat_assessments
  for all
  using (true)
  with check (true);

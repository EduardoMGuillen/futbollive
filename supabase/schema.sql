create table if not exists public.site_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_state enable row level security;

-- The application accesses this table only from server routes with the service-role key.
-- No public browser policy is intentionally created.

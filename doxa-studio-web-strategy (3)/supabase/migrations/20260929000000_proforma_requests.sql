-- Proforma quote requests. Only the Edge Function service role can access rows.
create table if not exists public.proforma_requests (
  id uuid primary key default gen_random_uuid(),
  quote_number text not null unique,
  client_name text not null,
  client_email text not null,
  client_company text not null default '',
  needs text[] not null default '{}',
  intention text not null,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'approved', 'expired')),
  approval_token_hash text unique,
  token_expires_at timestamptz not null,
  line_items jsonb,
  total_xof bigint,
  approved_at timestamptz,
  resend_email_id text,
  created_at timestamptz not null default now()
);

create index if not exists proforma_requests_pending_idx
  on public.proforma_requests (status, created_at desc);

alter table public.proforma_requests enable row level security;

-- No anon/authenticated policies: all reads and writes go through the
-- Supabase Edge Function using a server-only service role key.

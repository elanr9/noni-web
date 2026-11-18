-- Lead capture for the public site: the landing waitlist, the business
-- "Get started" form, the Enterprise "Contact us" form and TestFlight
-- invite requests from /invite and onboarding. Written only by
-- src/app/api/leads/route.ts with the service role. RLS is on with no
-- policies, so anon and authenticated clients can neither read nor write.
-- NOT APPLIED YET. Until it is, /api/leads answers 503 with friendly copy.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  kind text not null
    check (kind in ('waitlist', 'business', 'enterprise', 'testflight')),
  name text not null,
  email text not null,
  phone text,
  company text,
  website text,
  message text,
  source text,
  user_agent text,
  handled_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (lower(email));

alter table public.leads enable row level security;

comment on table public.leads is
  'Public form submissions (waitlist, business, enterprise, testflight). Service role only.';

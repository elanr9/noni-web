-- Noni screenshot library. Each brain feature holds many screenshots:
-- admin uploads plus Noni-made polished shots (phone or laptop shaped)
-- that campaign managers drop into brief clips.

create table if not exists public.feature_screenshots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  feature_id uuid not null references public.brain_features (id) on delete cascade,
  path text not null,
  source text not null default 'upload' check (source in ('upload', 'noni')),
  shape text not null default 'phone' check (shape in ('phone', 'laptop')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists feature_screenshots_feature_idx
  on public.feature_screenshots (feature_id, sort_order);

create index if not exists feature_screenshots_company_idx
  on public.feature_screenshots (company_id);

comment on table public.feature_screenshots is
  'Screenshot library per brain feature. source=noni rows are AI-polished shots sized for phone (1024x1536) or laptop (1536x1024).';

alter table public.feature_screenshots enable row level security;

drop policy if exists feature_screenshots_company_select on public.feature_screenshots;
create policy feature_screenshots_company_select
  on public.feature_screenshots for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.company_id = feature_screenshots.company_id
    )
  );

-- Top posts pulled from Company Brain inspiration accounts.
-- Up to 5 per account, ranked by views / likes / shares, then analyzed
-- so weekly briefs can copy what already works in the niche.

create table if not exists public.source_posts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  platform text not null,
  handle text not null,
  external_id text not null,
  url text not null,
  caption text not null default '',
  thumbnail_url text not null default '',
  views integer not null default 0,
  likes integer not null default 0,
  shares integer not null default 0,
  comments integer not null default 0,
  score integer not null default 0,
  hook text not null default '',
  why text not null default '',
  format text not null default 'Video',
  fetched_at timestamptz not null default now(),
  unique (company_id, platform, external_id)
);

create index if not exists source_posts_company_handle_idx
  on public.source_posts (company_id, platform, handle);

comment on table public.source_posts is
  'Best posts from inspiration accounts. Feeds company-specific brief generation with what already works on TikTok and Instagram.';

alter table public.source_posts enable row level security;

create policy source_posts_company_select
  on public.source_posts for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.company_id = source_posts.company_id
    )
  );

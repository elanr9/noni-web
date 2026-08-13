-- Product features on Company Brain: a screenshot plus one sentence per
-- claim. GPT ranks them for UGC virality and stamps the week's
-- campaign-manager brief templates from the winners.

create table if not exists public.product_features (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null default '',
  sentence text not null,
  screenshot_path text not null,
  score integer,
  reason text not null default '',
  rank integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_features_company_rank_idx
  on public.product_features (company_id, rank);

comment on table public.product_features is
  'Company Brain features. Screenshot plus one sentence; score/reason come from GPT virality ranking.';

create table if not exists public.brief_templates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  feature_id uuid references public.product_features (id) on delete set null,
  week_start date not null,
  title text not null,
  format text not null,
  type_label text not null default '',
  example text not null,
  description text not null,
  action text not null,
  phrase text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists brief_templates_company_week_idx
  on public.brief_templates (company_id, week_start, sort_order);

comment on table public.brief_templates is
  'Weekly CM brief stamps: one example to copy, one sentence, one action. Generated from ranked product features.';

alter table public.product_features enable row level security;
alter table public.brief_templates enable row level security;

create policy product_features_company_select
  on public.product_features for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.company_id = product_features.company_id
    )
  );

create policy brief_templates_company_select
  on public.brief_templates for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.company_id = brief_templates.company_id
    )
  );

insert into storage.buckets (id, name, public)
values ('product-features', 'product-features', true)
on conflict (id) do nothing;

create policy product_features_public_read
  on storage.objects for select
  using (bucket_id = 'product-features');

-- Company Brain features: a screenshot plus one sentence per claim. GPT
-- ranks them for UGC virality and stamps the week's campaign-manager brief
-- templates from the winners.
--
-- Named brain_features because the mobile repo already owns a
-- product_features table (claims approval) with a different schema.

create table if not exists public.brain_features (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null default '',
  sentence text not null,
  screenshot_path text not null,
  score integer,
  reason text not null default '',
  rank integer,
  idea_title text not null default '',
  idea_example text not null default '',
  idea_action text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists brain_features_company_rank_idx
  on public.brain_features (company_id, rank);

comment on table public.brain_features is
  'Company Brain features (web admin). Screenshot plus one sentence; score, reason and one video idea come from GPT virality ranking. Not the mobile claims table product_features.';

create table if not exists public.brief_templates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  feature_id uuid references public.brain_features (id) on delete set null,
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
  'Weekly CM brief stamps: one example to copy, one sentence, one action. Generated from ranked brain features.';

alter table public.brain_features enable row level security;
alter table public.brief_templates enable row level security;

create policy brain_features_company_select
  on public.brain_features for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.company_id = brain_features.company_id
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

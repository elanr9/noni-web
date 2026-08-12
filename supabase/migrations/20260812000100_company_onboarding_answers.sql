-- Onboarding answers captured by the /admin invite onboarding flow
-- (design_handoff_admin_app_web/AdminOnbFlow.jsx). Written by Agent B,
-- read by src/lib/admin/data.ts to drive the setup to-do thresholds.
-- data.ts reads these defensively, so deploying code before running this
-- migration is safe (answers default to empty).

alter table public.companies
  add column if not exists admin_role text,
  add column if not exists does_ugc boolean not null default false,
  add column if not exists creator_count integer not null default 0,
  add column if not exists manager_count integer not null default 0,
  add column if not exists self_is_manager boolean not null default false;

comment on column public.companies.admin_role is
  'Onboarding answer: what the company admin does, e.g. Founder or Marketing.';
comment on column public.companies.does_ugc is
  'Onboarding answer: whether the company already does UGC marketing.';
comment on column public.companies.creator_count is
  'Onboarding answer: how many creators they have. Drives the invite-creators setup step.';
comment on column public.companies.manager_count is
  'Onboarding answer: how many campaign managers they have. Drives the invite-managers setup step. 0 omits the step.';
comment on column public.companies.self_is_manager is
  'Onboarding answer: the admin is also a campaign manager. Seeds them as an Active manager row.';

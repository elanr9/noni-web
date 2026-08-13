-- The ops console collects the invitee's name when creating a company but
-- never stored it. Persist it so onboarding can greet and prefill the
-- admin's name without relying on their Google account name.

alter table public.company_invites
  add column if not exists invited_name text;

comment on column public.company_invites.invited_name is
  'Display name typed by ops when sending the invite. Prefills onboarding.';

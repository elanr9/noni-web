-- Two more public forms on the landing page: a creator applying to make
-- posts for brands ("creator"), and a company asking for a call ("call").
-- Every new lead is emailed to the founders by the notify-lead edge function
-- (noni repo), fired from a trigger through pg_net with the cron secret, the
-- same way the other server notifications go out. A failed email never
-- blocks the form.

alter table public.leads drop constraint if exists leads_kind_check;
alter table public.leads
  add constraint leads_kind_check
  check (kind in ('waitlist', 'business', 'enterprise', 'testflight', 'creator', 'call'));

create or replace function public.notify_lead_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform net.http_post(
    url := 'https://zdcmmzofnrdqbwexuqnm.supabase.co/functions/v1/notify-lead',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body := jsonb_build_object('lead_id', new.id),
    timeout_milliseconds := 10000
  );
  return new;
exception when others then
  return new;
end;
$$;

drop trigger if exists leads_notify_created on public.leads;
create trigger leads_notify_created
  after insert on public.leads
  for each row execute function public.notify_lead_created();

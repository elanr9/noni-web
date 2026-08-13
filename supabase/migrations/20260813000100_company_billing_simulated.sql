-- Per-company simulated billing for pilot companies (FieldVision first):
-- checkout, top-ups and Connect write the same company_billing state they
-- would after a real Stripe event, but nothing is ever charged. Read by
-- getBillingContext in src/lib/admin/billing.ts.

alter table public.company_billing
  add column if not exists billing_simulated boolean not null default false;

comment on column public.company_billing.billing_simulated is
  'Pilot mode: billing flows simulate Stripe success and never charge.';

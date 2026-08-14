-- Monthly creator budget as a real recurring Stripe charge: setting a
-- monthly budget creates a second Stripe subscription that charges the
-- company each month, and every paid invoice converts into credits in
-- credit_balance_cents (ledger kind 'budget'). Written by
-- src/app/admin/billing/actions.ts and src/app/api/stripe/webhook/route.ts.

alter table public.company_billing
  add column if not exists stripe_budget_subscription_id text;

comment on column public.company_billing.stripe_budget_subscription_id is
  'Stripe subscription charging the monthly creator budget; each paid invoice becomes a budget credit.';

alter table public.company_credit_ledger
  drop constraint if exists company_credit_ledger_kind_check;

alter table public.company_credit_ledger
  add constraint company_credit_ledger_kind_check
  check (kind = any (array[
    'topup'::text,
    'budget'::text,
    'bounty_debit'::text,
    'streak_debit'::text,
    'adjustment'::text,
    'fee_company'::text
  ]));

alter table public.company_credit_ledger
  add column if not exists stripe_invoice_id text unique;

comment on column public.company_credit_ledger.stripe_invoice_id is
  'Stripe invoice behind a budget credit; unique so webhook retries never double credit.';

-- Subscription, credit and Stripe Connect state for the /admin Billing tab
-- (design_handoff_admin_app_web/AdminSetupTabs.jsx). Written by Agent C's
-- Stripe webhooks, read by src/lib/admin/data.ts. All columns are read
-- defensively, so deploying code before running this migration is safe.

alter table public.company_billing
  add column if not exists subscription_status text not null default 'none',
  add column if not exists subscription_plan text,
  add column if not exists subscription_price_cents integer,
  add column if not exists subscription_renews_at timestamptz,
  add column if not exists card_brand text,
  add column if not exists card_last4 text,
  add column if not exists credit_balance_cents integer not null default 0,
  add column if not exists auto_top_up boolean not null default false,
  add column if not exists stripe_connected boolean not null default false,
  add column if not exists stripe_account_id text;

comment on column public.company_billing.subscription_status is
  'none or active. Set by Stripe Checkout webhooks.';
comment on column public.company_billing.subscription_plan is
  'monthly ($200/mo) or annual ($100/mo billed $1,200/yr).';
comment on column public.company_billing.subscription_price_cents is
  'Effective monthly price in cents, e.g. 20000 monthly, 10000 annual.';
comment on column public.company_billing.credit_balance_cents is
  'Extra credit balance from one-off top-ups, on top of the monthly limit.';
comment on column public.company_billing.auto_top_up is
  'Refill $1,000 when the credit balance falls under $200.';
comment on column public.company_billing.stripe_connected is
  'Read-only Stripe Connect link that powers sales and sign-up analytics.';

-- Inspiration accounts gain a per-row mute (Company Brain tab).
alter table public.source_accounts
  add column if not exists muted boolean not null default false;

comment on column public.source_accounts.muted is
  'Muted inspiration accounts stay listed but stop informing briefs.';

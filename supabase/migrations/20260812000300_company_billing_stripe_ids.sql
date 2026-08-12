-- Stripe object ids for the /admin Billing tab (Agent C). The checkout
-- webhook maps Stripe customers and subscriptions back to a company through
-- these columns; the top-up flow charges the saved subscription card. All
-- columns are read defensively, so deploying code before running this
-- migration is safe.

alter table public.company_billing
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;

comment on column public.company_billing.stripe_customer_id is
  'Stripe Customer (cus_...) created by the subscription Checkout Session.';
comment on column public.company_billing.stripe_subscription_id is
  'Stripe Subscription (sub_...) behind subscription_status = active.';

-- Upserts from the billing actions and webhook key on company_id.
create unique index if not exists company_billing_company_id_key
  on public.company_billing (company_id);

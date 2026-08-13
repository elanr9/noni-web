-- Pricing plans business model (design_handoff_pricing_plans): Starter,
-- Premium and Enterprise tiers in a monthly or annual cadence, priced by
-- how many creators a company runs on Noni. No schema change: the existing
-- subscription_plan text column now stores the compound plan key. Legacy
-- 'monthly'/'annual' rows are grandfathered as Premium in code
-- (src/lib/admin/billing.ts parseStoredPlan), so no data rewrite here.

comment on column public.company_billing.subscription_plan is
  'starter_monthly ($100/mo), starter_annual ($75/mo billed $900/yr), premium_monthly ($250/mo), premium_annual ($150/mo billed $1,800/yr) or enterprise (sales-led). Legacy monthly/annual rows read as Premium.';

comment on column public.company_billing.subscription_price_cents is
  'Effective monthly price in cents, e.g. 10000 starter monthly, 7500 starter annual.';

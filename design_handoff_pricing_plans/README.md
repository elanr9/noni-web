# Noni — Pricing / Subscription screen (company admin Billing tab)

Build the subscription section of the company admin Billing tab exactly as designed. `PricingPlans.html` (open in a browser, needs the sibling `styles.css` + `tokens/`) is the source of truth. Screenshot-compare before marking done.

## Where it lives
Company admin web app (`usenoni.app/admin`), Billing tab. This plan picker is what a company sees when they have no active subscription, and it opens in the "change plan" flow when they do. It replaces the old Monthly/Annual PlanCard modal in `admin-setup-tabs.jsx` (`design_handoff_admin_app_web`). The rest of the Billing tab (creator budget, top-ups, Stripe card) is unchanged.

## Plans (the business model)
| Plan | Monthly | Annual | Creator cap per campaign |
|---|---|---|---|
| Starter | $100/mo | $75/mo (billed annually, $900/yr) | 5 |
| Premium | $250/mo | $150/mo (billed annually, $1,800/yr) | 15 |
| Enterprise | contact us | contact us | Unlimited |

The ONLY functional difference between plans is the creator cap. Everything else (campaigns, briefs, approvals, analytics, payouts) is included on all plans.

## Design spec
- Ground `--off-white`, font Poppins (400 to 800), content centered, cards radius 20, pills fully round.
- Header: "Subscription" pill eyebrow, 38px title, one sub paragraph. Sentence case, verbs on buttons, no emoji, no exclamation marks.
- Billing toggle: white pill container, active segment is ink with white text; **annual is the default**. Green chip "Save up to 40% annually" sits beside it.
- Cards, left to right: Starter (white, quiet outline CTA), Premium (white, 2px `--blue-500` border, blue glow shadow, centered "MOST POPULAR" chip overlapping the top edge, filled blue CTA), Enterprise (`--ink-900` dark card, ghost CTA "Contact us").
- Price block: 42px price + "/mo"; on annual, the monthly price shows struck through beside it and the note reads "per month, billed annually". Price re-animates (om-rise, 220ms) on toggle.
- Feature list: blue-circle check icons; the creator cap line is bold and always first.
- Footer note: "Checkout and card details are handled by Stripe. The same card funds your creator budget."
- All pill/chip labels `white-space: nowrap` (recurring bug, bake it in).

## Behavior to build
- CTAs open Stripe Checkout with the matching price (4 Stripe prices: starter/premium × monthly/annual). "Contact us" opens a mailto or contact form, founders' call.
- Current plan state: when a company already subscribes, its plan's CTA becomes "Current plan" (disabled) and the others read "Switch to Starter/Premium"; switching goes through Stripe's subscription update, prorated.
- **Enforce the cap**: adding creators to a campaign is blocked past the plan cap (5/15). The blocked state should name the fix ("Starter allows 5 creators per campaign. Upgrade to Premium for 15.") and deep-link to this screen.
- Downgrade guard: block downgrade while any campaign has more creators than the target cap; name the campaigns.

## Stack
Same as the admin web app handoff: Next.js (App Router) + TypeScript + Tailwind (map tokens to a theme) + Supabase + Stripe subscriptions (`company-billing-api.ts` in the noni repo). Never hardcode a hex that exists as a token.

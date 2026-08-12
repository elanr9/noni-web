# Noni — Company admin onboarding + dashboard (`/admin`) build handoff

Build the **Noni company admin surface** exactly as designed in this project: the invite-link onboarding, the paywalled dashboard with the gamified setup to-do, and the five working tabs. The prototype is final and interactive. Treat it as the spec, click through EVERY path before writing code.

## Source of truth (all in THIS folder — open `AdminApp.html` in a browser, it runs as-is)
- `AdminApp.html` — the live prototype (onboarding + full app). Click through EVERY path before writing code.
- `AdminOnbFlow.jsx` — invite landing, Google sign-in, question steps, download screen.
- `AdminSetupApp.jsx` — app shell, nav model, spotlight tour, setup to-do, achievements, tab retirement.
- `AdminSetupTabs.jsx` — Posts, Company Brain, Team, Billing pages and their modals.
- `AdminAnalytics.jsx` — analytics explorer, daily-activity calendar, day/post details, profile pages.
- `WebKit.jsx` — shared kit (KShell, KSearch, KModal-with-portal, KPill with hover/press, KChip, KCard, KField, KPageHead). Same kit as the ops console handoff, share the package.
- `styles.css` + `tokens/*.css` — color/spacing/shadow/motion tokens. Never hardcode a hex that exists as a token.
- Brand: marlin mark `assets/noni-logo.svg`, lowercase "noni" wordmark, **Poppins** (400/500/600/700/800).
- `review-phone-crop.png` — the phone screenshot on the download screen. `image-slot.js` is prototype-only plumbing for it; in production it is a plain <img>.

## Stack
Next.js (App Router) + TypeScript + Tailwind (tokens mapped to a theme) + Supabase (`lib/` in the noni repo: `admin-api.ts`, `analytics-api.ts`, `company-billing-api.ts`, `briefs-api.ts`) + **Stripe** (Checkout for the subscription, PaymentIntents for budget top-ups, read-only Connect for revenue analytics). Auth: Google only. Route base: `/admin`. One company per admin account, resolved from the invite.

## The flow (must match exactly)
1. **Invite link** — ops console sends the email (see ops handoff). Landing: "You're invited / To run {Company}'s UGC with Noni!" + **Get started with Google** + the invited email shown. Signing in with any other Google account shows the invited address and offers account switch.
2. **Onboarding questions, one per screen**, segmented progress dashes, top-aligned, `om-rise` between steps. Text steps use a Next button; choice steps auto-advance ~120ms after the pick (blue fill flash, NO checkmark, no Next). Back is a quiet text button.
   - Who are you? (name, prefilled from Google)
   - What do you do? (6 choice cards: Founder / Marketing / Content / Growth / Operations / Something else)
   - What's your website? (required; copy: "We'll scan your site to learn your company and brand.")
   - Do you already do UGC marketing? (Yes / Not yet)
   - If yes: How many creators do you have? then And how many campaign managers? (stepper, 0 allowed; primary reads "I don't have any/one" at 0)
   - If managers > 0: "Are you the campaign manager?" (1) / "Are you one of the campaign managers?" (2+). **Yes** → download screen: phone screenshot + "Download the Noni App to run your campaigns!" + "This Google account is already set as a campaign manager for {Company}." + **I downloaded it!** (no Back). Yes also seeds the admin as an Active campaign manager on Team and counts toward the invite step.
   - Finish: "That's it." → **Look around** starts the spotlight tour.
   - NO payment in this flow. Payment lives in the Billing setup step.
3. **Spotlight tour** — dim overlay with a cutout + popover, steps through every nav item then the ⌘K search, syncing the active tab as it goes. Skippable; last button "Start step 1".
4. **Dashboard with the setup to-do** (Onboarding tab).

## Global shell
Same as ops: 236px sidebar (logo, company chip, nav, user + sign-out), top-center ⌘K smart search (pages + team members, match highlighting, Enter = top hit, "/" focuses), content max-width 1100 on `#F7FAFD`, `om-fade/om-pop/om-rise` motion, modals in a portal on `document.body`, `white-space: nowrap` on every pill/tab/dropdown label.

Nav: **Workspace** = Onboarding (house, badge = steps left) · Analytics · Team · Posts; **Company** = Company Brain · Billing.

## Onboarding tab (the to-do)
"Hey {first name}. N steps and {Company} runs itself." Checklist card: progress bar + "N of M done", numbered rows → green check + strikethrough + Done chip when complete, action pill otherwise.
1. **Fill in your company brain** — done when Product AND Audience docs are non-empty.
2. **Set your budget and subscription** — done when subscription active AND monthly spend limit set AND Stripe connected.
3. **Invite your campaign manager(s)** — titled with the count from onboarding ("Invite your 2 campaign managers"); done at that many manager rows (self-as-manager counts). Omitted when count is 0.
4. **Invite your creators** — same count logic ("Invite your 2 creators"); subtitle shows "1 of 2 invited so far."
- Achievement toast (bottom-center pill, auto-dismiss ~3.4s) per step, plus a final "{Company} is fully set up".
- **When all steps are done the Onboarding tab disappears** from nav and search; if the user is on it, redirect to Analytics.

## Tabs
- **Analytics** — stat strip (views / posts / sign-ups attributed / paid to creators, with deltas). **Graph | Calendar toggle** in the page head (never both at once):
  - Graph: the same explorer engine as ops — Filters (Format + Creator, composable, count badge), Sort by (Views over time / Top creators / Top posts / Formats), time range (Last 24 hours → Last 12 weeks); every combination re-derives the view. Top creators are **ranked #1/#2/#3** with avatar, bar, "X views", hover "View profile", click → profile page.
  - Calendar: daily-activity month; day badge = "+sign-ups · $sales", dot = posts published; clicking a day opens an **inline card below** (never a modal): views / sign-ups / sales + that day's posts; clicking a post swaps the card to the **post detail** (back arrow, total views, earned, TikTok vs Instagram views/likes/saves, Open post external link).
- **Team** — Campaign managers + Creators cards, counts in the header, Invite pills → modal (name + email → "Send invite" → success state explaining role-aware sign-in: the invitee's email is pre-bound to role + company, so app sign-in lands them correctly with zero setup). Rows: Active (green) vs Invite sent (amber). **Clicking any member opens a full profile page** (not a modal): back arrow, contact card, creators get stat strip + clickable posts, campaign managers get their briefs list.
- **Posts** — **Grid | Calendar toggle**. Grid cards hover-lift and click into the post detail. Calendar reuses the daily-activity component with the same inline day → post drill-in.
- **Company Brain** — Product + Audience doc cards: whole card clickable (hover lift), Empty/Filled chip, "Click to fill it in". Editor modal: textarea + **Clean up with AI** (disabled when empty, brief working state) + Done. No word count. Inspiration accounts card: TikTok/Instagram segmented + handle input, seeded with 5 reference accounts, mute/remove per row.
- **Billing** — three cards + top-up history:
  - **Subscription**: Not active → "Choose a plan" → plan modal with side-by-side Monthly $200/mo and Annual $100/mo (Save 50%, billed $1,200/yr) cards, each with its own CTA → **Stripe Checkout redirect** (never in-app card fields). Active → price, renewal line, card on file, "Manage plan" (Current chip, Cancel current plan, Upgrade/Switch).
  - **Creator budget** (Claude-usage style rows): "$X spent · Resets {1st}" with %-used bar (blue → amber >60% → red >85%) against the **Monthly spend limit** row ("Not set" → Set limit modal with $500/$1k/$2.5k quick picks + custom); **Extra credit balance** row with one-off Top up modal + inline auto top-up toggle (refill $1,000 under $200).
  - **Stripe**: read-only Connect card ("Not connected" → Connect with Stripe → connected acct line). Powers sales/sign-up numbers in Analytics.
  - Alert card when subscription is active but no monthly budget is set.

## Copy rules
Sentence case; verbs on buttons; no emoji; **never an em or en dash anywhere in UI copy** (rewrite with a period, comma, or colon); empty states name the next action; onboarding titles are questions.

## Parallel agent plan (Cursor)
One integration branch; each agent owns its files, no cross-edits. Merge order: A → B/C/D/E in parallel → F. Reuse the kit package from the ops build if it has landed; otherwise Agent A delivers it for both.

- **Agent A — Kit + shell + auth (blocks everyone, land first).** Shared kit (incl. KPill hover/press states, portal modal, segmented view toggle, MonthCal, AreaChart, BarRow, dropdowns), `/admin` layout (sidebar + ⌘K), token→Tailwind theme, Google auth + invite-token resolution (role + company binding), route guards. Storybook-style demo page as the deliverable.
- **Agent B — Onboarding flow + tour.** The question stepper (progress dashes, auto-advance choice cards, stepper counts, conditional branches, download screen), the spotlight tour engine (element targeting, cutout, popover, tab sync), persistence of answers to Supabase (company row + counts + self-manager flag).
- **Agent C — Billing + Stripe.** Checkout session for monthly/annual, webhook → subscription state, manage/cancel/switch, monthly spend limit + credit balance + top-ups (PaymentIntents) + auto top-up job, read-only Stripe Connect for analytics revenue. The setup-step completion logic (active + limit + connected) lives here as one selector.
- **Agent D — Analytics.** The explorer as ONE reusable component (filters/sort/range state machine, series derivation as pure unit-tested functions), Graph|Calendar toggle, daily-activity calendar with inline day → post drill-in, post detail. Wire to `analytics-api.ts` + Stripe revenue.
- **Agent E — Team + Brain + Posts + to-do.** Invite emails with role binding, profile pages (creator + manager variants), Posts grid/calendar, Company Brain docs (Clean up with AI via the existing Claude endpoint) + inspiration accounts, the Onboarding tab checklist + achievements + tab retirement.
- **Agent F — Integration + QA.** Real data end to end, invite → sign-in → onboarding → paywall → completed-state walkthrough, side-by-side with the prototype at 1440px AND ~1000px: no wrapped pills, modals centered, every hover/empty/achievement state matches, tour targets align after resize.

Working agreement: read the prototype file for your surface before coding; kit components only, zero one-off styles; tokens only; screenshot-compare your surface against the prototype before marking done.

## Acceptance checklist
- Invite link binds email → role → company; wrong Google account is caught at sign-in; campaign-manager "Yes" makes the same account a manager in the app with no extra setup.
- Onboarding: choice steps auto-advance with no Next; counts drive the to-do titles and completion thresholds; 0 managers removes that step.
- No payment before the app; Billing step requires subscription + monthly limit + Stripe connect; checkout is Stripe-hosted.
- To-do achievements fire once each; Onboarding tab vanishes everywhere (nav, search, badge) when complete and never returns.
- Analytics filters/sorts/ranges all compose; calendar day and post details are inline, never modals; profiles are pages, never modals.
- ⌘K reaches every page and person from every screen.
- No em or en dash appears anywhere in rendered copy.

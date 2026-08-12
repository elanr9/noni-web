# Noni — Ops Console (`/ops`) build handoff

Build the **Noni platform admin console** exactly as designed in this project. This is the internal view Noni's founders use to run every company on the platform. The design is final and interactive — treat it as the spec.

## Files in this package
- `OpsConsole.html` — open directly in a browser; the full interactive prototype (needs the sibling files below).
- `OpsApp.jsx` / `WebKit.jsx` — every screen + the shared UI kit.
- `styles.css` + `tokens/` — design tokens. `_ds_bundle.js` — icon/component bundle the prototype loads.
- `assets/noni-logo.svg` — the marlin mark.

## Source of truth
- `OpsConsole.html` — the live prototype. Click through EVERY screen before writing code.
- `OpsApp.jsx` — all screens, data shapes, copy, and interaction logic.
- `WebKit.jsx` — the shared UI kit (KShell, KSearch, KModal, KPill, KChip, KCard, KField, KTabs pattern).
- `styles.css` + `tokens/*.css` — color/spacing/shadow/motion tokens. Never hardcode a hex that exists as a token.
- Brand: marlin mark `assets/noni-logo.svg` (in this package), lowercase "noni" wordmark. Font: **Poppins** (400/500/600/700/800) everywhere; display weight 700, UI 600–700.

## Stack
Next.js (App Router) + TypeScript + Tailwind (map tokens to a theme) + Supabase (the product's existing backend — see `lib/` in the noni repo: `admin-api.ts`, `analytics-api.ts`, `company-billing-api.ts`, `briefs-api.ts`). Auth: Google-only sign-in, hard-gated to platform accounts. Route base: `/ops`.

## Global shell (every page)
- Left sidebar 236px: logo + "noni", nav = Overview, Companies, Users, Invites; user card + sign-out pinned bottom.
- Top-center **⌘K smart search** (Stripe-style): grouped results — Go to (pages), Companies, Users, Invites; match highlighting; Enter = top hit; "/" also focuses; Esc closes; navigating a person result opens their profile modal.
- Content column max-width 1100, soft ground `#F7FAFD`, cards white with 1px `--line` hairline + `--shadow-card`, radius 16, pills fully round.
- Motion: `om-fade`/`om-pop`/`om-rise` (180–260ms, ease-out) on modals, dropdowns, page/tab transitions. **All modals and cursor tooltips render in a portal on `document.body`** (transforms trap `position:fixed` — this bug already happened; don't reintroduce it).
- Every pill/tab/dropdown label: `white-space: nowrap` (second recurring bug — bake it into the kit components).

## Screens
1. **Overview** — title mirrors range ("This Week on Noni", "Today on Noni"…, default Last 7 days). Stat strip (views, posts, active campaigns, creators + deltas, View company pill when scoped). Control row: company scope dropdown (left) · Filters (Format + Creator, composable, count badge) · Sort by (Views over time / Top creators / Top posts / Formats) · time range (right). The main graph re-renders per every filter combination. No content below the graph block.
2. **Companies** — Active companies only (invite-pending companies appear NOWHERE except Invites). Rows: avatar, name, admin email, campaigns · posts · views, status. **New company** modal: Company name / Website (optional) / Admin name / Admin email → sends the one invite email → success state. Company cards elsewhere hover-lift with "Open →".
3. **Company detail** — header (name, website · joined, status) + 5 tabs:
   - **Analytics**: stat strip → explorer card (same Filters / Sort by / range engine as Overview, scoped to the company; Top-creator bars open profiles via cursor-following "View profile" tag; Top-post cards open the post detail) → **Daily activity calendar** (badge = sign-ups + $ per day; day click = modal with sales / sign-ups / downloads + that day's posts).
   - **Team**: sub-tabs Admins / Creators / Campaign Managers + Sort dropdown (creators: Views/Posts/Name), rows open profile modal.
   - **Posts**: cards (title, creator, date, TikTok/IG views, total views, $ earned) → post detail (thumbnail, Open post external link, views/earned/sales/sign-ups that day, TikTok vs Instagram views/likes/saves).
   - **Company Brain**: Product + Audience doc cards (word count, updated, preview → editor modal with AI clean up + Save) + Inspiration accounts (TikTok/IG handles, Reference/Discovered, mute, add).
   - **Billing**: monthly budget vs spent (progress bar: blue → amber >60% → red >85%), "Running low" alert + one-click **Ping <admin> to top up** when remaining <20%, top-up history, remove-company (type "remove this company" to confirm, Vercel-style).
4. **Users** — sub-tabs Admins / Creators / Campaign Managers + Sort; creators show posts · views; rows → profile modal → **View profile** page:
   - Creator: contact card (company name is a plain link), stat strip (posts / views / earned), posts in one internally-scrolling card; each post opens full post detail.
   - Campaign manager: This-week chart with metric dropdown (Views / Revenue / Sign-ups) in the right column, plus a **full-width Briefs browser card below the profile grid**: chevron arrows step through weeks ("Aug 2 – 8", "Aug 9 – 15", … — derive Sun–Sat weeks from the campaign date range; arrows disable at bounds; week change resets day selection). Day strip = a "Full week" pill (default) + one flexing pill per day, dot on days with a brief or post. Full week shows "Posted this week" (2-col grid of mini post cards: thumbnail glyph, title, `Aug N · creator · views · $earned`, external **Open** link) then "Briefs this week" (full brief cards: title, `Aug N`, format chip, Active/Archived chip, HOOK / SCRIPT / CAPTION blocks; 2-col when >1). A selected day shows the same two sections scoped to it ("Posted Aug 9" / "Brief for Aug 9"). Empty states name what's missing ("No brief ran this day."). Content transitions use `om-rise` keyed on week+day. Extract the week-strip pill and mini post card as kit pieces — the company-admin build reuses this browser.
   - Back always returns to where you came from.
5. **Invites** — every admin invite, Pending/Accepted/Expired, Resend ("Sent just now" state).

## Copy rules
Sentence case; verbs on buttons ("Send invite", "Ping Dana to top up"); no exclamation marks, no emoji; empty states name the next action ("Nothing ran on Aug 5.").

## Parallel agent plan (Cursor)
Run one integration branch; each agent owns its files, no cross-edits. Merge order: A → B/C/D/E in parallel → F.

- **Agent A — Kit + shell (blocks everyone; do first).** `components/kit/*` (Card, Pill, Chip, Avatar, Field, Modal-with-portal, Tabs, SortDropdown, FiltersDropdown, HoverPeek, PageHead, AreaChart, BarRow, MonthCal), the `/ops` layout (sidebar + ⌘K search), token→Tailwind theme, motion keyframes. Deliver Storybook-style demo page.
- **Agent B — Analytics engine.** The explorer (scope/filters/sort/range state machine + chart data derivation) as ONE reusable component used by Overview and Company-Analytics; daily-activity calendar + day modal. Pure functions for series derivation, unit-tested.
- **Agent C — Companies + Invites.** List, create-company modal + invite email flow, invites list/resend, remove-company confirm, Supabase mutations.
- **Agent D — Company detail.** Tab shell + Team / Posts (+ post detail) / Company Brain / Billing, consuming A's kit and B's explorer.
- **Agent E — Users + profiles.** Users page, profile modal, full profile pages (creator + campaign manager variants incl. briefs day-picker).
- **Agent F — Integration + QA.** Wire real data, auth gating, route transitions, then walk the prototype side-by-side at 1440px AND ~1000px checking: no wrapped pills, modals centered on viewport, every hover/empty/pending state matches.

Working agreement for every agent: read the prototype file for your surface before coding; reuse kit components (zero one-off styles); tokens only; every list row hover state + cursor tooltip where the design has one; screenshot-compare your surface against the prototype before marking done.

## Acceptance checklist
- ⌘K works from every page and navigates correctly.
- Invite-pending companies invisible outside Invites.
- All filters/sorts compose on both analytics surfaces.
- Modals: portal, centered, backdrop full-viewport, Esc/backdrop close.
- Nothing wraps to two lines in pills/tabs/dropdowns at 1000px width.
- Every destructive action double-confirms; every pending invite can resend.

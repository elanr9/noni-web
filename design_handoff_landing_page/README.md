# Handoff: Landing Page Hero with iPhone Mockup

## Overview
Update the usenoni.app landing page hero from a centered single-column layout to a two-column layout: existing headline/CTA on the left, an iPhone screenshot (`assets/hero-phone.png`) on the right. The screenshot shows a decoy "UGC submissions inbox" app screen — this is intentional; do not change its content.

## About the Design Files
The files in this bundle are **design references created in HTML** — they show intended look, not production code to copy directly. Recreate the layout in the landing page's existing codebase using its established patterns. The PNG is a final asset and can be used as-is.

## Fidelity
**High-fidelity** for the phone image (use the PNG exactly as provided). **Layout guidance** for the hero restructure — keep all existing copy, fonts, and colors from the current site; only the arrangement changes.

## Hero Layout (desktop ≥1024px)
- Container: max-width 1200px, centered, two columns via flex or grid, `gap: 64px`, vertically centered, `padding: 96px 40px`.
- **Left column (~55%)**, left-aligned (was centered):
  - H1 "noni app" — unchanged type style
  - Subhead "Automated UGC Content Submissions" — unchanged
  - "Join waitlist →" pill button — unchanged style (`#4FBAF2`-ish blue pill, white text)
- **Right column (~45%)**: `assets/hero-phone.png`
  - Render at ~380–420px wide (image is 1206×2622 @3x; intrinsic 402×874)
  - The PNG includes the device bezel, rounded corners, and drop shadow — no extra frame or shadow needed
  - Optional: slight overflow at the bottom of the hero section (`margin-bottom: -80px` inside an `overflow: hidden` hero) for a "rising out" effect — designer's choice
- `alt="Noni app submissions screen"`

## Responsive
- <1024px: stack — text block first (centered again), phone below at ~320px wide, `margin: 48px auto 0`.
- Keep the phone image `height: auto`, never crop the top (dynamic island/status bar must stay visible).

## What the phone screen shows (for reference only — baked into the PNG)
- Status bar (9:41, signal/wifi/battery), dynamic island
- Header: "TUESDAY, AUG 11" eyebrow + "Submissions" title (30px/800) + avatar circle "M"
- Dark card (#0F1720, radius 20): "12 new submissions / Waiting for your review" + blue "Review" pill (#1BA6EE)
- "Latest / View all" row
- 5 submission cards (white, 1px #E6EEF6 border, radius 16): avatar initials circle, @handle (15px/700), meta line (e.g. "Video · 0:24 · 9:41 AM"), right-side pill — blue "Approve" (#1BA6EE) or green "Approved" (#E4F5EC bg, #1F8F5F text)
- Bottom tab bar: Submissions (active, #1BA6EE) / Creators / Profile (inactive #8E9AA6), 24px stroke icons, 11px labels
- Fonts: Figtree (web stand-in for SF Pro); background #F7FAFD

## Design Tokens (phone screen)
- Blue accent #1BA6EE, blue soft #E7F4FD, blue deep #0B76AD
- Ink #0F1720, muted #6B7A8C, subtle #8E9AA6
- Green #1F8F5F / #E4F5EC, amber #E08A16 / #FDF2DF
- Border #E6EEF6, background #F7FAFD, cards #FFFFFF
- Radii: cards 16px, dark card 20px, pills 999px

## Assets
- `assets/hero-phone.png` — 1206×2622 (3x render of 402×874). Ready to use.

## Files
- `reference/HeroPhone.dc.html` + `reference/ios-frame.jsx` — HTML source of the phone screen (design reference only; requires its original runtime, don't ship)

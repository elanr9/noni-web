/* A campaign's own numbers (marketplace_listings, migration 163): posts a
   day, pay per video and per slideshow, the views a post needs before it is
   paid, pay per 1,000 views and the cap on view pay. The database enforces
   the floors; these mirror them for the editor. */

export type CampaignTerms = {
  posts_per_day_min: number;
  posts_per_day_max: number;
  video_post_cents: number;
  static_post_cents: number;
  cents_per_1k_views: number;
  view_pay_cap_cents: number;
  min_views: number;
  brand_color: string | null;
};

export const DEFAULT_TERMS: CampaignTerms = {
  posts_per_day_min: 2,
  posts_per_day_max: 3,
  video_post_cents: 1000,
  static_post_cents: 500,
  cents_per_1k_views: 100,
  view_pay_cap_cents: 30000,
  min_views: 500,
  brand_color: null,
};

export const TERM_FLOORS = { video_post_cents: 1000, static_post_cents: 500, cents_per_1k_views: 100 } as const;

/** The eight flat card colours (public.listing_color picks one from the name). */
export const CARD_COLORS = ["#1BA6EE", "#6D4AE0", "#D0397A", "#16A34A", "#F97316", "#0F172A", "#0D9488", "#E11D48"] as const;

/** Rows written before migration 163 reach the page without these fields. */
export function withTerms<T extends object>(row: T): T & CampaignTerms {
  const r = row as Partial<CampaignTerms>;
  const out = { ...DEFAULT_TERMS } as CampaignTerms;
  for (const k of Object.keys(DEFAULT_TERMS) as (keyof CampaignTerms)[]) {
    const v = r[k];
    if (v !== undefined && v !== null) (out as Record<string, unknown>)[k] = v;
  }
  return { ...row, ...out };
}

export function usd(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
}

export function postsPerDayLabel(t: Pick<CampaignTerms, "posts_per_day_min" | "posts_per_day_max">): string {
  const lo = Math.max(1, t.posts_per_day_min);
  const hi = Math.max(lo, t.posts_per_day_max);
  if (hi > lo) return `${lo} to ${hi} posts a day`;
  return lo === 1 ? "1 post a day" : `${lo} posts a day`;
}

/** "$10/video" */
export function payHeadline(t: Pick<CampaignTerms, "video_post_cents">): string {
  return `${usd(t.video_post_cents)}/video`;
}

/** "+$1/1k views" */
export function paySub(t: Pick<CampaignTerms, "cents_per_1k_views">): string {
  return `+${usd(t.cents_per_1k_views)}/1k views`;
}

export function payLines(t: CampaignTerms): { value: string; label: string }[] {
  return [
    { value: usd(t.video_post_cents), label: "a video" },
    { value: usd(t.static_post_cents), label: "a slideshow" },
    { value: usd(t.cents_per_1k_views), label: "per 1,000 views" },
    { value: usd(t.view_pay_cap_cents), label: "view pay cap" },
    ...(t.min_views > 0 ? [{ value: t.min_views.toLocaleString("en-US"), label: "min. views to get paid" }] : []),
  ];
}

/** White or ink text, whichever reads on the colour. */
export function inkOn(hex: string): "#FFFFFF" | "#0F172A" {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "#FFFFFF";
  const n = parseInt(m[1], 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.62 ? "#0F172A" : "#FFFFFF";
}

/** The colour a card wears: its own, else one picked from the name. */
export function cardColor(color: string | null | undefined, name: string): string {
  if (color && /^#[0-9a-f]{6}$/i.test(color)) return color;
  let h = 0;
  for (const ch of name.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return CARD_COLORS[h % CARD_COLORS.length];
}

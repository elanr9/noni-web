import { createServiceClient } from "@/lib/supabase/service";

/* What Noni paid each creator in a calendar year, for 1099-NEC filing. Noni
   pays from its own bank, so Noni is the payer and a creator gets one form
   for the year across every company. The W-9 is collected by the Mercury
   payout invite and the forms are filed from Mercury's 1099 tab; this list
   is what to check that filing against. Test mode payouts are left out. */

export type TaxForm = "w9" | "check" | "missing";

export interface TaxRow {
  creatorId: string;
  name: string;
  email: string | null;
  /** Two letter code from the creator profile, null when not given. */
  country: string | null;
  paidCents: number;
  payouts: number;
  form: TaxForm;
  /** US (or unknown country) and at or over the year's reporting amount. */
  needs1099: boolean;
}

/** The 1099-NEC reporting amount in cents: $600 through 2025, $2,000 for
    payments made in 2026. It is indexed for inflation from 2027, so add each
    new year's figure here when the IRS publishes it. */
export function reportingThresholdCents(year: number): number {
  return year >= 2026 ? 200_000 : 60_000;
}

export async function getTaxYear(year: number): Promise<TaxRow[]> {
  const supabase = createServiceClient();
  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year + 1}-01-01T00:00:00Z`;

  const [{ data: mercury }, { data: legacy }] = await Promise.all([
    supabase
      .from("mercury_payouts")
      .select("creator_id, amount_cents, mercury_transaction_id, sent_at, settled_at, created_at")
      .eq("status", "sent")
      .gte("created_at", `${year - 1}-12-01T00:00:00Z`)
      .lt("created_at", to),
    supabase
      .from("payouts")
      .select("creator_id, amount_cents, completed_at")
      .eq("status", "paid")
      .gte("completed_at", from)
      .lt("completed_at", to),
  ]);

  const totals = new Map<string, { cents: number; count: number }>();
  const add = (id: string, cents: number) => {
    const t = totals.get(id) ?? { cents: 0, count: 0 };
    t.cents += cents;
    t.count += 1;
    totals.set(id, t);
  };
  for (const p of mercury ?? []) {
    if (String(p.mercury_transaction_id ?? "").startsWith("test_")) continue;
    /* A payout counts in the year the money left, not the year it was queued. */
    const paidAt = String(p.settled_at ?? p.sent_at ?? p.created_at);
    if (paidAt < from.slice(0, 10) || paidAt >= to.slice(0, 10)) continue;
    add(p.creator_id as string, p.amount_cents as number);
  }
  for (const p of legacy ?? []) add(p.creator_id as string, p.amount_cents as number);

  const ids = [...totals.keys()];
  if (ids.length === 0) return [];

  const [{ data: profiles }, { data: creators }, { data: wallets }, users] = await Promise.all([
    supabase.from("profiles").select("id, full_name").in("id", ids),
    supabase.from("creator_profiles" as never).select("user_id, country").in("user_id", ids),
    supabase.from("creator_wallets").select("creator_id, mercury_w9_status").in("creator_id", ids),
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const names = new Map((profiles ?? []).map((p) => [p.id as string, (p.full_name as string | null) ?? ""]));
  const countries = new Map(
    ((creators ?? []) as unknown as { user_id: string; country: string | null }[]).map((c) => [c.user_id, c.country]),
  );
  const emails = new Map((users.data?.users ?? []).map((u) => [u.id, u.email ?? null]));
  const forms = new Map<string, TaxForm>();
  for (const w of wallets ?? []) {
    const id = w.creator_id as string;
    const now = forms.get(id) ?? "missing";
    if (w.mercury_w9_status === "submitted") forms.set(id, "w9");
    else if (w.mercury_w9_status === "unknown" && now === "missing") forms.set(id, "check");
    else forms.set(id, now);
  }

  const threshold = reportingThresholdCents(year);
  return ids
    .map((id): TaxRow => {
      const t = totals.get(id)!;
      const country = (countries.get(id) ?? null)?.toUpperCase() ?? null;
      return {
        creatorId: id,
        name: names.get(id)?.trim() || "Creator",
        email: emails.get(id) ?? null,
        country,
        paidCents: t.cents,
        payouts: t.count,
        form: forms.get(id) ?? "missing",
        needs1099: (country === null || country === "US") && t.cents >= threshold,
      };
    })
    .sort((a, b) => b.paidCents - a.paidCents);
}

import { BillingView } from "@/components/admin/billing/BillingView";
import {
  getBillingContext,
  runAutoTopUpCheck,
  stripeSimulated,
} from "@/lib/admin/billing";
import { getAdminData } from "@/lib/admin/data";
import { getSessionProfile } from "@/lib/auth";

/* Return-trip messages from Stripe redirects. Success needs no banner: the
   webhook (or the simulated write) already flipped the state on screen. */
const NOTICES: Record<string, string> = {
  "checkout=cancelled": "Checkout was cancelled. Your plan has not changed.",
  "connect=declined": "The Stripe connection was declined.",
  "connect=error": "The Stripe connection failed. Try again.",
};

export default async function AdminBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const ctx = await getBillingContext();
  /* The auto top-up "job" runs as a check on every billing read; a
     scheduled job would replace this in production. */
  if (ctx) await runAutoTopUpCheck(ctx);

  const { profile } = await getSessionProfile();
  const data = await getAdminData(ctx?.companyId ?? profile?.company_id ?? "");

  const sp = await searchParams;
  const notice =
    NOTICES[`checkout=${typeof sp.checkout === "string" ? sp.checkout : ""}`] ??
    NOTICES[`connect=${typeof sp.connect === "string" ? sp.connect : ""}`] ??
    null;

  return (
    <BillingView
      billing={data.billing}
      companyName={data.company.name}
      simulated={stripeSimulated()}
      notice={notice}
    />
  );
}

import { CircleAlert, CreditCard, Sparkles } from "lucide-react";
import Link from "next/link";

/* Billing nudges shared across the dashboards.
   - PlanBanner: the strip above every /admin page while the company has no
     plan (paywall) or its renewal failed. Billing shows its own states, so
     the shell hides the strip there.
   - PlanBlockMessage: the inline error when an invite or a publish is
     blocked by the paywall or the creator cap. It names the fix and, for
     company admins, deep-links to the plan picker. */

export type PlanBannerKind = "paywall" | "payment_failed";

export function PlanBanner({ kind }: { kind: PlanBannerKind }) {
  const failed = kind === "payment_failed";
  return (
    <div
      className="mb-5 flex flex-wrap items-center gap-3 px-4 py-3 rounded-ops-md"
      style={{
        background: failed
          ? "var(--color-danger-soft)"
          : "var(--color-blue-100)",
      }}
    >
      {failed ? (
        <CircleAlert size={18} className="shrink-0 text-danger" />
      ) : (
        <Sparkles size={18} className="shrink-0 text-blue-700" />
      )}
      <span className="min-w-[200px] flex-1 text-[13.5px] font-semibold text-ink">
        {failed
          ? "Payment failed. Update your card in Billing to keep inviting creators and publishing campaigns."
          : "Pick a plan to invite creators and publish campaigns. Everything else is ready to set up now."}
      </span>
      <Link
        href="/admin/billing"
        className={`inline-flex items-center gap-[7px] whitespace-nowrap px-3.5 py-2 text-[13px] font-bold no-underline rounded-pill ${
          failed
            ? "bg-danger text-white"
            : "bg-blue-500 text-white shadow-accent"
        }`}
      >
        {failed ? <CreditCard size={14} /> : null}
        {failed ? "Update card" : "See plans"}
      </Link>
    </div>
  );
}

export function PlanBlockMessage({
  error,
  upgrade,
  canOpenBilling,
}: {
  error: string;
  /** The block is a plan problem (paywall, cap or failed payment). */
  upgrade?: boolean;
  /** Company admins get the deep link; managers are told who to ask. */
  canOpenBilling: boolean;
}) {
  return (
    <p
      role="alert"
      className="m-0 text-[13px] font-semibold leading-[1.5] text-danger"
    >
      {error}
      {upgrade && canOpenBilling ? (
        <>
          {" "}
          <Link
            href="/admin/billing"
            className="whitespace-nowrap font-bold text-blue-700 no-underline hover:underline"
          >
            Open Billing
          </Link>
        </>
      ) : null}
    </p>
  );
}

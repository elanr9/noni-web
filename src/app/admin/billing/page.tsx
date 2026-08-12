import { getMemberPermissions, getSessionProfile } from "@/lib/auth";
import { callEdgeFunction } from "@/lib/edge";
import { BillingPanel } from "@/components/admin/BillingPanel";
import type { CompanyBillingStatus } from "./actions";

function Header() {
  return (
    <>
      <h1 className="display text-3xl font-semibold text-ink md:text-4xl">
        Billing
      </h1>
      <p className="mt-1 text-[15px] text-muted">
        Prepaid credits for creator bounties.
      </p>
    </>
  );
}

export default async function BillingPage() {
  const { profile } = await getSessionProfile();
  const permissions = await getMemberPermissions(profile);

  // The edge function rejects every action without manage_billing, so there
  // is nothing to show read-only here.
  if (!permissions.manage_billing) {
    return (
      <div>
        <Header />
        <p className="mt-8 max-w-xl rounded-[24px] border border-line bg-white p-6 text-[15px] text-muted">
          Your account does not have the manage billing permission. Ask the
          person who invited you to grant it.
        </p>
      </div>
    );
  }

  const status = await callEdgeFunction<CompanyBillingStatus>(
    "company-billing",
    { action: "status" },
  );

  return (
    <div>
      <Header />
      {status.error !== null ? (
        <p className="mt-8 max-w-xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load billing: {status.error}
        </p>
      ) : (
        <BillingPanel status={status.data} />
      )}
    </div>
  );
}

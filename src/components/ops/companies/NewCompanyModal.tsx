"use client";

import { CircleCheckBig, Send } from "lucide-react";
import { useState, useTransition } from "react";
import { createCompany } from "@/app/ops/actions";
import type { OpsPlan } from "@/app/ops/companies/[id]/actions";
import { Field, Modal, Pill } from "@/components/kit";

type RunBy = "noni" | "me" | "ask";

const RUN_BY: { value: RunBy; label: string }[] = [
  { value: "noni", label: "Noni team" },
  { value: "me", label: "They do" },
  { value: "ask", label: "Let them pick" },
];

/* A plan set here is active at once (billed by invoice), so the company
   never sees a plan or call step. "Not set yet" leaves it to them. */
const PLANS: Record<"noni" | "me", { value: OpsPlan; label: string }[]> = {
  noni: [
    { value: "none", label: "Not set yet" },
    { value: "managed_monthly", label: "Done for you, monthly" },
    { value: "managed_annual", label: "Done for you, annual" },
  ],
  me: [
    { value: "none", label: "Not set yet (they pick a plan)" },
    { value: "starter_monthly", label: "Starter, monthly" },
    { value: "starter_annual", label: "Starter, annual" },
    { value: "premium_monthly", label: "Premium, monthly" },
    { value: "premium_annual", label: "Premium, annual" },
    { value: "enterprise", label: "Enterprise" },
  ],
};

export function NewCompanyModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [site, setSite] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  /* Outbound: what was agreed on the sales call, so they arrive set up. */
  const [runBy, setRunBy] = useState<RunBy>("noni");
  const [plan, setPlan] = useState<OpsPlan>("none");
  const [sent, setSent] = useState<{ existingCompanies: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const ready = Boolean(name.trim() && adminName.trim() && /.+@.+\..+/.test(email));

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await createCompany({
        name: name.trim(),
        website: site.trim() ? site.trim() : null,
        adminName: adminName.trim(),
        adminEmail: email.trim(),
        runBy: runBy === "ask" ? null : runBy,
        plan: runBy === "ask" ? "none" : plan,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSent({ existingCompanies: result.existingCompanies });
    });
  };

  if (sent) {
    const others = sent.existingCompanies;
    return (
      <Modal title="Invite sent" onClose={onClose}>
        <div className="flex flex-col items-center px-1 pb-1 pt-2.5 text-center">
          <span className="inline-flex h-[54px] w-[54px] items-center justify-center bg-green-soft rounded-pill">
            <CircleCheckBig size={24} className="text-green" />
          </span>
          <div className="mt-3.5 text-[16px] font-bold tracking-[-0.3px] text-ink">
            {name} is on Noni
          </div>
          <p className="mb-[18px] mt-[7px] max-w-[330px] text-[14px] font-semibold leading-[1.55] text-slate-400">
            {others > 0
              ? `We emailed ${email} an invite to be ${name}'s admin. They already work with ${others === 1 ? "another company" : `${others} other companies`} on Noni, so ${name} is added to their account and they can switch to it from the company menu.`
              : `We emailed ${email} an invite to be ${name}'s admin. They'll sign in with Google and land in onboarding.`}
          </p>
          <Pill onClick={onClose} className="w-full">
            Done
          </Pill>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="New company" onClose={onClose}>
      <div className="flex flex-col gap-3.5">
        <Field
          label="Company name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Google"
          autoFocus
        />
        <Field
          label="Website"
          value={site}
          onChange={(e) => setSite(e.target.value)}
          placeholder="google.com"
          optional
        />
        <Field
          label="Company admin"
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          placeholder="John Smith"
        />
        <Field
          label="Admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="johnsmith@google.com"
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-bold text-ink">Who runs it</span>
          <div className="grid grid-cols-3 gap-1 rounded-[12px] bg-[#f1f4f8] p-1">
            {RUN_BY.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  setRunBy(o.value);
                  setPlan("none");
                }}
                className={`cursor-pointer rounded-[9px] border-none px-2 py-2 text-[13px] font-bold transition-colors ${
                  runBy === o.value ? "bg-white text-ink shadow-[0_1px_3px_rgba(15,23,42,0.12)]" : "bg-transparent text-slate-500 hover:text-ink"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        {runBy !== "ask" ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-bold text-ink">Plan</span>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as OpsPlan)}
              className="h-11 cursor-pointer rounded-[12px] border border-line bg-white px-3 text-[14px] font-semibold text-ink outline-none focus:border-blue-500"
            >
              {PLANS[runBy].map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {error ? (
          <p className="m-0 text-[13px] font-semibold text-danger">{error}</p>
        ) : null}
        <Pill icon={Send} onClick={submit} disabled={!ready || pending} className="w-full">
          Send invite
        </Pill>
      </div>
    </Modal>
  );
}

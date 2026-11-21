"use client";

import { CircleAlert, DollarSign, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  removeCompany,
  sendBudgetInvoice,
  setCompanyPlan,
  setCreatorBudget,
  type OpsPlan,
} from "@/app/ops/companies/[id]/actions";
import { Card, Label, Modal, Pill } from "@/components/kit";
import { money } from "@/lib/ops/mock-data";
import type { Company, CompanyBilling as Billing } from "@/lib/ops/types";

const PLAN_OPTIONS: [OpsPlan, string][] = [
  ["none", "No plan"],
  ["starter_monthly", "Starter, monthly"],
  ["starter_annual", "Starter, annual"],
  ["premium_monthly", "Premium, monthly"],
  ["premium_annual", "Premium, annual"],
  ["managed_monthly", "Done for you, monthly"],
  ["managed_annual", "Done for you, annual"],
  ["enterprise", "Enterprise"],
];

function RemoveCompanyModal({
  company,
  onClose,
  onConfirm,
  busy,
  error,
}: {
  company: Company;
  onClose: () => void;
  onConfirm: () => void;
  busy: boolean;
  error: string | null;
}) {
  const [text, setText] = useState("");
  const ready = !busy && text.trim().toLowerCase() === "remove this company";

  return (
    <Modal title={`Remove ${company.name}`} onClose={onClose}>
      <div className="flex flex-col gap-3.5">
        <p className="m-0 text-[14px] font-semibold leading-[1.55] text-slate-500">
          This permanently removes {company.name}. Its admin, campaign managers
          and creators lose access. There&apos;s no undo.
        </p>
        <label className="flex flex-col gap-[7px]">
          <span className="text-[13px] font-semibold text-slate-500">
            To confirm, type <b className="text-ink">remove this company</b>
          </span>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
            className="box-border w-full border border-line bg-white px-3.5 py-3 text-[14.5px] font-semibold text-ink outline-none rounded-ops-sm"
          />
        </label>
        {error ? (
          <p role="alert" className="m-0 text-[13px] font-semibold text-danger">
            {error}
          </p>
        ) : null}
        <div className="flex gap-2.5">
          <Pill variant="quiet" onClick={onClose} className="flex-1">
            Cancel
          </Pill>
          <Pill
            variant="danger"
            icon={Trash2}
            disabled={!ready}
            onClick={onConfirm}
            className="flex-1"
          >
            {busy ? "Removing…" : "Remove company"}
          </Pill>
        </div>
      </div>
    </Modal>
  );
}

export function CompanyBilling({
  company,
  billing,
}: {
  company: Company;
  billing: Billing | null;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [budget, setBudget] = useState(billing ? String(billing.monthly || "") : "");
  const [invoice, setInvoice] = useState(billing ? String(billing.monthly || "") : "");
  const [plan, setPlan] = useState<OpsPlan>(
    billing?.plan && PLAN_OPTIONS.some(([v]) => v === billing.plan)
      ? (billing.plan as OpsPlan)
      : billing?.plan
        ? "premium_monthly"
        : "none",
  );
  const [planFee, setPlanFee] = useState("");
  const [busy, setBusy] = useState<"budget" | "invoice" | "plan" | "planInvoice" | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const b: Billing | null = billing;
  if (!b) return null;

  const remaining = b.monthly - b.spent;
  const pct = b.monthly > 0 ? b.spent / b.monthly : 0;
  const low = b.monthly > 0 && remaining / b.monthly < 0.2;
  const barClass = pct > 0.85 ? "bg-danger" : pct > 0.6 ? "bg-amber" : "bg-blue-500";

  const dollars = (v: string) => Number(v.replace(/[$,\s]/g, ""));

  const saveBudget = async () => {
    setBusy("budget");
    setNote(null);
    const result = await setCreatorBudget({ companyId: company.id, dollars: dollars(budget) });
    setBusy(null);
    if (!result.ok) return setNote({ ok: false, text: result.error });
    setNote({ ok: true, text: "Budget saved." });
    router.refresh();
  };

  const sendInvoice = async () => {
    setBusy("invoice");
    setNote(null);
    const result = await sendBudgetInvoice({ companyId: company.id, dollars: dollars(invoice) });
    setBusy(null);
    if (!result.ok) return setNote({ ok: false, text: result.error });
    setNote({
      ok: true,
      text: `Invoice for ${money(dollars(invoice))} sent${result.email ? ` to ${result.email}` : ""}. The balance goes up when it is paid.`,
    });
  };

  const savePlan = async () => {
    setBusy("plan");
    setNote(null);
    const result = await setCompanyPlan({ companyId: company.id, plan });
    setBusy(null);
    if (!result.ok) return setNote({ ok: false, text: result.error });
    setNote({ ok: true, text: plan === "none" ? "Plan removed." : "Plan saved." });
    router.refresh();
  };

  const sendPlanInvoice = async () => {
    setBusy("planInvoice");
    setNote(null);
    const result = await sendBudgetInvoice({
      companyId: company.id,
      dollars: dollars(planFee),
      kind: "plan",
    });
    setBusy(null);
    if (!result.ok) return setNote({ ok: false, text: result.error });
    setNote({
      ok: true,
      text: `Plan invoice for ${money(dollars(planFee))} sent${result.email ? ` to ${result.email}` : ""}.`,
    });
  };

  const field =
    "box-border w-[130px] border border-line bg-white px-3.5 py-2.5 text-[14.5px] font-semibold text-ink outline-none rounded-ops-sm";

  const confirmRemove = async () => {
    setRemoving(true);
    setRemoveError(null);
    try {
      const result = await removeCompany({ companyId: company.id });
      if (!result.ok) {
        setRemoveError(result.error);
        return;
      }
      router.push("/ops/companies");
      router.refresh();
    } catch {
      setRemoveError("The company could not be removed. Try again.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3.5">
      {low ? (
        <Card
          pad={16}
          className="flex items-center gap-[13px]"
          style={{ background: "var(--color-amber-soft)", borderColor: "transparent" }}
        >
          <CircleAlert size={19} className="shrink-0 text-amber" />
          <span className="flex-1 text-[13.5px] font-semibold text-ink">
            Running low. {money(remaining)} left of this month&apos;s budget.
          </span>
        </Card>
      ) : null}
      <Card pad={22}>
        <div className="mb-[18px] flex gap-[18px]">
          {(
            [
              ["Monthly budget", money(b.monthly)],
              ["Spent so far", money(b.spent)],
              ["Remaining", money(remaining)],
            ] as const
          ).map(([l, v]) => (
            <span key={l} className="flex-1">
              <span className="block text-[12px] font-semibold text-slate-400">{l}</span>
              <span
                className={`mt-[5px] block text-[26px] font-bold tracking-[-0.5px] ${
                  l === "Remaining" && low ? "text-danger" : "text-ink"
                }`}
              >
                {v}
              </span>
            </span>
          ))}
        </div>
        <div className="h-2.5 overflow-hidden bg-fill-quiet rounded-pill">
          <span
            className={`block h-full transition-[width] duration-[400ms] ease-om rounded-pill ${barClass}`}
            style={{ width: Math.round(pct * 100) + "%" }}
          />
        </div>
        <div className="mt-2 text-[12.5px] font-semibold text-slate-400">
          {Math.round(pct * 100)}% of August budget used · pays creators
        </div>
      </Card>
      <Card pad={22}>
        <Label className="mb-1 block">Plan</Label>
        <p className="m-0 text-[13px] font-semibold leading-[1.5] text-slate-400">
          {b.stripePlan
            ? `${company.name} pays for its plan by card through Stripe, so it cannot be changed here.`
            : `Put ${company.name} on a plan after a call and bill it by invoice. Starter and Premium can also be bought by card in their Billing.`}
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-4">
          <label className="flex flex-col gap-[7px]">
            <span className="text-[12px] font-semibold text-slate-400">Plan</span>
            <span className="flex items-center gap-2">
              <select
                className={`${field} w-[230px]`}
                value={plan}
                disabled={b.stripePlan}
                onChange={(e) => setPlan(e.target.value as OpsPlan)}
              >
                {PLAN_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <Pill
                size="sm"
                variant="quiet"
                disabled={busy !== null || b.stripePlan}
                onClick={() => void savePlan()}
              >
                {busy === "plan" ? "Saving…" : "Save"}
              </Pill>
            </span>
          </label>
          <label className="flex flex-col gap-[7px]">
            <span className="text-[12px] font-semibold text-slate-400">Plan invoice ($)</span>
            <span className="flex items-center gap-2">
              <input
                className={field}
                inputMode="numeric"
                placeholder="0"
                value={planFee}
                onChange={(e) => setPlanFee(e.target.value)}
              />
              <Pill
                size="sm"
                icon={Send}
                disabled={busy !== null}
                onClick={() => void sendPlanInvoice()}
              >
                {busy === "planInvoice" ? "Sending…" : "Send invoice"}
              </Pill>
            </span>
          </label>
        </div>
      </Card>
      <Card pad={22}>
        <Label className="mb-1 block">Creator budget</Label>
        <p className="m-0 text-[13px] font-semibold leading-[1.5] text-slate-400">
          Agreed with {company.name} on a call. They see it in Billing but
          cannot change it. Invoices are emailed by Stripe and add to the
          balance once paid.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-4">
          <label className="flex flex-col gap-[7px]">
            <span className="text-[12px] font-semibold text-slate-400">Monthly budget ($)</span>
            <span className="flex items-center gap-2">
              <input
                className={field}
                inputMode="numeric"
                placeholder="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
              <Pill size="sm" variant="quiet" disabled={busy !== null} onClick={() => void saveBudget()}>
                {busy === "budget" ? "Saving…" : "Save"}
              </Pill>
            </span>
          </label>
          <label className="flex flex-col gap-[7px]">
            <span className="text-[12px] font-semibold text-slate-400">Invoice amount ($)</span>
            <span className="flex items-center gap-2">
              <input
                className={field}
                inputMode="numeric"
                placeholder="0"
                value={invoice}
                onChange={(e) => setInvoice(e.target.value)}
              />
              <Pill size="sm" icon={Send} disabled={busy !== null} onClick={() => void sendInvoice()}>
                {busy === "invoice" ? "Sending…" : "Send invoice"}
              </Pill>
            </span>
          </label>
        </div>
        {note ? (
          <p
            role={note.ok ? "status" : "alert"}
            className={`mb-0 mt-3 text-[13px] font-semibold ${note.ok ? "text-green" : "text-danger"}`}
          >
            {note.text}
          </p>
        ) : null}
      </Card>
      <Card pad={0}>
        <Label className="block px-5 pb-1.5 pt-4">Paid invoices</Label>
        {b.topups.length === 0 ? (
          <p className="m-0 border-t border-line px-5 py-[13px] text-[13px] font-semibold text-slate-400">
            Nothing paid yet. Paid budget invoices show up here.
          </p>
        ) : null}
        {b.topups.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-t border-line px-5 py-3"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center bg-green-soft rounded-pill">
              <DollarSign size={14} className="text-green" />
            </span>
            <span className="flex-1 text-[13.5px] font-bold text-ink">
              Creator budget
            </span>
            <span className="text-[13px] font-semibold text-slate-400">{t.date}</span>
            <span className="w-[70px] text-right text-[14px] font-bold text-ink">
              {money(t.amt)}
            </span>
          </div>
        ))}
      </Card>
      <Card className="flex items-center gap-3.5">
        <span className="flex-1 text-[13.5px] font-semibold leading-normal text-slate-400">
          Removing {company.name} revokes its admin, managers and creators.
          There&apos;s no undo.
        </span>
        <Pill size="sm" variant="danger" icon={Trash2} onClick={() => setConfirming(true)}>
          Remove company
        </Pill>
      </Card>
      {confirming ? (
        <RemoveCompanyModal
          company={company}
          onClose={() => {
            if (removing) return;
            setConfirming(false);
            setRemoveError(null);
          }}
          onConfirm={() => void confirmRemove()}
          busy={removing}
          error={removeError}
        />
      ) : null}
    </div>
  );
}

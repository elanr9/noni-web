"use client";

import { CircleAlert, DollarSign, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { pingTopUp, removeCompany } from "@/app/ops/companies/[id]/actions";
import { Card, Label, Modal, Pill } from "@/components/kit";
import { money } from "@/lib/ops/mock-data";
import type { Company, CompanyBilling as Billing } from "@/lib/ops/types";

function RemoveCompanyModal({
  company,
  onClose,
  onConfirm,
}: {
  company: Company;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [text, setText] = useState("");
  const ready = text.trim().toLowerCase() === "remove this company";

  return (
    <Modal title={`Remove ${company.name}`} onClose={onClose}>
      <div className="flex flex-col gap-3.5">
        <p className="m-0 text-[14px] font-semibold leading-[1.55] text-slate-500">
          This permanently removes {company.name} — its admin, campaign managers
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
            Remove company
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
  const [pinged, setPinged] = useState(false);

  const b: Billing | null = billing;
  if (!b) return null;

  const remaining = b.monthly - b.spent;
  const pct = b.monthly > 0 ? b.spent / b.monthly : 0;
  const low = b.monthly > 0 && remaining / b.monthly < 0.2;
  const barClass = pct > 0.85 ? "bg-danger" : pct > 0.6 ? "bg-amber" : "bg-blue-500";

  const ping = () => {
    setPinged(true);
    void pingTopUp({ companyId: company.id, adminFirstName: b.pingTo });
  };

  const confirmRemove = () => {
    setConfirming(false);
    void removeCompany({ companyId: company.id });
    router.push("/ops/companies");
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
            Running low — {money(remaining)} left of this month&apos;s budget.
          </span>
          <Pill size="sm" onClick={ping}>
            {pinged ? `Pinged ${b.pingTo} ✓` : `Ping ${b.pingTo} to top up`}
          </Pill>
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
          {Math.round(pct * 100)}% of August budget used · pays creator bounties
        </div>
      </Card>
      <Card pad={0}>
        <Label className="block px-5 pb-1.5 pt-4">Top-ups</Label>
        {b.topups.length === 0 ? (
          <p className="m-0 border-t border-line px-5 py-[13px] text-[13px] font-semibold text-slate-400">
            No top-ups yet. Prepaid credits show up here.
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
              Prepaid credits
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
          onClose={() => setConfirming(false)}
          onConfirm={confirmRemove}
        />
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";

import { Field, Modal, Pill } from "@/components/kit";

export function money(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

const QUICK_PICKS = [500, 1000, 2500];

/* Shared dollar-amount picker: the Set limit and Top up modals are the same
   $500/$1k/$2.5k quick picks plus a custom field (AdminSetupTabs.jsx,
   AdjustLimitModal and TopupModal). */
export function AmountModal({
  title,
  description,
  customLabel,
  ctaLabel,
  busyLabel,
  initial = 1000,
  onSubmit,
  onClose,
}: {
  title: string;
  description: string;
  customLabel: string;
  ctaLabel: (value: number) => string;
  busyLabel: string;
  initial?: number;
  /** Resolves true on success, which closes the modal. */
  onSubmit: (value: number) => Promise<boolean>;
  onClose: () => void;
}) {
  const [amt, setAmt] = useState(initial);
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const value = custom ? parseInt(custom.replace(/[^0-9]/g, ""), 10) || 0 : amt;

  const submit = async () => {
    if (value <= 0 || busy) return;
    setBusy(true);
    const done = await onSubmit(value);
    if (done) onClose();
    else setBusy(false);
  };

  return (
    <Modal title={title} onClose={onClose}>
      <p className="mb-3.5 mt-0 text-[13px] font-semibold leading-[1.5] text-slate-400">
        {description}
      </p>
      <div className="flex gap-2">
        {QUICK_PICKS.map((v) => {
          const selected = !custom && amt === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => {
                setAmt(v);
                setCustom("");
              }}
              className={`flex-1 cursor-pointer rounded-[12px] border py-3 text-[14.5px] font-bold ${
                selected
                  ? "border-transparent bg-blue-100 text-blue-700"
                  : "border-line bg-white text-ink"
              }`}
            >
              {money(v)}
            </button>
          );
        })}
      </div>
      <div className="mt-3">
        <Field
          label={customLabel}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="$750"
        />
      </div>
      <Pill
        onClick={submit}
        disabled={value <= 0 || busy}
        className="mt-4 w-full"
      >
        {busy ? busyLabel : ctaLabel(value)}
      </Pill>
    </Modal>
  );
}

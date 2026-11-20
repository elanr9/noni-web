"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Card, Field, Label, Pill } from "@/components/kit";
import { estimateCampaignCost, formatCents, PAY_RULES_LINE } from "@/lib/creator-pay";

type Key = "creators" | "videos" | "statics" | "weeks" | "views";

const INPUTS: { key: Key; label: string; initial: string }[] = [
  { key: "creators", label: "Creators", initial: "10" },
  { key: "videos", label: "Videos per creator per week", initial: "3" },
  { key: "statics", label: "Slideshows per creator per week", initial: "2" },
  { key: "weeks", label: "Weeks", initial: "4" },
  { key: "views", label: "Avg views per post", initial: "5,000" },
];

function num(text: string): number {
  return Number.parseInt(text.replace(/[^\d]/g, ""), 10) || 0;
}

/* Billing > Budget: a rough "how much to add" for a campaign plan, from the
   creator pay rules in lib/creator-pay. The top-up button hands the estimate
   to the existing top-up modal. */
export function EstimateCard({
  onTopUp,
}: {
  /** Opens the top-up modal prefilled with this many whole dollars. */
  onTopUp: (dollars: number) => void;
}) {
  const [values, setValues] = useState<Record<Key, string>>(
    () => Object.fromEntries(INPUTS.map((i) => [i.key, i.initial])) as Record<Key, string>,
  );

  const e = estimateCampaignCost({
    creators: num(values.creators),
    videosPerCreator: num(values.videos),
    staticsPerCreator: num(values.statics),
    weeks: num(values.weeks),
    avgViewsPerPost: num(values.views),
  });
  const topUpDollars = Math.ceil(e.companyEstimateCents / 100);

  const rows: { label: string; sub: string; cents: number; strong?: boolean }[] = [
    {
      label: "Guaranteed minimum",
      sub: `Base pay for ${e.postsTotal.toLocaleString("en-US")} posts plus fee`,
      cents: e.companyMinCents,
    },
    {
      label: "Estimate",
      sub: "Base pay plus view pay at your average views, plus fee",
      cents: e.companyEstimateCents,
      strong: true,
    },
    {
      label: "Worst case",
      sub: "Every post hits the $500 view cap",
      cents: e.companyMaxCents,
    },
  ];

  return (
    <Card pad={0}>
      <div className="px-[22px] pb-4 pt-[18px]">
        <Label className="mb-1.5 block">How much to add</Label>
        <p className="m-0 text-[12.5px] font-semibold leading-[1.5] text-slate-400">
          {PAY_RULES_LINE}
        </p>
        <div className="mt-3.5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {INPUTS.map((i) => (
            <Field
              key={i.key}
              label={i.label}
              value={values[i.key]}
              onChange={(ev) => {
                const digits = ev.target.value.replace(/[^\d]/g, "").slice(0, 9);
                setValues((v) => ({
                  ...v,
                  [i.key]: digits ? Number(digits).toLocaleString("en-US") : "",
                }));
              }}
            />
          ))}
        </div>
      </div>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3 border-t border-line px-[22px] py-3">
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-bold text-ink">{r.label}</span>
            <span className="mt-px block text-[12.5px] font-semibold text-slate-400">{r.sub}</span>
          </span>
          <span
            className={`whitespace-nowrap font-bold text-ink ${
              r.strong ? "display text-[20px] tracking-[-0.4px]" : "text-[15px]"
            }`}
          >
            {formatCents(r.cents)}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-3 border-t border-line px-[22px] py-3.5">
        <span className="min-w-0 flex-1 text-[12.5px] font-semibold text-slate-400">
          Credits are only used as creators earn them; anything unused stays in
          your balance.
        </span>
        <Pill
          size="sm"
          icon={Plus}
          disabled={topUpDollars <= 0}
          onClick={() => onTopUp(topUpDollars)}
        >
          Top up {formatCents(topUpDollars * 100)}
        </Pill>
      </div>
    </Card>
  );
}

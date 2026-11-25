/* The campaign card creators see, made from the campaign itself: a flat
   cover in the company's colour with its logo or name, the pay on top, then
   the title, one line and the job in chips. The manager's editor shows the
   same card as a live preview. */
import type { ReactNode } from "react";

import { cardColor, inkOn, payHeadline, paySub, postsPerDayLabel, type CampaignTerms } from "@/lib/campaign-terms";

export type CardCampaign = CampaignTerms & {
  company_name: string;
  title: string;
  tagline: string | null;
  logo_url: string | null;
};

export function CampaignCover({ c, className = "", children }: { c: CardCampaign; className?: string; children?: ReactNode }) {
  const bg = cardColor(c.brand_color, c.company_name);
  const ink = inkOn(bg);
  const name = c.company_name.trim() || c.title;
  /* Long names step down so the wordmark always fits on two lines. */
  const size = name.length <= 8 ? 40 : name.length <= 14 ? 32 : name.length <= 22 ? 25 : 20;
  return (
    <div className={`relative flex aspect-[2/1] w-full items-end overflow-hidden p-4 ${className}`} style={{ background: bg, color: ink }}>
      {c.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={c.logo_url} alt="" className="absolute left-4 top-4 h-11 w-11 rounded-[12px] bg-white object-contain p-1" />
      ) : null}
      <span className="line-clamp-2 max-w-full break-words font-extrabold leading-[1.02] tracking-[-0.03em]" style={{ fontSize: size }}>
        {name}
      </span>
      <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
        <span className="rounded-full bg-white px-3 py-1.5 text-[15px] font-extrabold leading-none text-ink">{payHeadline(c)}</span>
        <span className="rounded-full bg-white px-2.5 py-1 text-[12px] font-bold leading-none text-slate-600">{paySub(c)}</span>
      </div>
      {children}
    </div>
  );
}

export function CampaignCard({
  c,
  chips = [],
  onOpen,
  className = "",
}: {
  c: CardCampaign;
  /** Extra chips after posts a day: spots left, niches. */
  chips?: { label: string; on?: boolean }[];
  onOpen?: () => void;
  className?: string;
}) {
  const body = (
    <>
      <CampaignCover c={c} />
      <div className="flex min-h-0 flex-1 flex-col gap-2 p-4">
        <p className="m-0 line-clamp-1 text-[17px] font-extrabold tracking-[-0.2px] text-ink">{c.title}</p>
        {c.tagline ? <p className="m-0 line-clamp-1 text-[13.5px] font-medium leading-[1.4] text-slate-500">{c.tagline}</p> : null}
        <div className="mt-auto flex h-[28px] flex-wrap gap-1.5 overflow-hidden pt-0.5">
          <span className="rounded-full bg-ink px-2.5 py-1 text-[12px] font-bold text-white">{postsPerDayLabel(c)}</span>
          {chips.map((ch) => (
            <span key={ch.label} className={`rounded-full px-2.5 py-1 text-[12px] font-bold ${ch.on ? "bg-blue-100 text-blue-700" : "bg-fill-quiet text-slate-500"}`}>
              {ch.label}
            </span>
          ))}
        </div>
      </div>
    </>
  );
  const shell = `flex h-full w-full flex-col overflow-hidden rounded-[20px] border border-line bg-white text-left ${className}`;
  return onOpen ? (
    <button
      type="button"
      onClick={onOpen}
      className={`${shell} cursor-pointer p-0 transition-all duration-[160ms] ease-om hover:-translate-y-1 hover:border-slate-300 active:scale-[0.98]`}
    >
      {body}
    </button>
  ) : (
    <div className={shell}>{body}</div>
  );
}

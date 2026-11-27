/* The campaign card creators see: the company's logo, its name, a link to
   its website, what it is in one line and the pay. The manager's Market
   tab and editor show the same card. */
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

import { cardColor, inkOn, payHeadline, paySub, type CampaignTerms } from "@/lib/campaign-terms";

export type CardCampaign = CampaignTerms & {
  company_name: string;
  title: string;
  tagline: string | null;
  logo_url: string | null;
  website?: string | null;
};

/** "https://www.inkbound.ai/" reads as "inkbound.ai". */
function siteOf(url: string | null | undefined): { href: string; label: string } | null {
  const raw = url?.trim();
  if (!raw) return null;
  const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const label = href.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/[/?#].*$/, "");
  return label ? { href, label } : null;
}

export function CompanyLogo({ c, size = 52 }: { c: CardCampaign; size?: number }) {
  const name = c.company_name.trim() || c.title;
  if (c.logo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={c.logo_url}
        alt=""
        className="shrink-0 border border-line bg-white object-contain"
        style={{ width: size, height: size, borderRadius: size * 0.28, padding: size * 0.08 }}
      />
    );
  }
  const bg = cardColor(c.brand_color, name);
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center font-extrabold"
      style={{ width: size, height: size, borderRadius: size * 0.28, background: bg, color: inkOn(bg), fontSize: size * 0.44 }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function Pay({ c }: { c: CardCampaign }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="rounded-full bg-blue-100 px-3 py-1.5 text-[14px] font-extrabold leading-none text-blue-700">{payHeadline(c)}</span>
      <span className="rounded-full bg-fill-quiet px-2.5 py-1.5 text-[12.5px] font-bold leading-none text-slate-600">{paySub(c)}</span>
    </div>
  );
}

function Site({ c }: { c: CardCampaign }) {
  const site = siteOf(c.website);
  if (!site) return null;
  return (
    <a
      href={site.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex max-w-full items-center gap-0.5 text-[13px] font-bold text-slate-400 no-underline transition-colors duration-[160ms] ease-om hover:text-blue-700"
    >
      <span className="truncate">{site.label}</span>
      <ArrowUpRight size={14} className="shrink-0" />
    </a>
  );
}

/** The same facts laid flat, for the top of a campaign's detail panel. */
export function CampaignCover({ c, className = "", children }: { c: CardCampaign; className?: string; children?: ReactNode }) {
  return (
    <div className={`relative flex w-full items-center gap-3.5 border border-line bg-white p-4 ${className}`}>
      <CompanyLogo c={c} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[17px] font-extrabold tracking-[-0.2px] text-ink">{c.company_name.trim() || c.title}</span>
        <Site c={c} />
      </div>
      <Pay c={c} />
      {children}
    </div>
  );
}

export function CampaignCard({ c, onOpen, className = "" }: { c: CardCampaign; onOpen?: () => void; className?: string }) {
  return (
    <div
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={
        onOpen
          ? (e) => {
              if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onOpen();
              }
            }
          : undefined
      }
      className={`flex h-full w-full flex-col rounded-[20px] border border-line bg-white p-5 text-left shadow-card ${
        onOpen ? "cursor-pointer transition-all duration-[160ms] ease-om hover:-translate-y-1 hover:border-blue-300 hover:shadow-raised active:scale-[0.98]" : ""
      } ${className}`}
    >
      <div className="flex items-center gap-3">
        <CompanyLogo c={c} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="m-0 line-clamp-1 text-[17px] font-extrabold tracking-[-0.2px] text-ink">{c.company_name.trim() || c.title}</p>
          <Site c={c} />
        </div>
      </div>
      <p className="m-0 mt-3.5 line-clamp-2 min-h-[40px] text-[14px] font-medium leading-[1.4] text-slate-600">{c.tagline}</p>
      <div className="mt-auto pt-4">
        <Pay c={c} />
      </div>
    </div>
  );
}

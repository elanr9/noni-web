"use client";

/* Shown when the active company does not grant this dashboard but another
   membership might. Lists the companies that would, and switches with
   set_active_company() (never a direct profiles write). */

import Link from "next/link";
import { useMemo, useState } from "react";

import { companyLogoUrl } from "@/lib/company-logo";
import type { CompanySummary, Role } from "@/lib/company-summary";
import { createClient } from "@/lib/supabase/client";

const ROLE_LABEL: Partial<Record<Role, string>> = {
  company_admin: "Company admin",
  campaign_manager: "Campaign manager",
};

function CompanyLogo({
  name,
  logoPath,
}: {
  name: string;
  logoPath: string | null;
}) {
  const url = companyLogoUrl(logoPath);
  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-line bg-white text-[14px] font-extrabold text-blue-700">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-contain" />
      ) : (
        name.trim().charAt(0).toUpperCase()
      )}
    </span>
  );
}

export function SwitchCompanyGate({
  title,
  body,
  companies,
  wanted,
}: {
  title: string;
  body: string;
  companies: CompanySummary[];
  wanted: Role[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [switching, setSwitching] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const options = companies.filter((c) => wanted.includes(c.role));

  const pick = async (company: CompanySummary) => {
    if (switching) return;
    setSwitching(company.company_id);
    setError(null);
    const { error: rpcError } = await supabase.rpc("set_active_company", {
      p_company_id: company.company_id,
    });
    if (rpcError) {
      setSwitching(null);
      setError(
        rpcError.code === "42501"
          ? "You are not a member of that company anymore."
          : rpcError.message,
      );
      return;
    }
    /* Full reload so the server layouts re-read the new active company. */
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/dash");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-soft px-5">
      <div className="w-full max-w-md rounded-[28px] border border-line bg-white p-8 text-center shadow-sm">
        <h1 className="display text-3xl font-semibold text-ink">{title}</h1>
        <p className="mt-3 text-[15px] text-muted">{body}</p>
        {options.length === 0 ? (
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-bold text-white"
          >
            Back home
          </Link>
        ) : (
          <>
            <div className="mt-6 flex flex-col gap-2 text-left">
              {options.map((c) => {
                const busy = switching === c.company_id;
                return (
                  <button
                    key={c.company_id}
                    type="button"
                    disabled={switching !== null}
                    onClick={() => void pick(c)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 transition-colors hover:bg-soft disabled:cursor-default disabled:opacity-70"
                  >
                    <CompanyLogo name={c.name} logoPath={c.logo_path} />
                    <span className="min-w-0 flex-1">
                      <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-bold text-ink">
                        {c.name}
                      </span>
                      <span className="block text-[12px] font-semibold text-slate-400">
                        {busy ? "Switching…" : ROLE_LABEL[c.role] ?? c.role}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            {error ? (
              <p className="mt-3 text-[13px] font-semibold text-danger">{error}</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

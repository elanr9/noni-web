import type { SignedAgreement } from "@/lib/agreements";

import { AgreementText } from "./AgreementText";
import { PrintButton } from "./PrintButton";

function stamp(iso: string): string {
  return `${new Date(iso).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "UTC",
  })} UTC`;
}

/* The agreement as written for one creator, with the signature and its
   record under it once signed. Prints to a PDF. */
export function AgreementDoc({ a }: { a: SignedAgreement }) {
  const record: [string, string][] = [
    ["Creator", a.signedName],
    ["Signed", a.signedAt ? stamp(a.signedAt) : "Not signed yet"],
    ...(a.signedIp ? ([["IP address", a.signedIp]] as [string, string][]) : []),
    ...(a.signedAgent ? ([["Device", a.signedAgent]] as [string, string][]) : []),
    ["Company", a.companyName],
    ...(a.acceptedAt
      ? ([["Accepted", `${stamp(a.acceptedAt)}${a.acceptedBy ? ` by ${a.acceptedBy}` : ""}`]] as [string, string][])
      : []),
    ...(a.version ? ([["Version", String(a.version)]] as [string, string][]) : []),
    ...(a.sha256 ? ([["SHA-256", a.sha256]] as [string, string][]) : []),
    ["Record", a.id],
  ];

  return (
    <main className="min-h-screen bg-soft px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-[720px]">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <span className="text-[13px] font-bold text-slate-400">Noni</span>
          <PrintButton />
        </div>
        <article className="rounded-[20px] border border-line bg-white p-8 print:rounded-none print:border-0 print:p-0">
          <h1 className="m-0 text-[24px] font-bold tracking-[-0.4px] text-ink">{a.title}</h1>
          <AgreementText body={a.body} className="mt-6 text-[14px] leading-[1.65] text-ink" />
          <div className="mt-8 border-t border-line pt-6">
            {a.signature ? (
              <svg viewBox="0 0 320 120" role="img" aria-label={`Signature of ${a.signedName}`} className="block h-[90px] w-[240px] text-ink">
                <path d={a.signature} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : a.signedAt ? (
              <p className="m-0 text-[28px] italic leading-none text-ink" style={{ fontFamily: "ui-serif, Georgia, serif" }}>
                {a.signedName}
              </p>
            ) : (
              <span className="inline-flex rounded-full bg-amber-soft px-3 py-1 text-[12.5px] font-bold text-amber">Waiting on signature</span>
            )}
            <dl className="mb-0 mt-5 grid grid-cols-[110px_minmax(0,1fr)] gap-x-4 gap-y-2 text-[12.5px]">
              {record.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="font-bold text-slate-400">{k}</dt>
                  <dd className="m-0 break-all font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </article>
      </div>
    </main>
  );
}

"use client";

import { Banknote, FlaskConical, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  getTestModeState,
  grantTestCredits,
  payOutNow,
  setTestMode,
  simulateViews,
  type TestActionResult,
  type TestModeState,
} from "@/app/ops/companies/[id]/test-actions";
import { Card, Chip, Label, Pill } from "@/components/kit";
import type { Company } from "@/lib/ops/types";

const usd = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;

const input =
  "box-border w-full border border-line bg-white px-3 py-2 text-[14px] font-semibold text-ink outline-none rounded-ops-sm";

export function CompanyTestMode({ company }: { company: Company }) {
  const [state, setState] = useState<TestModeState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [credit, setCredit] = useState("500");
  const [views, setViews] = useState<Record<string, string>>({});

  const apply = useCallback((s: Awaited<ReturnType<typeof getTestModeState>>) => {
    if ("error" in s) setLoadError(s.error);
    else {
      setLoadError(null);
      setState(s);
    }
  }, []);

  const load = useCallback(async () => apply(await getTestModeState(company.id)), [apply, company.id]);

  useEffect(() => {
    let live = true;
    getTestModeState(company.id).then((s) => {
      if (live) apply(s);
    });
    return () => {
      live = false;
    };
  }, [apply, company.id]);

  const run = async (key: string, fn: () => Promise<TestActionResult>) => {
    setBusy(key);
    setNote(null);
    try {
      const r = await fn();
      setNote(r.ok ? (r.message ? { ok: true, text: r.message } : null) : { ok: false, text: r.error });
      await load();
    } catch {
      setNote({ ok: false, text: "That did not go through. Try again." });
    } finally {
      setBusy(null);
    }
  };

  if (loadError) {
    return (
      <Card pad={22}>
        <p className="m-0 text-[13.5px] font-semibold text-danger">{loadError}</p>
      </Card>
    );
  }
  if (!state) {
    return (
      <Card pad={22}>
        <p className="m-0 text-[13.5px] font-semibold text-slate-400">Loading…</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      <Card pad={22} className="flex items-start gap-3.5">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center bg-amber-soft rounded-pill">
          <FlaskConical size={17} className="text-amber" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-[15px] font-bold text-ink">
            Payout test mode <Chip tone={state.on ? "amber" : "slate"}>{state.on ? "On" : "Off"}</Chip>
          </span>
          <span className="mt-1 block text-[13px] font-semibold leading-[1.55] text-slate-500">
            For trying {company.name} end to end before the bank is live. Creators set up payouts in one
            tap with no bank, payouts are marked paid without sending money, the company&apos;s billing page
            adds credits without a card, and you can set a live post&apos;s views below. Real posts still
            publish to the creator&apos;s real accounts.
          </span>
        </span>
        <Pill
          size="sm"
          variant={state.on ? "quiet" : "primary"}
          disabled={busy !== null}
          onClick={() => void run("mode", () => setTestMode({ companyId: company.id, on: !state.on }))}
        >
          {busy === "mode" ? "Saving…" : state.on ? "Turn off" : "Turn on"}
        </Pill>
      </Card>

      {note ? (
        <Card pad={14} style={{ background: note.ok ? "var(--color-green-soft)" : "var(--color-amber-soft)", borderColor: "transparent" }}>
          <p role="status" className="m-0 text-[13.5px] font-semibold text-ink">{note.text}</p>
        </Card>
      ) : null}

      {state.on ? (
        <>
          <Card pad={22} className="flex flex-wrap items-end gap-3.5">
            <span className="min-w-[140px] flex-1">
              <span className="block text-[12px] font-semibold text-slate-400">Credits</span>
              <span className="mt-1 block text-[26px] font-bold tracking-[-0.5px] text-ink">{usd(state.creditCents)}</span>
            </span>
            <label className="flex w-[120px] flex-col gap-1">
              <span className="text-[12px] font-semibold text-slate-400">Add ($)</span>
              <input className={input} inputMode="decimal" value={credit} onChange={(e) => setCredit(e.target.value)} />
            </label>
            <Pill
              size="sm"
              icon={Plus}
              disabled={busy !== null}
              onClick={() => void run("credit", () => grantTestCredits({ companyId: company.id, dollars: Number(credit) }))}
            >
              {busy === "credit" ? "Adding…" : "Add test credits"}
            </Pill>
          </Card>

          <Card pad={0}>
            <div className="flex items-center gap-3 px-5 pb-2 pt-4">
              <Label className="flex-1">Creators</Label>
              <Pill
                size="sm"
                icon={Banknote}
                disabled={busy !== null}
                onClick={() => void run("payout", () => payOutNow({ companyId: company.id }))}
              >
                {busy === "payout" ? "Paying…" : "Pay out now"}
              </Pill>
            </div>
            {state.creators.length === 0 ? (
              <p className="m-0 border-t border-line px-5 py-[13px] text-[13px] font-semibold text-slate-400">
                No creators yet.
              </p>
            ) : null}
            {state.creators.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-3">
                <span className="min-w-0 flex-1 text-[13.5px] font-bold text-ink">{c.name}</span>
                <Chip tone={c.payoutReady ? "green" : "slate"}>{c.payoutReady ? "Payouts set up" : "Not set up"}</Chip>
                <span className="text-[13px] font-semibold text-slate-500">Balance {usd(c.availableCents)}</span>
                <span className="text-[13px] font-semibold text-slate-500">Paid out {usd(c.paidOutCents)}</span>
              </div>
            ))}
            <p className="m-0 border-t border-line px-5 py-3 text-[12.5px] font-semibold text-slate-400">
              Pays every creator with payouts set up their whole balance, the same as the Sunday 8 PM run.
            </p>
          </Card>

          <Card pad={0}>
            <Label className="block px-5 pb-1.5 pt-4">Live posts</Label>
            {state.posts.length === 0 ? (
              <p className="m-0 border-t border-line px-5 py-[13px] text-[13px] font-semibold text-slate-400">
                No live posts yet.
              </p>
            ) : null}
            {state.posts.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-3">
                <span className="min-w-[180px] flex-1">
                  <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] font-bold text-ink">
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noreferrer" className="hover:underline">
                        {p.title}
                      </a>
                    ) : (
                      p.title
                    )}
                  </span>
                  <span className="mt-0.5 block text-[12.5px] font-semibold text-slate-400">
                    {p.creator} · {p.platform} · {p.format === "static" ? "Static" : "Video"} · {p.views.toLocaleString("en-US")} views ·
                    earned {usd(p.earnedCents)}
                    {p.awaitingMusic ? " · waiting on music approval" : ""}
                  </span>
                </span>
                <input
                  className={`${input} w-[110px]`}
                  inputMode="numeric"
                  placeholder="Views"
                  value={views[p.id] ?? ""}
                  onChange={(e) => setViews((v) => ({ ...v, [p.id]: e.target.value.replace(/[^0-9]/g, "") }))}
                />
                <Pill
                  size="sm"
                  variant="quiet"
                  disabled={busy !== null || !views[p.id]}
                  onClick={() =>
                    void run(`views-${p.id}`, () =>
                      simulateViews({ companyId: company.id, postId: p.id, views: Number(views[p.id]) }),
                    )
                  }
                >
                  {busy === `views-${p.id}` ? "Saving…" : "Set views"}
                </Pill>
              </div>
            ))}
            <p className="m-0 border-t border-line px-5 py-3 text-[12.5px] font-semibold text-slate-400">
              Views only go up. The daily check at 8 AM UTC keeps the higher of this and the real count.
            </p>
          </Card>
        </>
      ) : null}
    </div>
  );
}

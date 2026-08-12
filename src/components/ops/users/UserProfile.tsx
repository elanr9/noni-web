"use client";

import { Images, Play, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { Avatar, Card, Chip, Label, PageHead, Pill } from "@/components/kit";
import { companyName, fmtK, money, SEED_POSTS, statusTone } from "@/lib/ops/mock-data";
import type { Person } from "@/lib/ops/types";

import { ManagerBriefs } from "./ManagerBriefs";
import { ManagerWeek } from "./ManagerWeek";

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-t border-line px-5 py-3">
      <span className="w-[84px] text-[12.5px] font-semibold text-slate-400">{label}</span>
      <span className="flex-1 text-[13.5px] font-semibold text-ink">{value}</span>
    </div>
  );
}

/** Full profile page at /ops/users/[userId]: creator, campaign-manager
    and company-admin variants. */
export function UserProfile({ person: p }: { person: Person }) {
  const router = useRouter();
  const [resent, setResent] = useState(false);
  const posts = SEED_POSTS.filter((q) => q.creator === p.name).sort(
    (a, b) => b.viewsN - a.viewsN,
  );
  const earned = posts.reduce((n, q) => n + q.earned, 0);
  const stats: Array<[string, ReactNode]> = [
    ["Posts this month", p.posts],
    ["Views this month", p.viewsN ? fmtK(p.viewsN) : "—"],
    ["Earned", earned ? money(earned) : "—"],
  ];
  return (
    <div className="animate-om-rise">
      <PageHead
        onBack={() => router.back()}
        title={p.name}
        sub={`${p.role} · ${companyName(p.company)}`}
        right={<Chip tone={statusTone(p.status)}>{p.status}</Chip>}
      />
      <div className="grid grid-cols-[minmax(280px,340px)_minmax(0,1fr)] items-start gap-3.5">
        <Card pad={0}>
          <div className="flex items-center gap-[13px] px-5 py-[18px]">
            <Avatar name={p.name} size={46} />
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-ink">{p.name}</span>
              <span className="mt-[3px] block">
                <Chip tone={p.role === "Company admin" ? "blue" : "slate"}>{p.role}</Chip>
              </span>
            </span>
          </div>
          <Row label="Email" value={p.email} />
          <Row label="Phone" value={p.phone} />
          <Row label="Joined" value={p.joined} />
          <div className="flex items-center gap-3 border-t border-line px-5 py-3">
            <span className="w-[84px] text-[12.5px] font-semibold text-slate-400">
              Company
            </span>
            <Link
              href={`/ops/companies/${p.company}`}
              className="flex-1 text-[13.5px] font-bold text-blue-700"
            >
              {companyName(p.company)}
            </Link>
          </div>
          {p.status === "Invite pending" || p.status === "Pending" ? (
            <div className="border-t border-line px-5 py-3.5">
              <Pill
                variant="tint"
                icon={RotateCcw}
                onClick={() => setResent(true)}
                className="w-full"
              >
                {resent ? "Sent just now" : "Resend invite"}
              </Pill>
            </div>
          ) : null}
        </Card>
        <div className="flex min-w-0 flex-col gap-3.5">
          {p.role === "Creator" ? (
            <Card pad={22} className="flex gap-[18px]">
              {stats.map(([l, v]) => (
                <span key={l} className="min-w-0 flex-1">
                  <span className="block text-[12px] font-semibold text-slate-400">{l}</span>
                  <span className="mt-[5px] block text-[26px] font-bold tracking-[-0.5px] text-ink">
                    {v}
                  </span>
                </span>
              ))}
            </Card>
          ) : p.role === "Campaign manager" ? (
            <ManagerWeek companyId={p.company} />
          ) : (
            <Card pad={22}>
              <p className="m-0 text-[14px] font-semibold leading-[1.6] text-slate-500">
                {`Owns ${companyName(p.company)}'s program on the web dashboard — brand brain, features, billing and the campaign team.`}
              </p>
            </Card>
          )}
          {p.role === "Creator" ? (
            <Card pad={0}>
              <Label className="block px-5 pb-2 pt-4">Posts</Label>
              {posts.length === 0 ? (
                <p className="m-0 px-5 pb-[18px] pt-1 text-[13.5px] font-semibold text-slate-400">
                  Nothing published yet.
                </p>
              ) : (
                <div className="max-h-[400px] overflow-y-auto">
                  {posts.map((q) => {
                    const Glyph = q.format === "Video" ? Play : Images;
                    return (
                      <div
                        key={q.id}
                        role="button"
                        onClick={() => router.push(`/ops/posts/${q.id}`)}
                        className="flex cursor-pointer items-center gap-[13px] border-t border-line px-5 py-[13px] transition-colors duration-[160ms] ease-om hover:bg-fill-quiet"
                      >
                        <span className="inline-flex h-14 w-[42px] shrink-0 items-center justify-center bg-blue-100 rounded-[10px]">
                          <Glyph size={15} className="text-blue-700" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-bold text-ink">
                            {q.title}
                          </span>
                          <span className="mt-0.5 block text-[12.5px] font-semibold text-slate-400">
                            {q.date} · {q.format} · TikTok {fmtK(q.tt.views)} · IG{" "}
                            {fmtK(q.ig.views)}
                          </span>
                        </span>
                        <span className="text-right">
                          <span className="block text-[15px] font-bold text-ink">
                            {fmtK(q.viewsN)}
                          </span>
                          <span className="mt-0.5 block text-[12px] font-bold text-green">
                            {money(q.earned)}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ) : null}
        </div>
      </div>
      {p.role === "Campaign manager" ? (
        <div className="mt-3.5">
          <ManagerBriefs companyId={p.company} />
        </div>
      ) : null}
    </div>
  );
}

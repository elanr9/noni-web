"use client";

import { ChartColumn } from "lucide-react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/kit";
import { AnalyticsExplorer } from "@/components/ops/analytics/AnalyticsExplorer";
import { DailyActivity } from "@/components/ops/analytics/DailyActivity";
import { StatStrip } from "@/components/ops/analytics/StatStrip";
import { useOpsShell } from "@/components/ops/OpsShell";
import type { Company, CompanyDays, Person, Post } from "@/lib/ops/types";

export function CompanyAnalytics({
  company,
  companies,
  people,
  posts,
  days,
}: {
  company: Company;
  companies: Company[];
  people: Person[];
  posts: Post[];
  days: CompanyDays;
}) {
  const router = useRouter();
  const { openUserProfile } = useOpsShell();

  if (!company.series.length) {
    return (
      <Card
        pad={0}
        className="flex flex-col items-center text-center"
        style={{ padding: "64px 24px" }}
      >
        <span className="inline-flex h-[54px] w-[54px] items-center justify-center bg-blue-100 rounded-pill">
          <ChartColumn size={22} className="text-blue-700" />
        </span>
        <div className="mt-4 text-[16px] font-bold tracking-[-0.3px] text-ink">
          Nothing to chart yet
        </div>
        <p className="m-0 mt-1.5 max-w-[340px] text-[14px] font-semibold leading-normal text-slate-400">
          Invite pending. Analytics start the moment their first campaign goes
          live.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      <StatStrip
        stats={[
          { label: "Views this month", value: company.views, delta: company.deltas.views },
          { label: "Posts this month", value: String(company.posts), delta: company.deltas.posts },
          { label: "Active campaigns", value: String(company.campaigns), delta: company.deltas.campaigns },
          { label: "Creators", value: String(company.creators), delta: company.deltas.creators },
        ]}
      />
      <AnalyticsExplorer
        scope={company.id}
        showScopeDropdown={false}
        posts={posts}
        people={people}
        companies={companies}
        onOpenProfile={openUserProfile}
        onOpenPost={(p) => router.push(`/ops/posts/${p.id}`)}
      />
      <DailyActivity
        companyId={company.id}
        companyName={company.name}
        days={days}
        posts={posts}
      />
    </div>
  );
}

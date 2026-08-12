"use client";

/* Overview — the platform-wide analytics explorer (OpsOverview in the
   prototype). Title mirrors the selected range; the stat strip and the
   View company pill follow the scope picked in the explorer. */
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PageHead, Pill } from "@/components/kit";
import { AnalyticsExplorer } from "@/components/ops/analytics/AnalyticsExplorer";
import { StatStrip, type StatStripStat } from "@/components/ops/analytics/StatStrip";
import { useOpsShell } from "@/components/ops/OpsShell";
import { overviewStats, rangeLabel, type Range } from "@/lib/ops/analytics";
import { SEED_COMPANIES, SEED_PEOPLE, SEED_POSTS } from "@/lib/ops/mock-data";

export default function OpsOverviewPage() {
  const router = useRouter();
  const { openUserProfile } = useOpsShell();
  const [scope, setScope] = useState<string | null>(null);
  const [range, setRange] = useState<Range>("Last 7 days");

  const stats = overviewStats(SEED_COMPANIES, SEED_PEOPLE, scope);
  const statItems: StatStripStat[] = [
    { label: "Views this month", value: String(stats.views), delta: stats.dViews },
    { label: "Posts this month", value: String(stats.posts), delta: stats.dPosts },
    { label: "Active campaigns", value: String(stats.campaigns), delta: stats.dCamp },
    { label: "Creators", value: String(stats.creators) },
  ];

  return (
    <div>
      <PageHead title={rangeLabel(range)} />
      <StatStrip
        className="mb-[22px] border-b border-line pb-[22px]"
        stats={statItems}
        right={
          scope ? (
            <Pill
              size="sm"
              variant="tint"
              icon={ArrowRight}
              onClick={() => router.push(`/ops/companies/${scope}`)}
            >
              View company
            </Pill>
          ) : null
        }
      />
      <AnalyticsExplorer
        scope={scope}
        showScopeDropdown
        onScopeChange={setScope}
        range={range}
        onRangeChange={setRange}
        posts={SEED_POSTS}
        people={SEED_PEOPLE}
        companies={SEED_COMPANIES}
        onOpenProfile={openUserProfile}
        onOpenPost={(post) => router.push(`/ops/posts/${post.id}`)}
      />
    </div>
  );
}

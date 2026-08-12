"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Chip, PageHead, Tabs } from "@/components/kit";
import { statusTone } from "@/lib/ops/mock-data";
import type { Company } from "@/lib/ops/types";

import { CompanyAnalytics } from "./CompanyAnalytics";
import { CompanyBilling } from "./CompanyBilling";
import { CompanyBrain } from "./CompanyBrain";
import { CompanyPosts } from "./CompanyPosts";
import { CompanyTeam } from "./CompanyTeam";

const TABS = ["Analytics", "Team", "Posts", "Company Brain", "Billing"] as const;
type CompanyTab = (typeof TABS)[number];

export function CompanyDetail({ company }: { company: Company }) {
  const router = useRouter();
  const [tab, setTab] = useState<CompanyTab>("Analytics");

  return (
    <div>
      <PageHead
        onBack={() => router.back()}
        title={company.name}
        sub={`${company.website || "No website yet"} · joined ${company.joined}`}
        right={<Chip tone={statusTone(company.status)}>{company.status}</Chip>}
      />
      <Tabs tabs={TABS} active={tab} onSelect={setTab} />
      <div key={tab} className="animate-om-rise">
        {tab === "Analytics" ? <CompanyAnalytics company={company} /> : null}
        {tab === "Team" ? <CompanyTeam company={company} /> : null}
        {tab === "Posts" ? <CompanyPosts company={company} /> : null}
        {tab === "Company Brain" ? <CompanyBrain /> : null}
        {tab === "Billing" ? <CompanyBilling company={company} /> : null}
      </div>
    </div>
  );
}

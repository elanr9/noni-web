"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Chip, PageHead, Tabs } from "@/components/kit";
import { statusTone } from "@/lib/ops/mock-data";
import type {
  BrainDoc,
  Company,
  CompanyBilling as Billing,
  CompanyDays,
  InspirationAccount,
  Person,
  Post,
} from "@/lib/ops/types";

import { CompanyAnalytics } from "./CompanyAnalytics";
import { CompanyBilling } from "./CompanyBilling";
import { CompanyBrain } from "./CompanyBrain";
import { CompanyPosts } from "./CompanyPosts";
import { CompanyTeam } from "./CompanyTeam";

const TABS = ["Analytics", "Team", "Posts", "Company Brain", "Billing"] as const;
type CompanyTab = (typeof TABS)[number];

export interface CompanyDetailProps {
  company: Company;
  companies: Company[];
  people: Person[];
  posts: Post[];
  days: CompanyDays;
  billing: Billing | null;
  brainDocs: BrainDoc[];
  brainAccounts: InspirationAccount[];
}

export function CompanyDetail({
  company,
  companies,
  people,
  posts,
  days,
  billing,
  brainDocs,
  brainAccounts,
}: CompanyDetailProps) {
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
        {tab === "Analytics" ? (
          <CompanyAnalytics
            company={company}
            companies={companies}
            people={people}
            posts={posts}
            days={days}
          />
        ) : null}
        {tab === "Team" ? <CompanyTeam company={company} people={people} /> : null}
        {tab === "Posts" ? <CompanyPosts company={company} posts={posts} /> : null}
        {tab === "Company Brain" ? (
          <CompanyBrain docs={brainDocs} accounts={brainAccounts} />
        ) : null}
        {tab === "Billing" ? (
          <CompanyBilling company={company} billing={billing} />
        ) : null}
      </div>
    </div>
  );
}

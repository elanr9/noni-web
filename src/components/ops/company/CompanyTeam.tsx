"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { Avatar, Card, Chip, HoverPeek, SortDropdown, Tabs } from "@/components/kit";
import { useOpsShell } from "@/components/ops/OpsShell";
import { fmtK, statusTone } from "@/lib/ops/mock-data";
import type { Company, Person, Role } from "@/lib/ops/types";

const SUB_TABS = ["Admins", "Creators", "Campaign Managers"] as const;
type SubTab = (typeof SUB_TABS)[number];
type TeamSort = "Views" | "Posts" | "Name";

const ROLE_OF: Record<SubTab, Role> = {
  Admins: "Company admin",
  Creators: "Creator",
  "Campaign Managers": "Campaign manager",
};

export function CompanyTeam({
  company,
  people: allPeople,
}: {
  company: Company;
  people: Person[];
}) {
  const { openUserProfile } = useOpsShell();
  const [filter, setFilter] = useState<SubTab>("Admins");
  const [sort, setSort] = useState<TeamSort>("Name");

  const sortOptions: readonly TeamSort[] =
    filter === "Creators" ? (["Views", "Posts", "Name"] as const) : (["Name"] as const);
  const pick = (f: SubTab) => {
    setFilter(f);
    setSort(f === "Creators" ? "Views" : "Name");
  };

  const people = allPeople.filter(
    (p) => p.company === company.id && p.role === ROLE_OF[filter],
  ).sort((a, b) =>
    sort === "Views"
      ? (b.viewsN || 0) - (a.viewsN || 0)
      : sort === "Posts"
        ? (b.posts || 0) - (a.posts || 0)
        : a.name.localeCompare(b.name),
  );

  return (
    <div>
      <Tabs
        tabs={SUB_TABS}
        active={filter}
        onSelect={pick}
        right={<SortDropdown options={sortOptions} value={sort} onSelect={setSort} />}
      />
      <Card pad={0} key={filter + sort} className="overflow-hidden animate-om-rise">
        {people.length === 0 ? (
          <p className="m-0 px-5 py-[22px] text-[13.5px] font-semibold text-slate-400">
            Nobody here yet.
          </p>
        ) : (
          people.map((p, i) => (
            <HoverPeek key={p.id} onClick={() => openUserProfile(p)}>
              <div
                className={`flex items-center gap-3.5 px-5 py-3.5 transition-colors duration-[160ms] ease-om hover:bg-fill-quiet ${
                  i === people.length - 1 ? "" : "border-b border-line"
                }`}
              >
                <Avatar name={p.name} size={36} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-bold text-ink">{p.name}</span>
                  <span className="mt-0.5 block text-[12.5px] font-semibold text-slate-400">
                    {p.email}
                  </span>
                </span>
                {p.role === "Creator" ? (
                  <span className="whitespace-nowrap text-[13px] font-semibold text-slate-400">
                    {p.posts} posts · {p.viewsN ? fmtK(p.viewsN) + " views" : "—"}
                  </span>
                ) : null}
                <Chip tone={statusTone(p.status)}>{p.status}</Chip>
                <ChevronRight size={16} className="text-slate-400" />
              </div>
            </HoverPeek>
          ))
        )}
      </Card>
    </div>
  );
}

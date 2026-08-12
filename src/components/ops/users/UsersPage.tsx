"use client";

import { useState } from "react";

import { Avatar, Card, Chip, PageHead, SortDropdown, Tabs } from "@/components/kit";
import { useOpsShell } from "@/components/ops/OpsShell";
import {
  companyName,
  fmtK,
  SEED_COMPANIES,
  SEED_PEOPLE,
  statusTone,
} from "@/lib/ops/mock-data";
import type { Role } from "@/lib/ops/types";

const TABS = ["Admins", "Creators", "Campaign Managers"] as const;
type Tab = (typeof TABS)[number];

const ROLE_OF: Record<Tab, Role> = {
  Admins: "Company admin",
  Creators: "Creator",
  "Campaign Managers": "Campaign manager",
};

type Sort = "Views" | "Posts" | "Name" | "Company";

export function UsersPage() {
  const { openUserProfile } = useOpsShell();
  const [filter, setFilter] = useState<Tab>("Admins");
  const [sort, setSort] = useState<Sort>("Name");
  const sortOptions: readonly Sort[] =
    filter === "Creators" ? ["Views", "Posts", "Name", "Company"] : ["Name", "Company"];
  const pick = (f: Tab) => {
    setFilter(f);
    setSort(f === "Creators" ? "Views" : "Name");
  };
  const activeIds = SEED_COMPANIES.filter((c) => c.status === "Active").map((c) => c.id);
  const shown = SEED_PEOPLE.filter(
    (p) => p.role === ROLE_OF[filter] && activeIds.includes(p.company),
  );
  shown.sort((a, b) =>
    sort === "Views"
      ? (b.viewsN ?? 0) - (a.viewsN ?? 0)
      : sort === "Posts"
        ? (b.posts ?? 0) - (a.posts ?? 0)
        : sort === "Company"
          ? companyName(a.company).localeCompare(companyName(b.company))
          : a.name.localeCompare(b.name),
  );
  return (
    <div>
      <PageHead
        title="Users"
        sub="Everyone on Noni — company admins, campaign managers and creators."
      />
      <Tabs
        tabs={TABS}
        active={filter}
        onSelect={pick}
        right={<SortDropdown options={sortOptions} value={sort} onSelect={setSort} />}
      />
      <Card pad={0} key={filter + sort} className="animate-om-rise">
        {shown.map((r, i) => (
          <div
            key={r.id}
            role="button"
            onClick={() => openUserProfile(r)}
            className={`flex cursor-pointer items-center gap-3.5 px-5 py-3.5 transition-colors duration-[160ms] ease-om hover:bg-fill-quiet ${
              i === shown.length - 1 ? "" : "border-b border-line"
            }`}
          >
            <Avatar name={r.name} size={36} />
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-bold text-ink">{r.name}</span>
              <span className="mt-0.5 block text-[12.5px] font-semibold text-slate-400">
                {companyName(r.company)}
              </span>
            </span>
            {r.role === "Creator" ? (
              <span className="w-40 whitespace-nowrap text-right text-[13px] font-semibold text-slate-400">
                {r.posts} posts · {r.viewsN ? fmtK(r.viewsN) + " views" : "—"}
              </span>
            ) : (
              <span className="text-[13px] font-semibold text-slate-400">{r.email}</span>
            )}
            <Chip tone={statusTone(r.status)}>{r.status}</Chip>
          </div>
        ))}
      </Card>
    </div>
  );
}

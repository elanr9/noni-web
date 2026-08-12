"use client";

import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, Card, Chip, PageHead, Pill } from "@/components/kit";
import { statusTone } from "@/lib/ops/mock-data";
import type { Company } from "@/lib/ops/types";
import { NewCompanyModal } from "./NewCompanyModal";

function CompanyRow({ c, last }: { c: Company; last: boolean }) {
  return (
    <Link
      href={`/ops/companies/${c.id}`}
      className={`flex items-center gap-3.5 px-5 py-[15px] transition-colors duration-[160ms] ease-om hover:bg-fill-quiet ${
        last ? "" : "border-b border-line"
      }`}
    >
      <Avatar name={c.name} size={38} />
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold text-ink">{c.name}</span>
        <span className="mt-0.5 block text-[13px] font-semibold text-slate-400">
          {c.admin.email}
        </span>
      </span>
      <span className="w-[210px] text-right text-[13px] font-semibold text-slate-400">
        {c.campaigns} campaigns · {c.posts} posts · {c.views} views
      </span>
      <Chip tone={statusTone(c.status)}>{c.status}</Chip>
      <ChevronRight size={16} className="shrink-0 text-slate-400" />
    </Link>
  );
}

export function CompaniesView({ companies }: { companies: Company[] }) {
  const [modal, setModal] = useState(false);
  const shown = companies.filter((c) => c.status === "Active");
  return (
    <div>
      <PageHead
        title="Companies"
        sub="Every company on Noni, one admin each. New company sends that admin an email invite — they appear here once they accept."
        right={
          <Pill icon={Plus} onClick={() => setModal(true)}>
            New company
          </Pill>
        }
      />
      <Card pad={0} className="overflow-hidden">
        {shown.map((c, i) => (
          <CompanyRow key={c.id} c={c} last={i === shown.length - 1} />
        ))}
      </Card>
      {modal ? <NewCompanyModal onClose={() => setModal(false)} /> : null}
    </div>
  );
}

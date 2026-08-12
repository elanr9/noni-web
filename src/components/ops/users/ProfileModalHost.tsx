"use client";

import { ArrowRight, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { Avatar, Chip, Modal, Pill } from "@/components/kit";
import { useOpsShell } from "@/components/ops/OpsShell";
import { companyName, fmtK, statusTone } from "@/lib/ops/mock-data";
import type { Person } from "@/lib/ops/types";

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-line py-[11px]">
      <span className="w-[92px] text-[12.5px] font-semibold text-slate-400">{label}</span>
      <span className="flex-1 text-[14px] font-semibold text-ink">{value}</span>
    </div>
  );
}

/** Global profile modal. Registers itself with the shell so ⌘K person
    results, team rows and the users list all open it via openUserProfile. */
export function ProfileModalHost() {
  const router = useRouter();
  const { setOnSelectUser } = useOpsShell();
  const [person, setPerson] = useState<Person | null>(null);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    setOnSelectUser((p) => {
      setPerson(p);
      setResent(false);
    });
    return () => setOnSelectUser(null);
  }, [setOnSelectUser]);

  if (!person) return null;
  const p = person;
  const close = () => setPerson(null);

  return (
    <Modal title="" onClose={close}>
      <div className="mb-2.5 flex items-center gap-3.5 pr-10">
        <Avatar name={p.name} size={52} />
        <span className="min-w-0 flex-1">
          <span className="block text-[18px] font-bold tracking-[-0.3px] text-ink">
            {p.name}
          </span>
          <span className="mt-1 flex items-center gap-1.5">
            <Chip tone={p.role === "Company admin" ? "blue" : "slate"}>{p.role}</Chip>
            <Chip tone={statusTone(p.status)}>{p.status}</Chip>
          </span>
        </span>
      </div>
      <div>
        <Row label="Email" value={p.email} />
        <Row label="Phone" value={p.phone} />
        <Row label="Company" value={companyName(p.company)} />
        {p.role === "Creator" ? (
          <Row
            label="This month"
            value={`${p.posts} posts · ${p.viewsN ? fmtK(p.viewsN) + " views" : "no views yet"}`}
          />
        ) : null}
        <Row label="Joined" value={p.joined} />
      </div>
      <div className="mt-4 flex gap-2.5">
        {p.status === "Invite pending" ? (
          <Pill
            variant="tint"
            icon={RotateCcw}
            onClick={() => setResent(true)}
            className="flex-1"
          >
            {resent ? "Sent just now" : "Resend invite"}
          </Pill>
        ) : null}
        <Pill
          icon={ArrowRight}
          onClick={() => {
            close();
            router.push(`/ops/users/${p.id}`);
          }}
          className="flex-1"
        >
          View profile
        </Pill>
      </div>
    </Modal>
  );
}

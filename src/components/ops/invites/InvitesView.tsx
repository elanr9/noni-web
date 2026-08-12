"use client";

import { RotateCcw } from "lucide-react";
import { useState, useTransition } from "react";
import { resendInvite } from "@/app/ops/actions";
import { Avatar, Card, Chip, PageHead, Pill } from "@/components/kit";
import { SEED_INVITES, statusTone } from "@/lib/ops/mock-data";
import type { Invite } from "@/lib/ops/types";

export function InvitesView({ invites: initial }: { invites: Invite[] }) {
  const [invites, setInvites] = useState(initial);
  const [error, setError] = useState<{ id: string; message: string } | null>(null);
  const [, startTransition] = useTransition();

  const resend = (invite: Invite) => {
    setError(null);
    const before = invites;
    setInvites((xs) =>
      xs.map((x) =>
        x.id === invite.id ? { ...x, sent: "Just now", status: "Pending" } : x,
      ),
    );
    /* Seed rows have no Supabase invite behind them; they stay local-state
       only until Agent F wires real data. */
    if (SEED_INVITES.some((s) => s.id === invite.id)) return;
    startTransition(async () => {
      const result = await resendInvite({ inviteId: invite.id });
      if (!result.ok) {
        setInvites(before);
        setError({ id: invite.id, message: result.error });
      }
    });
  };

  return (
    <div>
      <PageHead
        title="Invites"
        sub="Every admin invite we've sent. Pending means they haven't signed in with Google yet."
      />
      <Card pad={0} className="overflow-hidden">
        {invites.map((iv, i) => (
          <div
            key={iv.id}
            className={`flex items-center gap-3.5 px-5 py-[15px] ${
              i === invites.length - 1 ? "" : "border-b border-line"
            }`}
          >
            <Avatar name={iv.name} size={36} />
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-bold text-ink">
                {iv.name} ·{" "}
                <span className="font-semibold text-slate-400">{iv.email}</span>
              </span>
              <span className="mt-0.5 block text-[13px] font-semibold text-slate-400">
                {iv.company} · Company admin · sent {iv.sent}
              </span>
            </span>
            {error && error.id === iv.id ? (
              <span className="text-[13px] font-semibold text-danger">
                {error.message}
              </span>
            ) : null}
            <Chip tone={statusTone(iv.status)}>{iv.status}</Chip>
            {iv.status !== "Accepted" ? (
              <Pill size="sm" variant="tint" icon={RotateCcw} onClick={() => resend(iv)}>
                {iv.sent === "Just now" ? "Sent just now" : "Resend"}
              </Pill>
            ) : null}
          </div>
        ))}
      </Card>
    </div>
  );
}

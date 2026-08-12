"use client";

import { ChevronRight, Clock, Plus, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { sendTeamInvite } from "@/app/admin/team/actions";
import { Avatar, Card, Chip, Field, Label, Modal, PageHead, Pill } from "@/components/kit";
import type { Member, MemberRole } from "@/lib/admin/types";

/* Team tab (TeamPage in AdminSetupTabs.jsx): Campaign managers + Creators
   cards with counts, invite modal with a role-aware success state, and
   member rows that open the full profile page at /admin/team/[memberId]. */

function InviteModal({
  role,
  companyName,
  onClose,
}: {
  role: MemberRole;
  companyName: string;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const roleLabel = role === "Campaign manager" ? "campaign manager" : "creator";

  const send = () => {
    if (!name.trim() || !email.trim() || pending) return;
    setError(null);
    startTransition(async () => {
      const result = await sendTeamInvite({
        role,
        name: name.trim(),
        email: email.trim(),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSentTo(name.trim().split(" ")[0]);
    });
  };

  return (
    <Modal title={sentTo ? undefined : `Invite a ${roleLabel}`} onClose={onClose}>
      {sentTo ? (
        <div className="px-1 pb-1.5 pt-[18px] text-center">
          <span className="inline-flex h-[52px] w-[52px] items-center justify-center bg-green-soft rounded-pill">
            <Send size={21} className="text-green" />
          </span>
          <div className="mt-3.5 text-[18px] font-bold tracking-[-0.4px] text-ink">
            Invite sent
          </div>
          <p className="mx-0 mb-0 mt-2 text-[13.5px] font-semibold leading-[1.6] text-slate-400">
            {sentTo} gets an email. When they sign in with it, Noni already
            knows they&apos;re a {roleLabel} for {companyName}. No code, no
            setup on their end.
          </p>
          <div className="mt-[18px] flex justify-center gap-2">
            <Pill
              size="sm"
              variant="tint"
              onClick={() => {
                setSentTo(null);
                setName("");
                setEmail("");
              }}
            >
              Invite another
            </Pill>
            <Pill size="sm" onClick={onClose}>
              Done
            </Pill>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          <Field
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
          />
          {error ? (
            <p className="m-0 text-[13px] font-semibold text-danger">{error}</p>
          ) : null}
          <Pill
            icon={Send}
            onClick={send}
            disabled={!name.trim() || !email.trim() || pending}
          >
            {pending ? "Sending invite…" : "Send invite"}
          </Pill>
        </div>
      )}
    </Modal>
  );
}

function TeamSection({
  label,
  hint,
  people,
  inviteLabel,
  onInvite,
}: {
  label: string;
  hint: string;
  people: Member[];
  inviteLabel: string;
  onInvite: () => void;
}) {
  const router = useRouter();

  return (
    <Card pad={0}>
      <div className="flex items-center gap-2.5 px-5 py-4">
        <span className="flex-1">
          <Label>
            {label}
            {people.length ? ` · ${people.length}` : ""}
          </Label>
          <span className="mt-[3px] block text-[13px] font-semibold text-slate-400">
            {hint}
          </span>
        </span>
        <Pill size="sm" variant="tint" icon={Plus} onClick={onInvite}>
          {inviteLabel}
        </Pill>
      </div>
      {people.length === 0 ? (
        <p className="m-0 border-t border-line px-5 py-3.5 text-[13.5px] font-semibold text-slate-400">
          Nobody yet. Invites land by email and new sign-ins arrive already in
          the right role.
        </p>
      ) : (
        people.map((p) => (
          <div
            key={p.id}
            role="button"
            onClick={() => router.push(`/admin/team/${p.id}`)}
            className="flex cursor-pointer items-center gap-3 border-t border-line px-5 py-3 transition-colors duration-[160ms] ease-om hover:bg-fill-quiet"
          >
            <Avatar name={p.name} size={34} />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-bold text-ink">{p.name}</span>
              <span className="block text-[12.5px] font-semibold text-slate-400">
                {p.email}
              </span>
            </span>
            {p.status === "Active" ? (
              <Chip tone="green">Active</Chip>
            ) : (
              <Chip tone="amber">
                <Clock size={12} /> Invite sent
              </Chip>
            )}
            <ChevronRight size={15} className="shrink-0 text-slate-400" />
          </div>
        ))
      )}
    </Card>
  );
}

export function TeamView({
  companyName,
  managers,
  creators,
}: {
  companyName: string;
  managers: Member[];
  creators: Member[];
}) {
  const [inviting, setInviting] = useState<MemberRole | null>(null);

  return (
    <div>
      <PageHead
        title="Team"
        sub={`Everyone on ${companyName}. Invites land by email; Noni knows their role the moment they sign in.`}
      />
      <div className="flex flex-col gap-3.5">
        <TeamSection
          label="Campaign managers"
          hint="They run weekly briefs and keep creators on pace."
          people={managers}
          inviteLabel="Invite manager"
          onInvite={() => setInviting("Campaign manager")}
        />
        <TeamSection
          label="Creators"
          hint="They record. Their first tasks are waiting when they sign in."
          people={creators}
          inviteLabel="Invite creator"
          onInvite={() => setInviting("Creator")}
        />
      </div>
      {inviting ? (
        <InviteModal
          role={inviting}
          companyName={companyName}
          onClose={() => setInviting(null)}
        />
      ) : null}
    </div>
  );
}

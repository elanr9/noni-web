"use client";

import { ChevronRight, Clock, Plus, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { sendTeamInvite, updateManagerAccess } from "@/app/admin/team/actions";
import { Avatar, Card, Chip, Field, Label, Modal, PageHead, Pill } from "@/components/kit";
import type { ManagerAccess, Member, MemberRole } from "@/lib/admin/types";

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
  managerAccess,
}: {
  companyName: string;
  managers: Member[];
  creators: Member[];
  managerAccess: ManagerAccess;
}) {
  const [inviting, setInviting] = useState<MemberRole | null>(null);
  const [access, setAccess] = useState(managerAccess);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggle = (key: keyof ManagerAccess) => {
    if (pending) return;
    const next = !access[key];
    setAccess((prev) => ({ ...prev, [key]: next }));
    setAccessError(null);
    startTransition(async () => {
      const result = await updateManagerAccess({ [key]: next });
      if (!result.ok) {
        setAccess((prev) => ({ ...prev, [key]: !next }));
        setAccessError(result.error);
      }
    });
  };

  return (
    <div>
      <PageHead
        title="Team"
        sub={`Everyone on ${companyName}. Invites land by email; Noni knows their role the moment they sign in.`}
      />
      <div className="flex flex-col gap-3.5">
        <div data-tour="team-managers">
          <TeamSection
            label="Campaign managers"
            hint="They run weekly briefs and keep creators on pace."
            people={managers}
            inviteLabel="Invite manager"
            onInvite={() => setInviting("Campaign manager")}
          />
        </div>
        <Card pad={0}>
          <div className="px-5 py-4">
            <Label>Campaign manager access</Label>
            <span className="mt-[3px] block text-[13px] font-semibold text-slate-400">
              What they can see and do in the app.
            </span>
          </div>
          <AccessToggle
            label="Financials"
            hint="Spend and payout numbers"
            on={access.viewFinancials}
            onToggle={() => toggle("viewFinancials")}
          />
          <AccessToggle
            label="Sign ups"
            hint="Attributed sign up counts"
            on={access.viewSignups}
            onToggle={() => toggle("viewSignups")}
          />
          <AccessToggle
            label="Creator invites"
            hint="Send creator invites from the app"
            on={access.inviteCreators}
            onToggle={() => toggle("inviteCreators")}
          />
          {accessError ? (
            <p className="m-0 border-t border-line px-5 py-3 text-[13px] font-semibold text-danger">
              {accessError}
            </p>
          ) : null}
        </Card>
        <div data-tour="team-creators">
          <TeamSection
            label="Creators"
            hint="They record. Their first tasks are waiting when they sign in."
            people={creators}
            inviteLabel="Invite creator"
            onInvite={() => setInviting("Creator")}
          />
        </div>
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

function AccessToggle({
  label,
  hint,
  on,
  onToggle,
}: {
  label: string;
  hint: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border-t border-line px-5 py-3.5">
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-bold text-ink">{label}</span>
        <span className="mt-px block text-[12.5px] font-semibold text-slate-400">
          {hint}
        </span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onToggle}
        className={`relative h-[22px] w-[38px] shrink-0 cursor-pointer border-none transition-colors duration-[160ms] ease-om rounded-pill ${
          on ? "bg-blue-500" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-[3px] left-[3px] block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-[160ms] ease-om ${
            on ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

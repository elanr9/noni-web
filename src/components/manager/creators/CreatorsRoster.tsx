"use client";

import { ChevronRight, Clock, Plus, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { sendCreatorInvite } from "@/app/manager/creators/actions";
import { Card, Chip, Field, Label, Modal, PageHead, Pill } from "@/components/kit";
import type { CreatorRoster } from "@/lib/manager/creators";

import { CreatorAvatar } from "./CreatorAvatar";
import { fmtViews, formatCents, shortDate } from "./format";

/* Creators roster (mobile creators tab): every creator with posts, views
   and earnings this month, sortable the same way the app sorts, plus the
   invites still waiting on an email. */

type SortKey = "views" | "posts" | "earnedMonthCents";

const ALL_SORTS: Array<{ key: SortKey; label: string }> = [
  { key: "earnedMonthCents", label: "Earnings" },
  { key: "views", label: "Views" },
  { key: "posts", label: "Posts" },
];

function InviteCreatorModal({
  companyName,
  onClose,
}: {
  companyName: string;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const send = () => {
    if (!name.trim() || !email.trim() || pending) return;
    setError(null);
    startTransition(async () => {
      const result = await sendCreatorInvite({
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
    <Modal title={sentTo ? undefined : "Invite a creator"} onClose={onClose}>
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
            knows they&apos;re a creator for {companyName}. No code, no setup
            on their end.
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

function Stat({
  value,
  label,
  className = "",
}: {
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <span className={`w-[64px] shrink-0 text-right ${className}`}>
      <span className="block text-[14px] font-bold text-ink">{value}</span>
      <span className="mt-px block text-[11px] font-semibold text-slate-400">
        {label}
      </span>
    </span>
  );
}

export function CreatorsRoster({
  roster,
  companyName,
  viewFinancials,
  canInvite,
}: {
  roster: CreatorRoster;
  companyName: string;
  viewFinancials: boolean;
  canInvite: boolean;
}) {
  const router = useRouter();
  const [inviting, setInviting] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("views");

  const sorts = viewFinancials
    ? ALL_SORTS
    : ALL_SORTS.filter((s) => s.key !== "earnedMonthCents");
  const activeSort: SortKey =
    sortKey === "earnedMonthCents" && !viewFinancials ? "views" : sortKey;

  const sorted = useMemo(
    () => [...roster.creators].sort((a, b) => b[activeSort] - a[activeSort]),
    [roster.creators, activeSort],
  );

  return (
    <div>
      <PageHead
        title="Creators"
        sub={`Everyone recording for ${companyName}, with what they have posted and earned this month.`}
        right={
          canInvite ? (
            <Pill size="sm" icon={Plus} onClick={() => setInviting(true)}>
              Invite creator
            </Pill>
          ) : undefined
        }
      />

      <div className="mb-3.5 flex flex-wrap gap-2">
        {sorts.map((s) => (
          <Pill
            key={s.key}
            size="sm"
            variant={activeSort === s.key ? "tint" : "quiet"}
            onClick={() => setSortKey(s.key)}
          >
            {s.label}
          </Pill>
        ))}
      </div>

      <div className="flex flex-col gap-3.5">
        <Card pad={0}>
          <div className="px-5 py-4">
            <Label>
              Creators
              {sorted.length ? ` · ${sorted.length}` : ""}
            </Label>
          </div>
          {sorted.length === 0 ? (
            <p className="m-0 border-t border-line px-5 py-3.5 text-[13.5px] font-semibold text-slate-400">
              {canInvite
                ? "No creators yet. Invite creators and they show up here once they join."
                : "No creators yet. They show up here once they join."}
            </p>
          ) : (
            sorted.map((c) => (
              <div
                key={c.id}
                role="button"
                onClick={() => router.push(`/manager/creators/${c.id}`)}
                className="flex cursor-pointer items-center gap-3 border-t border-line px-5 py-3 transition-colors duration-[160ms] ease-om hover:bg-fill-quiet"
              >
                <CreatorAvatar name={c.name} url={c.avatarUrl} size={34} />
                <span className="min-w-0 flex-1">
                  <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-bold text-ink">
                    {c.name}
                  </span>
                  {c.status === "Active" ? (
                    <span className="mt-px block text-[12px] font-semibold text-slate-400">
                      Active
                    </span>
                  ) : (
                    <span className="mt-px block text-[12px] font-semibold text-amber">
                      Invite sent
                    </span>
                  )}
                </span>
                <Stat
                  value={String(c.posts)}
                  label="Posts"
                  className="hidden sm:block"
                />
                <Stat value={fmtViews(c.views)} label="Views" />
                {viewFinancials ? (
                  <Stat
                    value={formatCents(c.earnedMonthCents)}
                    label="This month"
                  />
                ) : null}
                <ChevronRight size={15} className="shrink-0 text-slate-400" />
              </div>
            ))
          )}
        </Card>

        {roster.invites.length > 0 ? (
          <Card pad={0}>
            <div className="px-5 py-4">
              <Label>Invited · {roster.invites.length}</Label>
              <span className="mt-[3px] block text-[13px] font-semibold text-slate-400">
                Waiting on an email. They join the roster the moment they sign
                in.
              </span>
            </div>
            {roster.invites.map((i) => (
              <div
                key={i.id}
                className="flex items-center gap-3 border-t border-line px-5 py-3"
              >
                <CreatorAvatar name={i.name} url={null} size={34} />
                <span className="min-w-0 flex-1">
                  <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-bold text-ink">
                    {i.name}
                  </span>
                  <span className="mt-px block overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px] font-semibold text-slate-400">
                    {i.email}
                  </span>
                </span>
                <span className="hidden text-[12.5px] font-semibold text-slate-400 sm:block">
                  {shortDate(i.sentAt)}
                </span>
                <Chip tone="amber">
                  <Clock size={12} /> Invite sent
                </Chip>
              </div>
            ))}
          </Card>
        ) : null}
      </div>

      {inviting ? (
        <InviteCreatorModal
          companyName={companyName}
          onClose={() => setInviting(false)}
        />
      ) : null}
    </div>
  );
}

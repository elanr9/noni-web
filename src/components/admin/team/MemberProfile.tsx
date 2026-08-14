"use client";

import { ChevronRight, Images, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { removeTeamMember } from "@/app/admin/team/actions";
import { PostDetailCard } from "@/components/admin/analytics/PostDetailCard";
import { fmtK, money } from "@/components/admin/posts/format";
import { Avatar, Card, Chip, Label, Modal, PageHead, Pill } from "@/components/kit";
import type { AdminBrief, AdminPost, Member } from "@/lib/admin/types";

/* Full member profile page (ProfilePage in AdminAnalytics.jsx): back arrow,
   contact card; creators get a stat strip + clickable posts that drill into
   the post detail; campaign managers get the company's briefs list. */
export function MemberProfile({
  member,
  companyName,
  posts,
  briefs,
  canRemove = false,
}: {
  member: Member;
  companyName: string;
  posts: AdminPost[];
  briefs: AdminBrief[];
  canRemove?: boolean;
}) {
  const router = useRouter();
  const [post, setPost] = useState<AdminPost | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isCreator = member.role === "Creator";
  const pendingInvite = member.id.startsWith("invite-");

  const remove = () => {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const result = await removeTeamMember(member.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/team");
      router.refresh();
    });
  };

  if (post) {
    return (
      <div>
        <Card pad={22}>
          <PostDetailCard post={post} onBack={() => setPost(null)} />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHead
        onBack={() => router.push("/admin/team")}
        title={member.name}
        sub={`${member.role} · joined ${member.joined}`}
        right={
          <div className="flex items-center gap-2.5">
            {member.status === "Active" ? (
              <Chip tone="green">Active</Chip>
            ) : (
              <Chip tone="amber">Invite sent</Chip>
            )}
            {canRemove ? (
              <Pill size="sm" variant="danger" onClick={() => setConfirming(true)}>
                Remove
              </Pill>
            ) : null}
          </div>
        }
      />
      <div className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-[300px_1fr]">
        <Card pad={0}>
          <div className="flex items-center gap-3 px-5 py-4">
            <Avatar name={member.name} size={42} />
            <span className="min-w-0">
              <span className="block text-[15px] font-bold text-ink">
                {member.name}
              </span>
              <span className="mt-0.5 block text-[12px] font-semibold text-slate-400">
                {member.role}
              </span>
            </span>
          </div>
          {(
            [
              ["Email", member.email],
              ["Joined", member.joined],
              ["Status", member.status],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="flex items-center gap-3 border-t border-line px-5 py-3"
            >
              <span className="w-16 shrink-0 text-[12.5px] font-semibold text-slate-400">
                {label}
              </span>
              <span className="min-w-0 flex-1 break-words text-[13.5px] font-bold text-ink">
                {value}
              </span>
            </div>
          ))}
        </Card>
        <div className="flex min-w-0 flex-col gap-3.5">
          {isCreator ? (
            <>
              <Card pad={22} className="flex flex-wrap gap-[18px]">
                {(
                  [
                    ["Posts this month", String(member.posts ?? 0)],
                    ["Views this month", member.viewsN ? fmtK(member.viewsN) : "0"],
                    ["Earned", money(member.earned ?? 0)],
                  ] as const
                ).map(([label, value]) => (
                  <span key={label} className="min-w-[130px] flex-1">
                    <span className="block text-[12px] font-semibold text-slate-400">
                      {label}
                    </span>
                    <span className="mt-[5px] block text-[26px] font-bold tracking-[-0.5px] text-ink">
                      {value}
                    </span>
                  </span>
                ))}
              </Card>
              <Card pad={0}>
                <Label className="block px-5 pb-2 pt-4">Posts</Label>
                {posts.length === 0 ? (
                  <p className="m-0 px-5 pb-[18px] pt-1 text-[13.5px] font-semibold text-slate-400">
                    Nothing published yet.
                  </p>
                ) : (
                  posts.map((q) => (
                    <div
                      key={q.id}
                      role="button"
                      onClick={() => setPost(q)}
                      className="flex cursor-pointer items-center gap-[13px] border-t border-line px-5 py-[13px] transition-colors duration-[160ms] ease-om hover:bg-fill-quiet"
                    >
                      <span className="inline-flex h-14 w-[42px] shrink-0 items-center justify-center bg-blue-100 rounded-[10px]">
                        {q.format === "Video" ? (
                          <Play size={15} className="text-blue-700" />
                        ) : (
                          <Images size={15} className="text-blue-700" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-bold text-ink">
                          {q.title}
                        </span>
                        <span className="mt-0.5 block text-[12.5px] font-semibold text-slate-400">
                          {q.publishedAt} · {q.format} · TikTok {fmtK(q.tt.views)} · IG{" "}
                          {fmtK(q.ig.views)}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-[15px] font-bold text-ink">
                          {fmtK(q.viewsN)}
                        </span>
                        <span className="mt-0.5 block text-[12px] font-bold text-green">
                          {money(q.earned)}
                        </span>
                      </span>
                      <ChevronRight size={15} className="shrink-0 text-slate-400" />
                    </div>
                  ))
                )}
              </Card>
            </>
          ) : (
            <>
              <Card pad={22}>
                <p className="m-0 text-[14px] font-semibold leading-[1.6] text-slate-500">
                  Runs {companyName}&apos;s weekly briefs and keeps creators on
                  pace, from the Noni app.
                </p>
              </Card>
              <Card pad={0}>
                <Label className="block px-5 pb-2 pt-4">Briefs this week</Label>
                {briefs.length === 0 ? (
                  <p className="m-0 px-5 pb-[18px] pt-1 text-[13.5px] font-semibold text-slate-400">
                    No briefs yet. They appear here as campaigns kick off.
                  </p>
                ) : (
                  briefs.map((b) => (
                    <div key={b.id} className="border-t border-line px-5 py-[13px]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="min-w-[160px] flex-1 text-[14px] font-bold text-ink">
                          {b.title}
                        </span>
                        <Chip tone="blue" style={{ padding: "3px 9px", fontSize: 11.5 }}>
                          {b.format}
                        </Chip>
                        <Chip
                          tone={b.status === "Active" ? "green" : "slate"}
                          style={{ padding: "3px 9px", fontSize: 11.5 }}
                        >
                          {b.status}
                        </Chip>
                      </div>
                      <div className="mt-[5px] text-[12.5px] font-semibold text-slate-400">
                        {b.day} ·{" "}
                        <span className="text-[10.5px] font-extrabold tracking-[0.7px]">
                          HOOK
                        </span>{" "}
                        {b.hook}
                      </div>
                    </div>
                  ))
                )}
              </Card>
            </>
          )}
        </div>
      </div>
      {confirming ? (
        <Modal
          title={pendingInvite ? `Cancel invite to ${member.name}?` : `Remove ${member.name}?`}
          onClose={() => !pending && setConfirming(false)}
        >
          <div className="flex flex-col gap-3.5">
            <p className="m-0 text-[14px] font-semibold leading-[1.55] text-slate-500">
              {pendingInvite
                ? `They will not be able to join ${companyName} until you invite them again.`
                : `They lose access to Noni for ${companyName}. You can invite them again later.`}
            </p>
            {error ? (
              <p className="m-0 text-[13px] font-semibold text-danger">{error}</p>
            ) : null}
            <div className="flex gap-2.5">
              <Pill
                variant="quiet"
                disabled={pending}
                onClick={() => setConfirming(false)}
                className="flex-1"
              >
                Keep them
              </Pill>
              <Pill
                variant="danger"
                disabled={pending}
                onClick={remove}
                className="flex-1"
              >
                {pending
                  ? pendingInvite
                    ? "Canceling…"
                    : "Removing…"
                  : pendingInvite
                    ? "Cancel invite"
                    : "Remove"}
              </Pill>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

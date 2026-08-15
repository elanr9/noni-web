"use client";

import { Link2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { signChatMedia } from "@/app/manager/creators/actions";
import { Card, PageHead } from "@/components/kit";
import { createClient } from "@/lib/supabase/client";

import { CreatorAvatar } from "./CreatorAvatar";
import { dayLabel, timeLabel } from "./format";

/* The one thread per creator, ported from the mobile repo's
   lib/messages-api.ts and AdminChatThread. Reads, the realtime
   subscription and sends all run client side as the signed-in campaign
   manager, so the same RLS policies the app uses apply here. */

type MessagePostRef = {
  assignmentId: string | null;
  briefId: string;
  title: string;
  format: string;
};

type ThreadMessage = {
  id: string;
  authorId: string;
  authorName: string;
  fromCreator: boolean;
  body: string;
  createdAt: string;
  postRef: MessagePostRef | null;
};

type BriefRef = { id: string; title: string; format: string } | null;

type MessageJoinRow = {
  id: string;
  author_id: string;
  creator_id: string;
  body: string;
  created_at: string;
  author: { id: string; full_name: string | null } | null;
  brief: BriefRef;
  assignment: { id: string; briefs: BriefRef } | null;
};

/* Same select as mobile listThread. */
const THREAD_SELECT =
  "*, author:author_id ( id, full_name ), brief:brief_id ( id, title, format ), assignment:assignment_id ( id, briefs:brief_id ( id, title, format ) )";

function toPostRef(row: MessageJoinRow): MessagePostRef | null {
  if (row.assignment?.briefs) {
    return {
      assignmentId: row.assignment.id,
      briefId: row.assignment.briefs.id,
      title: row.assignment.briefs.title,
      format: row.assignment.briefs.format,
    };
  }
  if (row.brief) {
    return {
      assignmentId: null,
      briefId: row.brief.id,
      title: row.brief.title,
      format: row.brief.format,
    };
  }
  return null;
}

/* Media messages ride in body as "[[media]]{json}\ncaption", same encoding
   as mobile parseMessageMedia. */
const MEDIA_PREFIX = "[[media]]";

type MessageMedia = {
  media: "image" | "video";
  url: string;
  len?: string;
};

function parseMessageMedia(body: string): {
  media: MessageMedia | null;
  text: string;
} {
  if (!body.startsWith(MEDIA_PREFIX)) return { media: null, text: body };
  const newline = body.indexOf("\n");
  const head = newline === -1 ? body : body.slice(0, newline);
  const text = newline === -1 ? "" : body.slice(newline + 1);
  try {
    const raw: unknown = JSON.parse(head.slice(MEDIA_PREFIX.length));
    if (raw !== null && typeof raw === "object") {
      const candidate = raw as { media?: unknown; url?: unknown; len?: unknown };
      if (
        (candidate.media === "image" || candidate.media === "video") &&
        typeof candidate.url === "string"
      ) {
        return {
          media: {
            media: candidate.media,
            url: candidate.url,
            ...(typeof candidate.len === "string" ? { len: candidate.len } : {}),
          },
          text,
        };
      }
    }
  } catch {
    /* Not a media header after all; treat the whole body as text. */
  }
  return { media: null, text: body };
}

function MediaBubble({
  media,
  signedUrl,
}: {
  media: MessageMedia;
  signedUrl: string | null | undefined;
}) {
  if (signedUrl === undefined) {
    return (
      <span className="block h-[140px] w-[200px] animate-pulse bg-fill-quiet rounded-[10px]" />
    );
  }
  if (signedUrl === null) {
    return (
      <span className="block text-[12.5px] font-semibold opacity-70">
        Attachment unavailable
      </span>
    );
  }
  if (media.media === "video") {
    return (
      <video
        src={signedUrl}
        controls
        preload="metadata"
        className="block max-h-[280px] max-w-full rounded-[10px]"
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- signed URLs are short-lived and off-origin
    <img
      src={signedUrl}
      alt=""
      className="block max-h-[280px] max-w-full rounded-[10px] object-cover"
    />
  );
}

export function ChatThread({
  companyId,
  creatorId,
  meId,
  creatorName,
  creatorAvatarUrl,
}: {
  companyId: string;
  creatorId: string;
  meId: string;
  creatorName: string;
  creatorAvatarUrl: string | null;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /* Signed URL per media path; undefined while signing. */
  const [mediaUrls, setMediaUrls] = useState<Map<string, string | null>>(
    new Map(),
  );
  const listRef = useRef<HTMLDivElement>(null);
  const requestedPaths = useRef(new Set<string>());

  /* Fetches the thread; state updates happen in the callers' promise
     callbacks so the effect body never sets state synchronously. */
  const fetchThread = useCallback(async (): Promise<ThreadMessage[] | null> => {
    const { data, error: readError } = await supabase
      .from("messages")
      .select(THREAD_SELECT)
      .eq("company_id", companyId)
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: true });
    if (readError) return null;
    return ((data ?? []) as unknown as MessageJoinRow[]).map((row) => ({
      id: row.id,
      authorId: row.author_id,
      authorName: row.author?.full_name?.trim() || "Someone",
      fromCreator: row.author_id === row.creator_id,
      body: row.body,
      createdAt: row.created_at,
      postRef: toPostRef(row),
    }));
  }, [supabase, companyId, creatorId]);

  useEffect(() => {
    let cancelled = false;
    const apply = (rows: ThreadMessage[] | null) => {
      if (cancelled) return;
      if (rows) setMessages(rows);
      setLoading(false);
    };
    fetchThread().then(apply, () => apply(null));
    const channel = supabase
      .channel(`manager-chat-${creatorId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `creator_id=eq.${creatorId}`,
        },
        () => void fetchThread().then(apply),
      )
      .subscribe();
    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [supabase, creatorId, fetchThread]);

  /* Sign chat media paths as they appear in the thread. */
  useEffect(() => {
    for (const m of messages) {
      const { media } = parseMessageMedia(m.body);
      if (!media || requestedPaths.current.has(media.url)) continue;
      requestedPaths.current.add(media.url);
      void signChatMedia(media.url).then((url) => {
        setMediaUrls((prev) => new Map(prev).set(media.url, url));
      });
    }
  }, [messages]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const send = async () => {
    const body = draft.trim();
    if (body.length === 0 || sending) return;
    setSending(true);
    setError(null);
    /* Same client-side insert as mobile sendMessage; RLS scopes it. */
    const { error: sendError } = await supabase.from("messages").insert({
      company_id: companyId,
      creator_id: creatorId,
      author_id: meId,
      body,
    });
    if (sendError) {
      setError("Could not send. Try again.");
      setSending(false);
      return;
    }
    /* Mirrors mobile: notify routes to the creator's device. */
    void supabase.functions.invoke("notify", {
      body: { creator_id: creatorId, event: "message" },
    });
    setDraft("");
    setSending(false);
    const rows = await fetchThread();
    if (rows) setMessages(rows);
  };

  const canSend = draft.trim().length > 0 && !sending;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHead
        onBack={() => router.push(`/manager/creators/${creatorId}`)}
        title={
          <span className="inline-flex items-center gap-3">
            <CreatorAvatar name={creatorName} url={creatorAvatarUrl} size={36} />
            {creatorName}
          </span>
        }
      />
      <Card
        pad={0}
        className="flex min-h-[420px] flex-1 flex-col overflow-hidden"
        style={{ height: "calc(100vh - 210px)" }}
      >
        <div
          ref={listRef}
          className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-4 py-4 sm:px-5"
        >
          {loading ? (
            <div className="flex flex-col gap-3">
              <span className="block h-14 w-[62%] animate-pulse self-start bg-fill-quiet rounded-[16px]" />
              <span className="block h-14 w-[62%] animate-pulse self-end bg-fill-quiet rounded-[16px]" />
              <span className="block h-14 w-[62%] animate-pulse self-start bg-fill-quiet rounded-[16px]" />
            </div>
          ) : messages.length === 0 ? (
            <p className="m-0 mt-6 text-center text-[13.5px] font-semibold text-slate-400">
              No messages yet. Say hello.
            </p>
          ) : (
            messages.map((m, i) => {
              const prev = messages[i - 1];
              const newDay =
                !prev ||
                new Date(prev.createdAt).toDateString() !==
                  new Date(m.createdAt).toDateString();
              const mine = !m.fromCreator;
              const { media, text } = parseMessageMedia(m.body);
              return (
                <div key={m.id} className="flex flex-col">
                  {newDay ? (
                    <span className="my-3 self-center text-[11px] font-extrabold uppercase tracking-[0.9px] text-slate-400">
                      {dayLabel(m.createdAt)}
                    </span>
                  ) : null}
                  <div
                    className={`flex max-w-[78%] flex-col gap-1 sm:max-w-[62%] ${
                      mine ? "self-end items-end" : "self-start items-start"
                    }`}
                  >
                    <div
                      className={`px-3.5 py-2.5 text-[13.5px] font-semibold leading-[1.5] rounded-[16px] ${
                        mine
                          ? "bg-blue-500 text-white rounded-br-[5px]"
                          : "bg-fill-quiet text-ink rounded-bl-[5px]"
                      }`}
                    >
                      {m.postRef ? (
                        <span
                          className={`mb-1.5 flex items-center gap-1.5 text-[11.5px] font-bold ${
                            mine ? "text-white/80" : "text-blue-700"
                          }`}
                        >
                          <Link2 size={12} className="shrink-0" />
                          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                            {m.postRef.title}
                          </span>
                        </span>
                      ) : null}
                      {media ? (
                        <MediaBubble
                          media={media}
                          signedUrl={mediaUrls.get(media.url)}
                        />
                      ) : null}
                      {text ? (
                        <span className="block whitespace-pre-wrap break-words">
                          {text}
                        </span>
                      ) : null}
                    </div>
                    <span className="px-1 text-[11px] font-semibold text-slate-400">
                      {mine && m.authorId !== meId ? `${m.authorName} · ` : ""}
                      {timeLabel(m.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-line bg-white px-4 py-3 sm:px-5">
          {error ? (
            <p className="m-0 mb-2 text-[12.5px] font-semibold text-danger">
              {error}
            </p>
          ) : null}
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="Message"
              rows={1}
              className="max-h-[120px] min-h-[44px] flex-1 resize-none border-none bg-fill-quiet px-4 py-3 text-[13.5px] font-semibold text-ink outline-none rounded-[22px] placeholder:text-slate-400"
            />
            <button
              type="button"
              aria-label="Send"
              onClick={() => void send()}
              disabled={!canSend}
              className={`inline-flex h-[44px] w-[44px] shrink-0 cursor-pointer items-center justify-center border-none bg-blue-500 text-white rounded-pill ${
                canSend ? "shadow-accent" : "pointer-events-none opacity-40"
              }`}
            >
              <Send size={17} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

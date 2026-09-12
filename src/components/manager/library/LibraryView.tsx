"use client";

/* The /manager Library tab, porting the mobile Library screen
   (noni/app/(admin)/(tabs)/library.tsx): Ideas, References, Media and Our
   posts lanes. Ideas and references split into Unused and Used, remember
   the last post made from them, and every row offers Make post, which
   generates into an empty slot of the week being planned. */
import {
  ArrowUpDown,
  Images,
  Link2,
  Loader2,
  Play,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import {
  captureLibraryItem,
  deleteLibraryItem,
  loadLibraryItems,
  loadOurPosts,
  makePostFromLibrary,
  resolveOurPostThumbnail,
  updateLibraryItemText,
  type MakeSource,
  type OurPostRef,
} from "@/app/manager/library/actions";
import { Card, Modal, PageHead, Pill, Tabs } from "@/components/kit";
import type { BriefFormat, PostType } from "@/components/manager/briefs/lib";
import type {
  CreatorOption,
  LibraryCounts,
  LibraryItem,
  LibrarySource,
  OurPost,
  OurPostsSort,
} from "@/lib/manager/library";

const LIBRARY_PAGE_SIZE = 50;

import { MakePostModal, type MakeTarget } from "./MakePostModal";
import { SubTabs } from "./SubTabs";

const LANES = ["Ideas", "References", "Media", "Our posts"] as const;
type Lane = (typeof LANES)[number];
type UsedTab = "unused" | "used";

const SEARCH_DEBOUNCE_MS = 350;
const TOAST_MS = 1800;
const SOCIAL_LINK = /(tiktok\.com|instagram\.com)\//i;

type Row = { kind: "item"; item: LibraryItem } | { kind: "our_post"; post: OurPost };

const EMPTY: Record<LibrarySource, Record<UsedTab, { icon: LucideIcon; title: string; body: string }>> = {
  idea: {
    unused: {
      icon: Sparkles,
      title: "No ideas yet",
      body: "Type one line above and save. Paste a whole doc to save one idea per line.",
    },
    used: {
      icon: Sparkles,
      title: "Nothing used yet",
      body: "Ideas move here the moment you make a post from them.",
    },
  },
  reference: {
    unused: {
      icon: Link2,
      title: "No references yet",
      body: "Paste a TikTok or Instagram link above. It saves with a thumbnail and title.",
    },
    used: {
      icon: Link2,
      title: "Nothing used yet",
      body: "References move here the moment you make a post from them.",
    },
  },
};

function shortDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fmtViews(n: number | null): string {
  const v = n ?? 0;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${Math.round(v / 1e3)}k`;
  return String(v);
}

function handleOf(url: string | null): string | null {
  const match = url?.match(/@([A-Za-z0-9._]+)/);
  return match ? match[1] : null;
}

function platformOf(url: string | null): string | null {
  if (!url) return null;
  if (/tiktok\.com/i.test(url)) return "TikTok";
  if (/instagram\.com/i.test(url)) return "Instagram";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function rowKey(row: Row): string {
  return row.kind === "item" ? row.item.id : row.post.post_id;
}

function toPostRef(post: OurPost): OurPostRef {
  return {
    post_id: post.post_id,
    brief_id: post.brief_id,
    post_url: post.post_url,
    creator_id: post.creator_id,
    post_type_id: post.post_type_id,
    title: post.title,
    hook: post.hook,
    library_item_id: post.library_item_id,
  };
}

function canMake(row: Row): boolean {
  if (row.kind === "our_post") return Boolean(row.post.brief_id || row.post.post_url);
  return Boolean(row.item.url || row.item.text);
}

function sourceLabelFor(row: Row): string {
  if (row.kind === "our_post") return `“${row.post.title ?? row.post.hook ?? "this post"}”`;
  if (row.item.source === "reference") {
    const handle = handleOf(row.item.url);
    return [handle ? `@${handle}` : (row.item.text ?? "this reference"), platformOf(row.item.url)]
      .filter(Boolean)
      .join(" · ");
  }
  const text = row.item.text ?? "";
  return `“${text.length > 80 ? `${text.slice(0, 77)}…` : text}”`;
}

function preferredFamilyFor(row: Row): BriefFormat | null {
  if (row.kind !== "our_post") return null;
  return row.post.family === "photo_carousel" ? "photo_carousel" : "video";
}

interface MakeProps {
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
}

function MakeButton({ make }: { make: MakeProps }) {
  return (
    <Pill
      variant="tint"
      size="sm"
      icon={make.busy ? Loader2 : Wand2}
      disabled={make.disabled}
      onClick={make.onClick}
      className={make.busy ? "[&_svg]:animate-spin" : ""}
    >
      Make post
    </Pill>
  );
}

function UsedMeta({
  usedCount,
  date,
  onOpen,
}: {
  usedCount: number;
  date: string | null;
  onOpen?: () => void;
}) {
  if (usedCount <= 0) return null;
  const text = [`Used ${usedCount}x`, date].filter(Boolean).join(" · ");
  return onOpen ? (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      className="cursor-pointer border-none bg-transparent p-0 text-[12px] font-bold text-blue-700 hover:underline"
    >
      {text}
    </button>
  ) : (
    <span className="text-[12px] font-semibold text-slate-400">{text}</span>
  );
}

function IdeaRow({
  item,
  onSaveText,
  onDelete,
  onOpenBrief,
  make,
}: {
  item: LibraryItem;
  onSaveText: (text: string) => void;
  onDelete: () => void;
  onOpenBrief?: () => void;
  make: MakeProps | null;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  function commit() {
    setEditing(false);
    const next = draft.trim();
    if (next.length > 0 && next !== item.text) onSaveText(next);
  }

  return (
    <div className="flex items-center gap-3 border-b border-line px-3.5 py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        {editing ? (
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                commit();
              }
              if (e.key === "Escape") setEditing(false);
            }}
            rows={2}
            className="block w-full resize-none border-none bg-blue-50 p-2 text-[13.5px] font-semibold leading-snug text-ink outline-none rounded-[8px]"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(item.text ?? "");
              setEditing(true);
            }}
            className="block w-full cursor-text border-none bg-transparent p-0 text-left text-[13.5px] font-semibold leading-snug text-ink"
          >
            {item.text}
          </button>
        )}
        <div className="mt-0.5">
          <UsedMeta usedCount={item.used_count} date={shortDate(item.last_used_at)} onOpen={onOpenBrief} />
        </div>
      </div>
      {make ? <MakeButton make={make} /> : null}
      <button
        type="button"
        aria-label="Delete idea"
        onClick={onDelete}
        className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent text-slate-300 rounded-pill hover:bg-fill-quiet hover:text-danger"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function Thumb({
  url,
  format,
  className,
}: {
  url: string | null;
  format: BriefFormat;
  className: string;
}) {
  const Icon = format === "photo_carousel" ? Images : Play;
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className={`${className} shrink-0 object-cover rounded-[10px]`} />
  ) : (
    <span className={`${className} inline-flex shrink-0 items-center justify-center bg-blue-100 rounded-[10px]`}>
      <Icon size={15} className="text-blue-700" />
    </span>
  );
}

function ReferenceCard({
  item,
  onDelete,
  onOpenBrief,
  make,
}: {
  item: LibraryItem;
  onDelete: () => void;
  onOpenBrief?: () => void;
  make: MakeProps | null;
}) {
  const title = item.text?.trim() || item.url?.replace(/^https?:\/\/(www\.)?/, "") || "";
  const handle = handleOf(item.url);
  const sub = [handle ? `@${handle}` : null, platformOf(item.url)].filter(Boolean).join(" · ");
  return (
    <div className="flex items-center gap-3 border border-line bg-white p-3 shadow-card rounded-[14px]">
      <Thumb url={item.thumbnail_url} format="video" className="h-[62px] w-[46px]" />
      <div className="min-w-0 flex-1">
        <a
          href={item.url ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate text-[13.5px] font-bold text-ink no-underline hover:underline"
        >
          {title}
        </a>
        {sub ? <span className="block truncate text-[12px] font-semibold text-slate-400">{sub}</span> : null}
        {item.notes ? (
          <span className="block truncate text-[12px] font-medium italic text-slate-500">{item.notes}</span>
        ) : null}
        <div className="mt-0.5">
          <UsedMeta usedCount={item.used_count} date={shortDate(item.last_used_at)} onOpen={onOpenBrief} />
        </div>
      </div>
      {make ? <MakeButton make={make} /> : null}
      <button
        type="button"
        aria-label="Delete reference"
        onClick={onDelete}
        className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent text-slate-300 rounded-pill hover:bg-fill-quiet hover:text-danger"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function OurPostRow({
  post,
  onNeedThumbnail,
  make,
}: {
  post: OurPost;
  onNeedThumbnail: (post: OurPost) => void;
  make: MakeProps | null;
}) {
  const needsThumb = !post.thumbnail_url && Boolean(post.post_url);
  useEffect(() => {
    if (needsThumb) onNeedThumbnail(post);
    // Only the first render should kick off enrichment for this row.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.post_id]);

  const format: BriefFormat = post.family === "photo_carousel" ? "photo_carousel" : "video";
  const bits: string[] = [];
  if (post.creator_name) bits.push(post.creator_name);
  if (post.post_type_label) bits.push(post.post_type_label);
  bits.push(format === "photo_carousel" ? "Slideshow" : "Reel");
  const date = shortDate(post.posted_at);
  if (date) bits.push(date);

  return (
    <div className="flex items-center gap-3 border-b border-line px-3.5 py-2.5 last:border-b-0">
      <Thumb url={post.thumbnail_url} format={format} className="h-[45px] w-[34px]" />
      <div className="min-w-0 flex-1">
        {post.post_url ? (
          <a
            href={post.post_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-[13.5px] font-bold text-ink no-underline hover:underline"
          >
            {post.title ?? post.hook ?? ""}
          </a>
        ) : (
          <span className="block truncate text-[13.5px] font-bold text-ink">{post.title ?? post.hook ?? ""}</span>
        )}
        <span className="block truncate text-[12px] font-semibold text-slate-400">{bits.join(" · ")}</span>
        {(post.used_count ?? 0) > 0 ? (
          <span className="block text-[12px] font-bold text-blue-700">{`Used ${post.used_count}x`}</span>
        ) : null}
      </div>
      <span className="shrink-0 text-[12.5px] font-bold tabular-nums text-slate-500">
        {fmtViews(post.views)} views
      </span>
      {make ? <MakeButton make={make} /> : null}
    </div>
  );
}

function QuickCapture({
  mode,
  onSaved,
  onError,
}: {
  mode: LibrarySource;
  onSaved: (message: string, reference: boolean) => void;
  onError: (message: string) => void;
}) {
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();
  const trimmed = value.trim();
  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const isUrl = /^https?:\/\/\S+$/i.test(trimmed) && !trimmed.includes("\n");
  const bulkCount = !isUrl && lines.length >= 2 ? lines.length : 0;
  const showNotes = mode === "reference" && isUrl;

  function save() {
    if (trimmed.length === 0 || pending) return;
    if (mode === "reference" && (!isUrl || !SOCIAL_LINK.test(trimmed))) {
      onError("Paste a TikTok or Instagram link first");
      return;
    }
    const raw = value;
    const rawNotes = mode === "reference" ? notes : "";
    setValue("");
    setNotes("");
    startTransition(async () => {
      const result = await captureLibraryItem(raw, rawNotes || null);
      if (!result.ok) {
        setValue(raw);
        setNotes(rawNotes);
        onError(result.error);
        return;
      }
      if (result.reference) {
        onSaved(mode === "idea" ? "That was a link, saved under References" : "Reference saved", true);
      } else {
        onSaved(result.ideas === 1 ? "Idea saved" : `${result.ideas} ideas saved`, false);
      }
    });
  }

  return (
    <div>
      <div
        className={`flex items-end gap-2 border-2 bg-white p-3 transition-colors duration-[160ms] ease-om rounded-[14px] ${
          trimmed.length > 0 ? "border-blue-500" : "border-line-strong"
        }`}
      >
        {mode === "idea" ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                save();
              }
            }}
            placeholder="Type a post idea"
            rows={value.includes("\n") ? 3 : 1}
            className="block w-full resize-none border-none bg-transparent p-0 text-[14px] font-normal leading-normal text-ink outline-none placeholder:text-slate-400"
          />
        ) : (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
            }}
            placeholder="Paste a TikTok or Instagram link"
            type="url"
            className="block w-full border-none bg-transparent p-0 text-[14px] font-normal text-ink outline-none placeholder:text-slate-400"
          />
        )}
        <Pill size="sm" icon={Plus} disabled={trimmed.length === 0 || pending} onClick={save}>
          Save
        </Pill>
      </div>
      {showNotes ? (
        <div className="mt-2 flex flex-col gap-1">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes. How should this translate to our product?"
            rows={2}
            className="block w-full resize-y border border-line bg-white px-3 py-2.5 text-[13.5px] font-normal leading-normal text-ink outline-none rounded-[12px] placeholder:text-slate-400 focus:border-blue-500"
          />
          <span className="text-[12px] font-semibold text-slate-400">
            The AI reads these notes every time a post is made from this reference.
          </span>
        </div>
      ) : null}
      {bulkCount > 0 ? (
        <p className="mb-0 mt-1.5 text-[12px] font-bold text-blue-700">{bulkCount} ideas will be saved</p>
      ) : null}
    </div>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex h-[38px] flex-1 items-center gap-2 border border-line bg-white px-3 rounded-pill focus-within:border-blue-500">
      <Search size={14} className="shrink-0 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-none bg-transparent p-0 text-[13.5px] font-semibold text-ink outline-none placeholder:text-slate-400"
      />
    </div>
  );
}

function EmptyState({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <Card pad={22} className="py-12 text-center">
      <span className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center bg-fill-quiet rounded-pill">
        <Icon size={18} className="text-slate-400" />
      </span>
      <p className="m-0 text-[15px] font-bold text-ink">{title}</p>
      <p className="mx-auto mb-0 mt-1 max-w-[340px] text-[13px] font-semibold text-slate-400">{body}</p>
    </Card>
  );
}

export interface LibraryViewProps {
  initialIdeas: LibraryItem[];
  initialCounts: Record<LibrarySource, LibraryCounts>;
  creators: CreatorOption[];
  postTypes: PostType[];
}

export function LibraryView({ initialIdeas, initialCounts, creators, postTypes }: LibraryViewProps) {
  const router = useRouter();
  const [lane, setLane] = useState<Lane>("Ideas");
  const [sub, setSub] = useState<UsedTab>("unused");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<OurPostsSort>("top");
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [postTypeId, setPostTypeId] = useState<string | null>(null);

  const [rows, setRows] = useState<Row[]>(initialIdeas.map((item) => ({ kind: "item", item })));
  const [counts, setCounts] = useState(initialCounts);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [endReached, setEndReached] = useState(initialIdeas.length < LIBRARY_PAGE_SIZE);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<LibraryItem | null>(null);
  const [killNote, setKillNote] = useState<string | null>(null);

  const [makeFrom, setMakeFrom] = useState<Row | null>(null);
  const [makeBusyKey, setMakeBusyKey] = useState<string | null>(null);

  const queryVersion = useRef(0);
  const firstLoad = useRef(true);
  const enriching = useRef(new Set<string>());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const itemSource: LibrarySource | null =
    lane === "Ideas" ? "idea" : lane === "References" ? "reference" : null;

  function flash(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }

  const loadPage = useCallback(
    async (offset: number) => {
      if (lane === "Media") return;
      const version = ++queryVersion.current;
      if (offset === 0) setLoading(true);
      else setLoadingMore(true);
      setLoadError(null);
      let next: Row[] = [];
      let error: string | null = null;
      if (lane === "Our posts") {
        const result = await loadOurPosts({ sort, creatorId, postTypeId, search, offset });
        if (result.ok) next = result.posts.map((post): Row => ({ kind: "our_post", post }));
        else error = result.error;
      } else {
        const source: LibrarySource = lane === "Ideas" ? "idea" : "reference";
        const result = await loadLibraryItems({
          source,
          search,
          used: sub === "unused" ? "new" : "made",
          offset,
        });
        if (result.ok) {
          next = result.items.map((item): Row => ({ kind: "item", item }));
          setCounts((prev) => ({ ...prev, [source]: result.counts }));
        } else error = result.error;
      }
      if (version !== queryVersion.current) return;
      if (error !== null) setLoadError(error);
      else {
        setEndReached(next.length < LIBRARY_PAGE_SIZE);
        setRows((prev) => (offset === 0 ? next : [...prev, ...next]));
      }
      setLoading(false);
      setLoadingMore(false);
    },
    [lane, sub, search, sort, creatorId, postTypeId],
  );

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    const timer = setTimeout(() => void loadPage(0), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [loadPage]);

  function switchLane(next: Lane) {
    if (next === "Media") {
      router.push("/manager/media");
      return;
    }
    if (next === lane) return;
    setRows([]);
    setSearch("");
    setSub("unused");
    setLane(next);
  }

  function switchSub(next: UsedTab) {
    if (next === sub) return;
    setRows([]);
    setSub(next);
  }

  function openBrief(briefId: string) {
    router.push(`/manager/briefs/${briefId}`);
  }

  function patchItem(id: string, patch: Partial<LibraryItem>) {
    setRows((prev) =>
      prev.map((row) =>
        row.kind === "item" && row.item.id === id ? { kind: "item", item: { ...row.item, ...patch } } : row,
      ),
    );
  }

  function patchPost(postId: string, patch: Partial<OurPost>) {
    setRows((prev) =>
      prev.map((row) =>
        row.kind === "our_post" && row.post.post_id === postId
          ? { kind: "our_post", post: { ...row.post, ...patch } }
          : row,
      ),
    );
  }

  function bumpCounts(source: LibrarySource, from: UsedTab, to: UsedTab | null) {
    setCounts((prev) => ({
      ...prev,
      [source]: {
        unused: prev[source].unused + (from === "unused" ? -1 : 0) + (to === "unused" ? 1 : 0),
        used: prev[source].used + (from === "used" ? -1 : 0) + (to === "used" ? 1 : 0),
      },
    }));
  }

  function onSaved(message: string, reference: boolean) {
    flash(message);
    if (reference && lane === "Ideas") {
      setCounts((prev) => ({
        ...prev,
        reference: { ...prev.reference, unused: prev.reference.unused + 1 },
      }));
      return;
    }
    if (sub !== "unused") {
      setRows([]);
      setSub("unused");
    } else void loadPage(0);
  }

  function onSaveIdeaText(item: LibraryItem, text: string) {
    patchItem(item.id, { text });
    void updateLibraryItemText(item.id, text).then((result) => {
      if (!result.ok) {
        patchItem(item.id, { text: item.text });
        flash(result.error);
      }
    });
  }

  function onDeleteConfirmed() {
    const item = confirmDelete;
    if (!item) return;
    setConfirmDelete(null);
    setRows((prev) => prev.filter((row) => rowKey(row) !== item.id));
    const source: LibrarySource = item.source === "reference" ? "reference" : "idea";
    bumpCounts(source, item.used_count > 0 ? "used" : "unused", null);
    void deleteLibraryItem(item.id).then((result) => {
      if (!result.ok) {
        flash(result.error);
        void loadPage(0);
      }
    });
  }

  function onNeedThumbnail(post: OurPost) {
    if (enriching.current.has(post.post_id)) return;
    enriching.current.add(post.post_id);
    void resolveOurPostThumbnail(toPostRef(post))
      .then((result) => {
        if (result.ok && result.url) patchPost(post.post_id, { thumbnail_url: result.url });
      })
      .finally(() => enriching.current.delete(post.post_id));
  }

  async function buildPost(row: Row, target: MakeTarget) {
    const { slot, postType } = target;
    const source: MakeSource =
      row.kind === "item" ? { kind: "item", itemId: row.item.id } : { kind: "our_post", post: toPostRef(row.post) };
    setMakeBusyKey(rowKey(row));
    const result = await makePostFromLibrary({
      source,
      briefId: slot.briefId,
      postTypeId: postType.id,
      postTypeKey: postType.key,
      family: slot.family,
    });
    setMakeBusyKey(null);
    if (!result.ok) {
      flash(result.error);
      return;
    }
    if (result.kind === "kill") {
      setMakeFrom(null);
      setKillNote(result.killReason);
      return;
    }
    const now = new Date().toISOString();
    if (row.kind === "item") {
      const source: LibrarySource = row.item.source === "reference" ? "reference" : "idea";
      if (sub === "unused") {
        setRows((prev) => prev.filter((r) => rowKey(r) !== row.item.id));
        if (row.item.used_count === 0) bumpCounts(source, "unused", "used");
      } else {
        patchItem(row.item.id, {
          used_count: row.item.used_count + 1,
          last_used_at: now,
          last_brief_id: slot.briefId,
        });
      }
    } else {
      patchPost(row.post.post_id, { used_count: (row.post.used_count ?? 0) + 1 });
    }
    setMakeFrom(null);
    flash(
      `Made into ${slot.family === "photo_carousel" ? "Slideshow" : "Reel"} ${String(slot.laneIndex).padStart(2, "0")}`,
    );
    openBrief(result.briefId);
  }

  function makeFor(row: Row): MakeProps | null {
    if (!canMake(row)) return null;
    return {
      busy: makeBusyKey === rowKey(row),
      disabled: makeBusyKey !== null,
      onClick: () => setMakeFrom(row),
    };
  }

  const activeFilters = (creatorId ? 1 : 0) + (postTypeId ? 1 : 0);
  const laneCounts = itemSource ? counts[itemSource] : null;

  function renderEmpty() {
    if (loading) {
      return (
        <div className="flex justify-center py-10">
          <Loader2 size={20} className="animate-spin text-slate-300" />
        </div>
      );
    }
    if (loadError !== null) {
      return <p className="my-8 text-center text-[14px] font-medium text-danger">{loadError}</p>;
    }
    if (lane === "Our posts") {
      return search.length > 0 || activeFilters > 0 ? (
        <p className="my-8 text-center text-[14px] font-medium text-slate-400">No posts match these filters</p>
      ) : (
        <EmptyState icon={Play} title="No posts yet" body="Every post you publish lands here the day it goes live." />
      );
    }
    if (!itemSource) return null;
    if (search.length > 0) {
      return (
        <p className="my-8 text-center text-[14px] font-medium text-slate-400">
          {itemSource === "idea" ? "No ideas match" : "No references match"}
        </p>
      );
    }
    const copy = EMPTY[itemSource][sub];
    return <EmptyState icon={copy.icon} title={copy.title} body={copy.body} />;
  }

  function renderRows() {
    if (lane === "Our posts" || lane === "Ideas") {
      return (
        <Card pad={0} className="overflow-hidden">
          {rows.map((row) => {
            if (row.kind === "our_post") {
              return (
                <OurPostRow key={row.post.post_id} post={row.post} onNeedThumbnail={onNeedThumbnail} make={makeFor(row)} />
              );
            }
            const briefId = row.item.last_brief_id;
            return (
              <IdeaRow
                key={row.item.id}
                item={row.item}
                onSaveText={(text) => onSaveIdeaText(row.item, text)}
                onDelete={() => setConfirmDelete(row.item)}
                onOpenBrief={briefId ? () => openBrief(briefId) : undefined}
                make={makeFor(row)}
              />
            );
          })}
        </Card>
      );
    }
    return (
      <div className="flex flex-col gap-2">
        {rows.map((row) => {
          if (row.kind !== "item") return null;
          const briefId = row.item.last_brief_id;
          return (
            <ReferenceCard
              key={row.item.id}
              item={row.item}
              onDelete={() => setConfirmDelete(row.item)}
              onOpenBrief={briefId ? () => openBrief(briefId) : undefined}
              make={makeFor(row)}
            />
          );
        })}
      </div>
    );
  }

  const selectClass =
    "h-[38px] cursor-pointer border border-line bg-white px-3 text-[13px] font-bold text-ink outline-none rounded-pill focus:border-blue-500";

  return (
    <div>
      <PageHead title="Library" sub="Post ideas, saved references, shared media and everything your creators have published." />
      <Tabs
        tabs={LANES}
        active={lane}
        onSelect={switchLane}
        right={toast !== null ? <span className="text-[12px] font-bold text-green">{toast}</span> : null}
      />

      {itemSource !== null ? (
        <div className="mb-4 flex flex-col gap-3">
          <QuickCapture mode={itemSource} onSaved={onSaved} onError={flash} />
          <SubTabs<UsedTab>
            items={[
              { id: "unused", label: "Unused", count: laneCounts?.unused },
              { id: "used", label: "Used", count: laneCounts?.used },
            ]}
            value={sub}
            onChange={switchSub}
          />
          {rows.length > 0 || search.length > 0 ? (
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder={
                itemSource === "idea"
                  ? sub === "used"
                    ? "Search used ideas"
                    : "Search unused ideas"
                  : sub === "used"
                    ? "Search used references"
                    : "Search unused references"
              }
            />
          ) : null}
        </div>
      ) : null}

      {lane === "Our posts" ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <SearchBox value={search} onChange={setSearch} placeholder="Search posts" />
          <button
            type="button"
            aria-label="Change sort"
            onClick={() => setSort(sort === "top" ? "recent" : "top")}
            className="inline-flex h-[38px] cursor-pointer items-center gap-1 border-none bg-fill-quiet px-3 text-[13px] font-bold text-slate-500 rounded-pill"
          >
            {sort === "top" ? "Top 60d" : "Recent"}
            <ArrowUpDown size={13} />
          </button>
          <select
            aria-label="Filter by creator"
            value={creatorId ?? ""}
            onChange={(e) => setCreatorId(e.target.value || null)}
            className={selectClass}
          >
            <option value="">All creators</option>
            {creators.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name ?? "Creator"}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by post type"
            value={postTypeId ?? ""}
            onChange={(e) => setPostTypeId(e.target.value || null)}
            className={selectClass}
          >
            <option value="">All types</option>
            {postTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {rows.length === 0 ? (
        renderEmpty()
      ) : (
        <>
          {renderRows()}
          {!endReached ? (
            <div className="mt-3 flex justify-center">
              <Pill
                variant="quiet"
                size="sm"
                disabled={loadingMore}
                onClick={() => void loadPage(rows.length)}
              >
                {loadingMore ? "Loading more" : "Load more"}
              </Pill>
            </div>
          ) : null}
        </>
      )}

      {makeFrom !== null ? (
        <MakePostModal
          sourceLabel={sourceLabelFor(makeFrom)}
          preferredFamily={preferredFamilyFor(makeFrom)}
          busy={makeBusyKey !== null}
          onPick={(target) => void buildPost(makeFrom, target)}
          onOpenWeek={(campaignId) => {
            setMakeFrom(null);
            router.push(`/manager/briefs/week/${campaignId}`);
          }}
          onClose={() => setMakeFrom(null)}
        />
      ) : null}

      {confirmDelete !== null ? (
        <Modal
          title={confirmDelete.source === "reference" ? "Delete this reference?" : "Delete this idea?"}
          onClose={() => setConfirmDelete(null)}
        >
          <p className="mb-0 text-[14.5px] font-semibold leading-normal text-slate-500">
            Posts made from it are not affected.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Pill variant="quiet" onClick={() => setConfirmDelete(null)}>
              Keep
            </Pill>
            <Pill variant="danger" icon={Trash2} onClick={onDeleteConfirmed}>
              Delete
            </Pill>
          </div>
        </Modal>
      ) : null}

      {killNote !== null ? (
        <Modal title="Not made" onClose={() => setKillNote(null)}>
          <p className="mb-0 text-[14.5px] font-semibold leading-normal text-slate-500">{killNote}</p>
          <div className="mt-5 flex justify-end">
            <Pill variant="quiet" onClick={() => setKillNote(null)}>
              Close
            </Pill>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

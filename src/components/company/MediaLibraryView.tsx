"use client";

/* The shared Media library, rendered at /admin/media and /manager/media.
   One company has one library and one theme color, used by its company
   admin and every campaign manager, and read by the app's screenshot
   picker (mobile lib/media-library-api.ts). Files upload straight from
   the browser (lib/media-library-upload.ts); the server actions only own
   the rows and companies.settings. */
import { MediaGuide } from "@/components/company/MediaGuide";
import { PostTextPreview } from "@/components/company/PostTextPreview";
import { Check, ChevronLeft, ChevronRight, Clapperboard, Images, Pencil, Play, Plus, Trash2, Video } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from "react";

import {
  addMediaLibraryItem,
  removeMediaLibraryItem,
  renameMediaLibraryItem,
  saveThemeColor,
} from "@/app/manager/media/actions";
import { Card, Modal, PageHead, Pill } from "@/components/kit";
import type { MediaLibraryItem } from "@/lib/media-library";
import {
  checkMediaFile,
  extensionForContentType,
  formatDuration,
  normalizeThemeHex,
  THEME_SWATCHES,
  themeTextColor,
  type MediaKind,
} from "@/lib/media-library-shared";
import { prepareMedia, uploadToLibrary } from "@/lib/media-library-upload";

const NOUN: Record<MediaKind, { one: string; many: string; add: string }> = {
  screenshot: { one: "screenshot", many: "screenshots", add: "Add screenshot" },
  recording: { one: "recording", many: "recordings", add: "Add recording" },
};

const NAME_PLACEHOLDER: Record<MediaKind, string> = {
  screenshot: "e.g. Chapter view, editor",
  recording: "e.g. Highlight video",
};

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime";

interface UploadJob {
  id: string;
  name: string;
  kind: MediaKind;
  title: string;
  progress: number;
  error: string | null;
}

/** A picked file waiting on its name, or an existing item being renamed. */
type NamePrompt =
  | { mode: "add"; file: File; kind: MediaKind }
  | { mode: "rename"; item: MediaLibraryItem };

function extOf(path: string): string {
  const match = path.match(/\.([a-z0-9]+)(\?|#|$)/i);
  return match ? match[1].toLowerCase() : "";
}

function fileMeta(file: File, kind: MediaKind): string {
  const ext = extensionForContentType(file.type) || extOf(file.name);
  const mb = `${Math.max(1, Math.round(file.size / (1024 * 1024)))} MB`;
  return `${kind === "recording" ? "Recording" : "Screenshot"} · ${ext} · ${mb}`;
}

function itemMeta(item: MediaLibraryItem): string {
  const ext = extOf(item.path);
  if (item.kind === "recording") {
    const bits = ["Recording"];
    if (item.durationMs !== null) bits.push(formatDuration(item.durationMs));
    if (ext) bits.push(ext);
    return bits.join(" · ");
  }
  return ext ? `Screenshot · ${ext}` : "Screenshot";
}

export interface MediaLibraryViewProps {
  companyId: string;
  items: MediaLibraryItem[];
  themeColor: string | null;
  /** The theme color was read off the company's website, not picked by a person. */
  themeFromSite?: boolean;
}

/* The page never scrolls: Screenshots, Recordings and Theme color are tabs,
   and a library longer than the screen is paged. */
type Tab = MediaKind | "theme";

const TILE_MIN = 150;
const TILE_GAP = 12;

/** How many tiles fill the grid without scrolling: the columns that fit its
    width, in two rows (one on a short window). */
function usePageSize(): [(node: HTMLDivElement | null) => void, number] {
  const [size, setSize] = useState(12);
  const observer = useRef<ResizeObserver | null>(null);
  const ref = useCallback((node: HTMLDivElement | null) => {
    observer.current?.disconnect();
    if (!node) return;
    const measure = () => {
      const cols = Math.max(2, Math.floor((node.clientWidth + TILE_GAP) / (TILE_MIN + TILE_GAP)));
      setSize(cols * (window.innerHeight >= 860 ? 2 : 1));
    };
    observer.current = new ResizeObserver(measure);
    observer.current.observe(node);
    measure();
  }, []);
  return [ref, size];
}

function ThemeColorCard({ initial, fromSite }: { initial: string | null; fromSite: boolean }) {
  const [color, setColor] = useState<string | null>(initial);
  const [draft, setDraft] = useState(initial ?? "");
  const [inputError, setInputError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const apply = (next: string | null) => {
    setColor(next);
    setDraft(next ?? "");
    setInputError(null);
    setSaveError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveThemeColor(next);
      if (!result.ok) setSaveError(result.error);
      else setSaved(true);
    });
  };

  const commitDraft = () => {
    if (draft.trim() === "") {
      if (color !== null) apply(null);
      return;
    }
    const normalized = normalizeThemeHex(draft);
    if (!normalized) {
      setInputError("Enter a six digit hex color.");
      return;
    }
    if (normalized !== color) apply(normalized);
    else setDraft(normalized);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitDraft();
  };

  return (
    <Card>
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="min-w-0 flex-1">
          <h2 className="m-0 text-[17px] font-bold tracking-[-0.3px] text-ink">Theme color</h2>
          <p className="mb-0 mt-1 text-[13.5px] font-semibold leading-normal text-slate-400">
            {fromSite && color === initial
              ? "From your website. Colors the text on your posts."
              : "Colors the text on your posts."}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {THEME_SWATCHES.map((hex) => {
              const selected = color === hex;
              return (
                <button
                  key={hex}
                  type="button"
                  aria-label={hex}
                  aria-pressed={selected}
                  onClick={() => apply(hex)}
                  className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center border-2 transition-transform duration-[160ms] ease-om rounded-pill hover:scale-105 ${
                    selected ? "border-ink" : "border-white shadow-card"
                  }`}
                  style={{ backgroundColor: hex }}
                >
                  {selected ? <Check size={16} color={themeTextColor(hex)} strokeWidth={3} /> : null}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 border border-line bg-white px-3 py-2 rounded-ops-sm focus-within:border-blue-500">
              <span
                className="h-4 w-4 shrink-0 border border-line rounded-pill"
                style={{ backgroundColor: color ?? "transparent" }}
              />
              <input
                value={draft}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setDraft(e.target.value);
                  setInputError(null);
                }}
                onBlur={commitDraft}
                onKeyDown={onKey}
                placeholder="#RRGGBB"
                spellCheck={false}
                className="w-[92px] border-none bg-transparent p-0 font-mono text-[13.5px] font-semibold uppercase text-ink outline-none placeholder:normal-case placeholder:text-slate-300"
              />
            </div>
            <Pill variant={color === null ? "tint" : "quiet"} size="sm" onClick={() => apply(null)}>
              No theme
            </Pill>
            {pending ? (
              <span className="text-[12.5px] font-semibold text-slate-400">Saving</span>
            ) : saved ? (
              <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-green">
                <Check size={13} /> Saved
              </span>
            ) : null}
          </div>
          {inputError || saveError ? (
            <p className="mb-0 mt-2 text-[12.5px] font-semibold text-danger">
              {inputError ?? saveError}
            </p>
          ) : null}
        </div>

        <div
          className="relative flex w-[150px] shrink-0 items-center justify-center overflow-hidden bg-ink-900 rounded-ops-md"
          style={{ aspectRatio: "9 / 16" }}
          aria-hidden
        >
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="relative flex max-w-[88%] justify-center text-center">
            <PostTextPreview text="Your caption here" color={color} fontSize={15} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function MediaTile({
  item,
  onOpen,
  onEdit,
  onRemove,
}: {
  item: MediaLibraryItem;
  onOpen: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const KindIcon = item.kind === "recording" ? Video : Images;
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label={item.title ?? `Untitled ${NOUN[item.kind].one}`}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter") onOpen();
        }}
        className="group relative cursor-pointer overflow-hidden bg-fill-quiet rounded-ops-sm"
        style={{ aspectRatio: "4 / 5" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.previewUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        {item.kind === "recording" ? (
          <>
            <span className="pointer-events-none absolute left-1/2 top-1/2 inline-flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-black/55 text-white rounded-pill">
              <Play size={14} fill="currentColor" />
            </span>
            {item.durationMs !== null ? (
              <span className="pointer-events-none absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 text-[10.5px] font-bold text-white rounded-pill">
                {formatDuration(item.durationMs)}
              </span>
            ) : null}
          </>
        ) : null}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute left-1/2 top-2 inline-flex -translate-x-1/2 cursor-pointer items-center gap-1 border-none bg-white/95 px-2.5 py-1 text-[12px] font-bold text-danger opacity-0 shadow-card transition-opacity duration-[160ms] ease-om rounded-pill group-hover:opacity-100 focus:opacity-100"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 px-0.5">
        <KindIcon size={12} className="shrink-0 text-slate-400" />
        <span
          className={`truncate text-[12px] ${item.title === null ? "font-semibold text-slate-400" : "font-bold text-ink"}`}
        >
          {item.title ?? "Untitled"}
        </span>
      </div>
      {item.description ? (
        <p className="mb-0 mt-1 line-clamp-2 px-0.5 text-[11.5px] font-medium leading-snug text-slate-500">
          {item.description}
        </p>
      ) : (
        <button
          type="button"
          onClick={onEdit}
          className="mt-1 inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 px-0.5 text-[11.5px] font-semibold text-blue-500 hover:underline"
        >
          <Pencil size={11} /> Add what it shows
        </button>
      )}
    </div>
  );
}

function UploadTile({ job, onDismiss }: { job: UploadJob; onDismiss: () => void }) {
  const percent = Math.round(job.progress * 100);
  return (
    <div>
      <div
        className="relative flex flex-col items-center justify-center gap-2 border border-dashed border-line bg-white p-3 text-center rounded-ops-sm"
        style={{ aspectRatio: "4 / 5" }}
      >
        {job.error ? (
          <>
            <p className="mb-0 text-[12px] font-semibold leading-snug text-danger">{job.error}</p>
            <Pill variant="quiet" size="sm" onClick={onDismiss}>
              Dismiss
            </Pill>
          </>
        ) : (
          <>
            {job.kind === "recording" ? (
              <Clapperboard size={20} className="text-slate-400" />
            ) : (
              <Images size={20} className="text-slate-400" />
            )}
            <p className="mb-0 w-full truncate text-[12px] font-semibold text-slate-500">{job.name}</p>
            <div className="h-1.5 w-full overflow-hidden bg-fill-quiet rounded-pill">
              <div
                className="h-full bg-blue-500 transition-[width] duration-200 ease-om rounded-pill"
                style={{ width: `${Math.max(4, percent)}%` }}
              />
            </div>
            <span className="text-[11.5px] font-bold text-slate-400">{percent}%</span>
          </>
        )}
      </div>
      <div className="mt-1.5 truncate px-0.5 text-[12px] font-bold text-ink">{job.title}</div>
    </div>
  );
}

/** Names a screenshot or recording. The title is the label every picker shows. */
function NameMediaModal({
  prompt,
  busy,
  error,
  onSave,
  onClose,
}: {
  prompt: NamePrompt;
  busy: boolean;
  error: string | null;
  onSave: (title: string, description: string | null) => void;
  onClose: () => void;
}) {
  const kind = prompt.mode === "add" ? prompt.kind : prompt.item.kind;
  const initialTitle =
    prompt.mode === "rename"
      ? (prompt.item.title ?? "")
      : prompt.file.name.replace(/\.[^.]+$/, "").trim();
  const [draft, setDraft] = useState(initialTitle);
  const [description, setDescription] = useState(
    prompt.mode === "rename" ? (prompt.item.description ?? "") : "",
  );
  const [previewUrl] = useState<string | null>(() =>
    prompt.mode === "rename"
      ? prompt.item.previewUrl
      : prompt.kind === "screenshot"
        ? URL.createObjectURL(prompt.file)
        : null,
  );
  const trimmed = draft.trim();
  const isRename = prompt.mode === "rename";
  const save = () => onSave(trimmed, description.trim() || null);

  useEffect(() => {
    if (prompt.mode !== "add" || !previewUrl) return;
    const url = previewUrl;
    return () => URL.revokeObjectURL(url);
  }, [prompt, previewUrl]);

  const meta = prompt.mode === "add" ? fileMeta(prompt.file, prompt.kind) : itemMeta(prompt.item);

  return (
    <Modal
      title={
        isRename
          ? kind === "recording"
            ? "Edit this recording"
            : "Edit this screenshot"
          : kind === "recording"
            ? "Name this recording"
            : "Name this screenshot"
      }
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <p className="mb-4 mt-0 text-[13.5px] font-semibold text-slate-500">
        The name is the label you will see when adding it to a post. The explanation tells the AI
        what the {kind === "recording" ? "recording" : "screenshot"} shows.
      </p>
      <div className="flex items-center gap-3">
        <div className="relative flex h-24 w-[72px] shrink-0 items-center justify-center overflow-hidden bg-fill-quiet rounded-[10px]">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : null}
          {kind === "recording" ? (
            <span className="relative inline-flex h-[26px] w-[26px] items-center justify-center bg-white/85 text-ink rounded-pill">
              <Play size={12} fill="currentColor" />
            </span>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && trimmed.length > 0 && !busy) save();
            }}
            placeholder={NAME_PLACEHOLDER[kind]}
            className={`w-full border-2 bg-white px-3.5 py-3 text-[15px] font-semibold text-ink outline-none rounded-ops-sm ${
              trimmed.length > 0 ? "border-blue-500" : "border-line-strong"
            }`}
          />
          <span className={`truncate text-[12px] font-semibold ${error ? "text-danger" : "text-slate-400"}`}>
            {error ?? meta}
          </span>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-1.5">
        <span className="text-[12px] font-bold uppercase tracking-[0.3px] text-slate-400">
          What it shows
        </span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            kind === "recording"
              ? "Optional. e.g. Tapping a play in the timeline jumps the video to that moment"
              : "Optional. e.g. The chapter view with three chapters and the share button"
          }
          rows={3}
          className="w-full resize-y border-2 border-line-strong bg-white px-3.5 py-3 text-[14px] font-medium text-ink outline-none rounded-ops-sm focus:border-blue-500"
        />
        <span className="text-[12px] font-semibold text-slate-400">
          The AI reads this when it writes a post from this {kind === "recording" ? "recording" : "screenshot"}.
        </span>
      </div>
      <div className="mt-5 flex justify-end">
        <Pill disabled={busy || trimmed.length === 0} onClick={save}>
          {busy ? "Saving" : isRename ? "Save" : "Save to media"}
        </Pill>
      </div>
    </Modal>
  );
}

function PreviewModal({
  item,
  onRename,
  onClose,
}: {
  item: MediaLibraryItem;
  onRename: () => void;
  onClose: () => void;
}) {
  return (
    <Modal onClose={onClose} width={720}>
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          aria-label="Rename"
          onClick={onRename}
          className="inline-flex min-w-0 cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-left text-[15px] font-bold text-ink"
        >
          <span className="truncate">{item.title ?? "Untitled"}</span>
          <Pencil size={13} className="shrink-0 text-slate-400" />
        </button>
        <span className="truncate text-[12px] font-semibold text-slate-400">{itemMeta(item)}</span>
      </div>
      {item.description ? (
        <p className="mb-3 mt-0 whitespace-pre-wrap text-[13.5px] font-medium leading-snug text-slate-600">
          {item.description}
        </p>
      ) : (
        <button
          type="button"
          onClick={onRename}
          className="mb-3 inline-flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-[13px] font-semibold text-blue-500 hover:underline"
        >
          <Pencil size={12} /> Add what it shows so the AI understands this{" "}
          {item.kind === "recording" ? "recording" : "screenshot"}
        </button>
      )}
      <div className="flex max-h-[70vh] items-center justify-center overflow-hidden bg-ink rounded-ops-md">
        {item.kind === "recording" ? (
          <video src={item.url} poster={item.thumbPath ? item.previewUrl : undefined} controls autoPlay loop playsInline className="max-h-[70vh] w-full" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt={item.title ?? ""} className="max-h-[70vh] w-full object-contain" />
        )}
      </div>
    </Modal>
  );
}

export function MediaLibraryView({
  companyId,
  items,
  themeColor,
  themeFromSite = false,
}: MediaLibraryViewProps) {
  const [tab, setTab] = useState<Tab>("screenshot");
  /* The media tab last looked at, so uploads and counts have a kind on the Theme tab too. */
  const [kind, setKindOnly] = useState<MediaKind>("screenshot");
  const [page, setPage] = useState(0);
  const [gridRef, pageSize] = usePageSize();
  const setKind = useCallback((next: MediaKind) => {
    setKindOnly(next);
    setTab(next);
    setPage(0);
  }, []);
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [removing, setRemoving] = useState<Set<string>>(() => new Set());
  const [renamed, setRenamed] = useState<Map<string, { title: string; description: string | null }>>(
    () => new Map(),
  );
  const [confirm, setConfirm] = useState<MediaLibraryItem | null>(null);
  const [preview, setPreview] = useState<MediaLibraryItem | null>(null);
  const [queue, setQueue] = useState<Array<{ file: File; kind: MediaKind }>>([]);
  const [renaming, setRenaming] = useState<MediaLibraryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const dropJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== id));
  }, []);

  /** Every file is named on the way in, one at a time, before its upload starts. */
  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;
      const rejected: UploadJob[] = [];
      const accepted: Array<{ file: File; kind: MediaKind }> = [];
      for (const file of list) {
        const check = checkMediaFile(file);
        if (!check.ok) {
          rejected.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            name: file.name,
            kind,
            title: "",
            progress: 0,
            error: check.error,
          });
          continue;
        }
        accepted.push({ file, kind: check.kind });
      }
      if (rejected.length > 0) setJobs((prev) => [...rejected, ...prev]);
      if (accepted.length > 0) {
        setKind(accepted[0].kind);
        setSaveError(null);
        setQueue((prev) => [...prev, ...accepted]);
      }
    },
    [kind, setKind],
  );

  function onNameSaved(title: string, description: string | null) {
    if (renaming) {
      const item = renaming;
      setSaving(true);
      setSaveError(null);
      startTransition(async () => {
        const result = await renameMediaLibraryItem(item.id, title, description);
        setSaving(false);
        if (!result.ok) {
          setSaveError(result.error);
          return;
        }
        setRenamed((prev) => new Map(prev).set(item.id, { title, description }));
        setPreview((prev) =>
          prev && prev.id === item.id ? { ...prev, title, description } : prev,
        );
        setRenaming(null);
      });
      return;
    }
    const next = queue[0];
    if (!next || saving) return;
    setSaving(true);
    setSaveError(null);
    void (async () => {
      try {
        const prepared = await prepareMedia(next.file, next.kind);
        const uploaded = await uploadToLibrary(companyId, prepared, () => undefined);
        startTransition(async () => {
          const result = await addMediaLibraryItem({
            kind: prepared.kind,
            title,
            description,
            path: uploaded.path,
            thumbPath: uploaded.thumbPath,
            durationMs: prepared.durationMs,
            width: prepared.width,
            height: prepared.height,
          });
          setSaving(false);
          if (!result.ok) {
            setSaveError(result.error);
            return;
          }
          setQueue((prev) => prev.slice(1));
        });
      } catch (error) {
        setSaving(false);
        setSaveError(error instanceof Error ? error.message : "Upload failed. Try again.");
      }
    })();
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const onRemoveConfirmed = () => {
    const item = confirm;
    if (!item) return;
    setConfirm(null);
    setPreview((prev) => (prev && prev.id === item.id ? null : prev));
    setRemoving((prev) => new Set(prev).add(item.id));
    startTransition(async () => {
      const result = await removeMediaLibraryItem(item.id);
      if (!result.ok) {
        setRemoving((prev) => {
          const copy = new Set(prev);
          copy.delete(item.id);
          return copy;
        });
      }
    });
  };

  const withTitles = items.map((item) => {
    const edited = renamed.get(item.id);
    return edited === undefined ? item : { ...item, ...edited };
  });
  /* Screenshots and recordings share one grid; a recording carries a play mark. */
  const visibleItems = withTitles.filter((item) => !removing.has(item.id));
  const visibleJobs = jobs;
  const empty = visibleItems.length === 0 && visibleJobs.length === 0;
  /* Uploads in flight take the first slots of page one. */
  const tiles = [
    ...visibleJobs.map((job) => ({ job, item: null })),
    ...visibleItems.map((item) => ({ job: null, item })),
  ];
  const pages = Math.max(1, Math.ceil(tiles.length / pageSize));
  const at = Math.min(page, pages - 1);
  const shown = tiles.slice(at * pageSize, (at + 1) * pageSize);
  const counts = {
    screenshot: withTitles.filter((i) => i.kind === "screenshot" && !removing.has(i.id)).length,
    recording: withTitles.filter((i) => i.kind === "recording" && !removing.has(i.id)).length,
  };

  const namePrompt: NamePrompt | null = renaming
    ? { mode: "rename", item: renaming }
    : queue[0]
      ? { mode: "add", file: queue[0].file, kind: queue[0].kind }
      : null;

  return (
    <div>
      <PageHead
        title="Media"
        right={
          <>
            <button
              type="button"
              onClick={() => setTab("theme")}
              className="inline-flex cursor-pointer items-center gap-2 border border-line bg-white px-3.5 py-2 text-[13px] font-bold text-ink shadow-card rounded-pill active:scale-[0.97]"
            >
              <span
                className="h-4 w-4 border border-line rounded-pill"
                style={{ backgroundColor: themeColor ?? "transparent" }}
              />
              Color
            </button>
            <Pill icon={Plus} onClick={() => inputRef.current?.click()}>
              Add
            </Pill>
          </>
        }
      />
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {tab === "theme" ? (
        <Modal title="Color" onClose={() => setTab(kind)} width={620}>
          <ThemeColorCard initial={themeColor} fromSite={themeFromSite} />
        </Modal>
      ) : null}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!dragging) setDragging(true);
        }}
        onDragLeave={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
          setDragging(false);
        }}
        onDrop={onDrop}
      >
        <Card
          className={`transition-[border-color,box-shadow] duration-[160ms] ease-om ${
            dragging ? "border-blue-500 shadow-raised" : ""
          }`}
        >
          {empty ? (
            <MediaGuide
              kind={kind}
              themeColor={themeColor}
              onAdd={() => inputRef.current?.click()}
            />
          ) : (
            <>
              <div className="mb-3 flex items-center gap-2">
                <p className="m-0 flex-1 text-[12.5px] font-semibold text-slate-500">
                  {counts.screenshot} screenshots · {counts.recording} recordings
                </p>
                {pages > 1 ? (
                  <>
                    <button
                      type="button"
                      aria-label="Previous page"
                      disabled={at === 0}
                      onClick={() => setPage(at - 1)}
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center border-none bg-fill-quiet text-ink rounded-pill disabled:cursor-default disabled:opacity-35"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-[12.5px] font-bold text-slate-500">
                      {at + 1} of {pages}
                    </span>
                    <button
                      type="button"
                      aria-label="Next page"
                      disabled={at >= pages - 1}
                      onClick={() => setPage(at + 1)}
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center border-none bg-fill-quiet text-ink rounded-pill disabled:cursor-default disabled:opacity-35"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                ) : null}
              </div>
              <div
                ref={gridRef}
                className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]"
              >
                {shown.map(({ job, item }) =>
                  job ? (
                    <UploadTile key={job.id} job={job} onDismiss={() => dropJob(job.id)} />
                  ) : (
                    <MediaTile
                      key={item.id}
                      item={item}
                      onOpen={() => setPreview(item)}
                      onEdit={() => {
                        setSaveError(null);
                        setRenaming(item);
                      }}
                      onRemove={() => setConfirm(item)}
                    />
                  ),
                )}
              </div>
            </>
          )}
        </Card>
      </div>

      {namePrompt ? (
        <NameMediaModal
          key={namePrompt.mode === "add" ? namePrompt.file.name + namePrompt.file.lastModified : namePrompt.item.id}
          prompt={namePrompt}
          busy={saving}
          error={saveError}
          onSave={onNameSaved}
          onClose={() => {
            setSaveError(null);
            if (renaming) setRenaming(null);
            else setQueue((prev) => prev.slice(1));
          }}
        />
      ) : null}

      {preview && !namePrompt ? (
        <PreviewModal
          item={preview}
          onRename={() => {
            setSaveError(null);
            setRenaming(preview);
          }}
          onClose={() => setPreview(null)}
        />
      ) : null}

      {confirm ? (
        <Modal title="Delete this media?" onClose={() => setConfirm(null)}>
          <p className="mb-0 text-[14.5px] font-semibold leading-normal text-slate-500">
            Posts already using it keep their copy.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Pill variant="quiet" onClick={() => setConfirm(null)}>
              Keep
            </Pill>
            <Pill variant="danger" icon={Trash2} onClick={onRemoveConfirmed}>
              Delete
            </Pill>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

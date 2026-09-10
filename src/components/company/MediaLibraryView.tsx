"use client";

/* The shared Media library, rendered at /admin/media and /manager/media.
   One company has one library and one theme color, used by its company
   admin and every campaign manager, and read by the app's screenshot
   picker (mobile lib/media-library-api.ts). Files upload straight from
   the browser (lib/media-library-upload.ts); the server actions only own
   the rows and companies.settings. */
import { Check, Clapperboard, Images, Pencil, Play, Plus, Trash2, Upload, Video } from "lucide-react";
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

const KIND_TABS: ReadonlyArray<{ kind: MediaKind; label: string }> = [
  { kind: "screenshot", label: "Screenshots" },
  { kind: "recording", label: "Recordings" },
];

const NOUN: Record<MediaKind, { one: string; many: string; add: string }> = {
  screenshot: { one: "screenshot", many: "screenshots", add: "Add screenshot" },
  recording: { one: "recording", many: "recordings", add: "Add recording" },
};

const EMPTY_COPY: Record<MediaKind, { title: string; body: string }> = {
  screenshot: {
    title: "No screenshots yet",
    body: "Add screenshots of the product. Give each one a title so it is easy to find in the editor.",
  },
  recording: {
    title: "No recordings yet",
    body: "Add screen recordings of the product. Give each one a title so it is easy to find in the editor. Up to 200 MB.",
  },
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
}

function KindToggle({
  active,
  onSelect,
  counts,
}: {
  active: MediaKind;
  onSelect: (kind: MediaKind) => void;
  counts: Record<MediaKind, number>;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 bg-fill-quiet p-[3px] rounded-pill">
      {KIND_TABS.map((tab) => (
        <button
          key={tab.kind}
          type="button"
          onClick={() => onSelect(tab.kind)}
          className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-none px-3.5 py-[6px] text-[13px] font-bold transition-colors duration-[160ms] ease-om rounded-pill ${
            active === tab.kind ? "bg-white text-ink shadow-card" : "bg-transparent text-slate-400"
          }`}
        >
          {tab.label}
          <span className="text-[11px] font-bold text-slate-400">{counts[tab.kind]}</span>
        </button>
      ))}
    </div>
  );
}

function ThemeColorCard({ initial }: { initial: string | null }) {
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

  const bubbleText = color ? themeTextColor(color) : "#FFFFFF";

  return (
    <Card className="mb-5">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="min-w-0 flex-1">
          <h2 className="m-0 text-[17px] font-bold tracking-[-0.3px] text-ink">Theme color</h2>
          <p className="mb-0 mt-1 text-[13.5px] font-semibold leading-normal text-slate-400">
            The color of Theme style on screen text in every post.
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
          className="relative flex w-[126px] shrink-0 items-center justify-center overflow-hidden bg-ink-900 rounded-ops-md"
          style={{ aspectRatio: "9 / 16" }}
          aria-hidden
        >
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
          <div
            className="relative max-w-[86%] px-3 py-1.5 text-center text-[12px] font-extrabold leading-tight rounded-[8px]"
            style={{
              backgroundColor: color ?? "rgba(255,255,255,0.18)",
              color: bubbleText,
            }}
          >
            Your caption here
          </div>
        </div>
      </div>
    </Card>
  );
}

function MediaTile({
  item,
  onOpen,
  onRemove,
}: {
  item: MediaLibraryItem;
  onOpen: () => void;
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
  onSave: (title: string) => void;
  onClose: () => void;
}) {
  const kind = prompt.mode === "add" ? prompt.kind : prompt.item.kind;
  const initialTitle = prompt.mode === "rename" ? (prompt.item.title ?? "") : "";
  const [draft, setDraft] = useState(initialTitle);
  const [previewUrl] = useState<string | null>(() =>
    prompt.mode === "rename"
      ? prompt.item.previewUrl
      : prompt.kind === "screenshot"
        ? URL.createObjectURL(prompt.file)
        : null,
  );
  const trimmed = draft.trim();
  const isRename = prompt.mode === "rename";

  useEffect(() => {
    if (prompt.mode !== "add" || !previewUrl) return;
    const url = previewUrl;
    return () => URL.revokeObjectURL(url);
  }, [prompt, previewUrl]);

  const meta = prompt.mode === "add" ? fileMeta(prompt.file, prompt.kind) : itemMeta(prompt.item);

  return (
    <Modal
      title={kind === "recording" ? "Name this recording" : "Name this screenshot"}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <p className="mb-4 mt-0 text-[13.5px] font-semibold text-slate-500">
        This is the label you will see when adding it to a post.
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
              if (e.key === "Enter" && trimmed.length > 0 && !busy) onSave(trimmed);
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
      <div className="mt-5 flex justify-end">
        <Pill disabled={busy || trimmed.length === 0} onClick={() => onSave(trimmed)}>
          {busy ? "Saving" : isRename ? "Save name" : "Save to media"}
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

export function MediaLibraryView({ companyId, items, themeColor }: MediaLibraryViewProps) {
  const [kind, setKind] = useState<MediaKind>("screenshot");
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [removing, setRemoving] = useState<Set<string>>(() => new Set());
  const [renamed, setRenamed] = useState<Map<string, string>>(() => new Map());
  const [confirm, setConfirm] = useState<MediaLibraryItem | null>(null);
  const [preview, setPreview] = useState<MediaLibraryItem | null>(null);
  const [queue, setQueue] = useState<Array<{ file: File; kind: MediaKind }>>([]);
  const [renaming, setRenaming] = useState<MediaLibraryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const patchJob = useCallback((id: string, patch: Partial<UploadJob>) => {
    setJobs((prev) => prev.map((job) => (job.id === id ? { ...job, ...patch } : job)));
  }, []);
  const dropJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== id));
  }, []);

  const runUpload = useCallback(
    async (file: File, job: UploadJob) => {
      try {
        const prepared = await prepareMedia(file, job.kind);
        patchJob(job.id, { progress: 0.08 });
        const uploaded = await uploadToLibrary(companyId, prepared, (fraction) =>
          patchJob(job.id, { progress: 0.08 + fraction * 0.9 }),
        );
        startTransition(async () => {
          const result = await addMediaLibraryItem({
            kind: prepared.kind,
            title: job.title,
            path: uploaded.path,
            thumbPath: uploaded.thumbPath,
            durationMs: prepared.durationMs,
            width: prepared.width,
            height: prepared.height,
          });
          if (result.ok) dropJob(job.id);
          else patchJob(job.id, { error: result.error });
        });
      } catch (error) {
        patchJob(job.id, {
          error: error instanceof Error ? error.message : "Upload failed. Try again.",
        });
      }
    },
    [companyId, dropJob, patchJob],
  );

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
    [kind],
  );

  function onNameSaved(title: string) {
    if (renaming) {
      const item = renaming;
      setSaving(true);
      setSaveError(null);
      startTransition(async () => {
        const result = await renameMediaLibraryItem(item.id, title);
        setSaving(false);
        if (!result.ok) {
          setSaveError(result.error);
          return;
        }
        setRenamed((prev) => new Map(prev).set(item.id, title));
        setPreview((prev) => (prev && prev.id === item.id ? { ...prev, title } : prev));
        setRenaming(null);
      });
      return;
    }
    const next = queue[0];
    if (!next) return;
    const job: UploadJob = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: next.file.name,
      kind: next.kind,
      title,
      progress: 0,
      error: null,
    };
    setJobs((prev) => [job, ...prev]);
    setQueue((prev) => prev.slice(1));
    void runUpload(next.file, job);
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
    const title = renamed.get(item.id);
    return title === undefined ? item : { ...item, title };
  });
  const visibleItems = withTitles.filter((item) => item.kind === kind && !removing.has(item.id));
  const visibleJobs = jobs.filter((job) => job.kind === kind);
  const empty = visibleItems.length === 0 && visibleJobs.length === 0;
  const noun = NOUN[kind];
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
        title="Media library"
        sub="Everything here shows up in the app when a manager taps Add screenshot or recording on a clip."
        right={
          <>
            <KindToggle active={kind} onSelect={setKind} counts={counts} />
            <Pill icon={Plus} onClick={() => inputRef.current?.click()}>
              {noun.add}
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

      <ThemeColorCard initial={themeColor} />

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
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed border-line bg-transparent px-6 py-14 text-center rounded-ops-md hover:border-blue-300"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center bg-blue-100 text-blue-700 rounded-pill">
                <Upload size={20} />
              </span>
              <p className="mb-0 text-[15px] font-bold text-ink">{EMPTY_COPY[kind].title}</p>
              <p className="mb-0 max-w-[420px] text-[13.5px] font-semibold leading-normal text-slate-400">
                {EMPTY_COPY[kind].body}
              </p>
              <span className="text-[12.5px] font-bold text-blue-700">
                Drop files here or click to add
              </span>
            </button>
          ) : (
            <>
              <p className="mb-3 mt-0 text-[12.5px] font-semibold text-slate-500">
                {`${visibleItems.length} ${visibleItems.length === 1 ? noun.one : noun.many}`}
              </p>
              <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]">
                {visibleJobs.map((job) => (
                  <UploadTile key={job.id} job={job} onDismiss={() => dropJob(job.id)} />
                ))}
                {visibleItems.map((item) => (
                  <MediaTile
                    key={item.id}
                    item={item}
                    onOpen={() => setPreview(item)}
                    onRemove={() => setConfirm(item)}
                  />
                ))}
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

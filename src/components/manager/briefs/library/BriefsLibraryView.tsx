"use client";

import {
  AudioLines,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Images,
  Link2,
  ListOrdered,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  Wallpaper,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";

import {
  deleteBrief,
  fillWithAi,
  planImport,
  saveBriefs,
  writeImportPost,
} from "@/app/manager/briefs/library-actions";
import { markLibraryItemUsed } from "@/app/manager/library/actions";
import { Burst } from "@/components/admin/brain/BrainConfirm";
import { Card, Field, Modal, PageHead, Pill, SortDropdown, TextArea } from "@/components/kit";
import {
  BRIEF_TYPES,
  LONG_TEXT_NOTES,
  TYPE_INFO,
  clipLabel,
  emptyGuided,
  guidedFromFill,
  guidedOf,
  guidedSaveInput,
  longTextOf,
  longTextSaveInput,
  newClip,
  outlineSaveInput,
  timeAgo,
  uid,
  type Brief,
  type BriefKind,
  type BriefType,
  type GuidedState,
  type LongTextState,
  type PlannedPost,
  type SaveBriefInput,
} from "@/lib/manager/brief-library";
import { createClient } from "@/lib/supabase/client";

/* Briefs: the library of templates and outlines creators work from, the
   same as the app's Briefs tab. One screen, no scroll: cards page like
   Scout. New brief walks type, format, then the brief; Upload brief turns a
   document into a set of saved posts. */

const TYPE_ICON: Record<BriefType, LucideIcon> = {
  "Talking Head": AudioLines,
  "Long Text": FileText,
  Slideshow: Images,
  Greenscreen: Wallpaper,
};

type Lane = BriefKind;
type SortKey = "new" | "used" | "old" | "az";
const SORTS: { key: SortKey; label: string }[] = [
  { key: "new", label: "Newest" },
  { key: "used", label: "Most used" },
  { key: "old", label: "Oldest" },
  { key: "az", label: "A to Z" },
];
const ALL_TYPES = "All types";
const TYPE_OPTIONS: readonly string[] = [ALL_TYPES, ...BRIEF_TYPES];
const SPARKS = ["#1BA6EE", "#22C55E", "#F59E0B", "#EC4899"];

function usePerPage(): number {
  const [n, setN] = useState(9);
  useEffect(() => {
    const lg = window.matchMedia("(min-width: 1024px)");
    const xl = window.matchMedia("(min-width: 1280px)");
    const set = () => setN(xl.matches ? 12 : lg.matches ? 9 : 8);
    set();
    lg.addEventListener("change", set);
    xl.addEventListener("change", set);
    return () => {
      lg.removeEventListener("change", set);
      xl.removeEventListener("change", set);
    };
  }, []);
  return n;
}

function TypeTile({ type, size = 36 }: { type: BriefType; size?: number }) {
  const Icon = TYPE_ICON[type];
  const info = TYPE_INFO[type];
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-[11px] ${info.tone} ${info.text}`} style={{ width: size, height: size }}>
      <Icon size={Math.round(size * 0.5)} />
    </span>
  );
}

function SmallLabel({ children }: { children: ReactNode }) {
  return <div className="mb-1.5 text-[12px] font-extrabold uppercase tracking-[0.06em] text-slate-400">{children}</div>;
}

function Seg<T extends string>({ options, value, onChange }: { options: { key: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={`shrink-0 cursor-pointer whitespace-nowrap rounded-full px-[15px] py-[7px] text-[13px] font-bold transition-colors ${
            value === o.key ? "bg-blue-100 text-blue-700" : "bg-transparent text-slate-400 hover:text-ink"
          }`}
        >
          {o.label} {o.count !== undefined ? <span className="tabular-nums opacity-70">{o.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

function BriefCard({ b, fresh, onOpen }: { b: Brief; fresh: boolean; onOpen: () => void }) {
  const clips = b.kind === "Guided" ? (b.type === "Long Text" ? 1 : (b.g?.clips ?? b.clips ?? []).length) : 0;
  const preview =
    b.kind === "Outline"
      ? b.notes
      : b.type === "Long Text"
        ? longTextOf(b).onScreen
        : (b.g?.clips ?? b.clips ?? []).map((c) => c.text || c.onScreen).filter(Boolean)[0] ?? "";
  return (
    <Card
      pad={16}
      lift
      onClick={onOpen}
      className={`flex h-full min-h-0 flex-col gap-2.5 overflow-hidden ${fresh ? "!border-blue-500 [box-shadow:0_0_0_2px_#1BA6EE]" : ""}`}
    >
      <div className="flex items-center gap-2.5">
        <TypeTile type={b.type} size={32} />
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-bold text-slate-400">{b.type}</span>
      </div>
      <div className="line-clamp-2 shrink-0 text-[15.5px] font-extrabold leading-[1.3] text-ink">{b.title || "Untitled"}</div>
      {preview ? <p className="m-0 line-clamp-2 min-h-0 text-[13px] font-medium leading-[1.4] text-slate-500">{preview}</p> : null}
      <div className="mt-auto flex shrink-0 items-center gap-3 pt-1 text-[12.5px] font-bold text-slate-400">
        {clips ? <span>{clips === 1 ? "1 clip" : `${clips} clips`}</span> : null}
        <span>{b.uses === 1 ? "1 post" : `${b.uses} posts`}</span>
        <span className="flex-1 text-right">{timeAgo(b.ts)}</span>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------ viewer */

function ClipTile({ label, onScreen, say, cta }: { label: string; onScreen: string; say: string; cta: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="relative flex aspect-[9/14] items-start justify-center overflow-hidden rounded-[14px] bg-[#16181D] px-2 pt-[18%]">
        {onScreen ? (
          <span className="text-center text-[12px] font-extrabold leading-[1.25] text-white [text-shadow:0_0_2px_#000,0_0_2px_#000]">{onScreen}</span>
        ) : null}
      </div>
      <div className={`text-[12px] font-extrabold ${cta ? "text-blue-700" : "text-ink"}`}>
        {label}
        {cta ? " (CTA)" : ""}
      </div>
      {say ? <div className="line-clamp-3 text-[12px] font-medium leading-[1.35] text-slate-500">{say}</div> : null}
    </div>
  );
}

function NoteBlock({ label, body, tags }: { label: string; body: string; tags?: string[] }) {
  return (
    <div className="rounded-[14px] bg-fill-quiet px-4 py-3">
      <SmallLabel>{label}</SmallLabel>
      <div className="whitespace-pre-wrap text-[13.5px] font-medium leading-[1.5] text-ink">{body}</div>
      {tags?.length ? <div className="mt-1.5 text-[13px] font-bold text-blue-700">{tags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ")}</div> : null}
    </div>
  );
}

function BriefViewer({
  b,
  onClose,
  onEdit,
  onDeleted,
}: {
  b: Brief;
  onClose: () => void;
  onEdit: () => void;
  onDeleted: (list: Brief[]) => void;
}) {
  const [arm, setArm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const g = b.kind === "Guided" && b.type !== "Long Text" ? guidedOf(b) : null;
  const lt = b.kind === "Guided" && b.type === "Long Text" ? longTextOf(b) : null;

  const remove = async () => {
    if (!arm) {
      setArm(true);
      return;
    }
    setBusy(true);
    const r = await deleteBrief(b.from ?? b.id);
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    onDeleted(r.data);
  };

  return (
    <Modal title="" onClose={onClose} width={g ? 820 : 600}>
      <div className="flex items-center gap-3 pr-8">
        <TypeTile type={b.type} size={40} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[21px] font-extrabold text-ink">{b.title || "Untitled"}</div>
          <div className="text-[13px] font-bold text-slate-400">
            {b.type} · {b.kind === "Outline" ? "Outline" : "Guided"} · {b.uses === 1 ? "1 post" : `${b.uses} posts`}
          </div>
        </div>
      </div>

      <div className="mt-5 max-h-[60vh] overflow-y-auto">
        {g ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {g.clips.map((c, i) => (
                <ClipTile key={c.id} label={clipLabel(i, b.type)} onScreen={c.onScreen} say={c.text} cta={c.cta} />
              ))}
            </div>
            {g.angle ? <NoteBlock label="Angle" body={g.angle} /> : null}
            {g.caption ? <NoteBlock label="Caption" body={g.caption} tags={g.tags} /> : null}
            {g.notes && !g.notes.startsWith("Search:") ? <NoteBlock label="Notes" body={g.notes} /> : null}
            {g.link ? <NoteBlock label="Reference" body={g.link} /> : null}
          </div>
        ) : lt ? (
          <div className="flex gap-5">
            <div className="w-[150px] shrink-0">
              <ClipTile label="7 seconds" onScreen={lt.onScreen} say="" cta={false} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <NoteBlock label="On screen" body={lt.onScreen || "Nothing yet"} />
              {lt.notes ? <NoteBlock label="Notes" body={lt.notes} /> : null}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {b.link ? (
              <a href={b.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 truncate rounded-[14px] bg-fill-quiet px-4 py-3 text-[13.5px] font-bold text-blue-700 no-underline">
                <Link2 size={16} /> {b.link}
              </a>
            ) : null}
            {b.notes ? <NoteBlock label="Notes" body={b.notes} /> : null}
          </div>
        )}
      </div>

      {error ? <div className="mt-3 text-[13px] font-semibold text-danger">{error}</div> : null}
      <div className="mt-5 flex items-center gap-2">
        <Pill variant={arm ? "danger" : "ghost"} size="sm" icon={Trash2} loading={busy} onClick={() => void remove()}>
          {arm ? "Confirm delete" : "Delete"}
        </Pill>
        <span className="flex-1" />
        <Pill icon={Pencil} onClick={onEdit}>
          Edit
        </Pill>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------ editor */

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [v, setV] = useState("");
  const add = () => {
    const t = v.trim().replace(/^#/, "");
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setV("");
  };
  return (
    <div>
      <SmallLabel>Hashtags</SmallLabel>
      <div className="flex flex-wrap items-center gap-1.5 rounded-ops-sm border border-line bg-white px-2.5 py-2">
        {tags.map((t) => (
          <button key={t} type="button" onClick={() => onChange(tags.filter((x) => x !== t))} className="flex cursor-pointer items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-[12.5px] font-bold text-blue-700">
            #{t} <X size={12} />
          </button>
        ))}
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "," || e.key === " ") {
              e.preventDefault();
              add();
            }
          }}
          onBlur={add}
          placeholder={tags.length ? "" : "Add a tag"}
          className="min-w-[90px] flex-1 bg-transparent text-[14px] font-semibold text-ink outline-none"
        />
      </div>
    </div>
  );
}

function GuidedEditor({ type, g, setG }: { type: BriefType; g: GuidedState; setG: (g: GuidedState) => void }) {
  const [tab, setTab] = useState<"Clips" | "Caption" | "Notes">("Clips");
  const say = type !== "Slideshow";
  const set = (i: number, patch: Partial<GuidedState["clips"][number]>) => setG({ ...g, clips: g.clips.map((c, j) => (j === i ? { ...c, ...patch } : c)) });
  return (
    <>
      <div className="mb-3 flex gap-1">
        {(["Clips", "Caption", "Notes"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`cursor-pointer rounded-full px-[14px] py-[6px] text-[13px] font-bold ${tab === t ? "bg-blue-100 text-blue-700" : "text-slate-400 hover:text-ink"}`}
          >
            {t === "Clips" ? `${type === "Slideshow" ? "Slides" : "Clips"} ${g.clips.length}` : t}
          </button>
        ))}
      </div>
      {tab === "Clips" ? (
        <div className="flex max-h-[44vh] flex-col gap-2.5 overflow-y-auto pr-1">
          {g.clips.map((c, i) => (
            <div key={c.id} className="rounded-[14px] border border-line bg-white p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className={`text-[13px] font-extrabold ${c.cta ? "text-blue-700" : "text-ink"}`}>{clipLabel(i, type)}</span>
                <span className="flex-1" />
                <button
                  type="button"
                  onClick={() => set(i, { cta: !c.cta })}
                  className={`cursor-pointer rounded-full px-2.5 py-1 text-[12px] font-bold ${c.cta ? "bg-blue-600 text-white" : "bg-fill-quiet text-slate-500"}`}
                >
                  CTA
                </button>
                {g.clips.length > 1 ? (
                  <button type="button" aria-label="Remove" onClick={() => setG({ ...g, clips: g.clips.filter((_, j) => j !== i) })} className="cursor-pointer text-slate-400 hover:text-danger">
                    <X size={16} />
                  </button>
                ) : null}
              </div>
              <div className={`grid gap-2 ${say ? "sm:grid-cols-[1.4fr_1fr]" : ""}`}>
                {say ? (
                  <textarea
                    value={c.text}
                    onChange={(e) => set(i, { text: e.target.value })}
                    placeholder="What they say"
                    rows={2}
                    className="w-full resize-none rounded-[10px] border border-line px-3 py-2 text-[13.5px] font-semibold text-ink outline-none focus:border-blue-500"
                  />
                ) : null}
                <textarea
                  value={c.onScreen}
                  onChange={(e) => set(i, { onScreen: e.target.value })}
                  placeholder="Text on screen"
                  rows={2}
                  className="w-full resize-none rounded-[10px] border border-line px-3 py-2 text-[13.5px] font-semibold text-ink outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setG({ ...g, clips: [...g.clips, newClip("")] })}
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-[14px] border border-dashed border-line py-3 text-[13.5px] font-bold text-slate-500 hover:text-ink"
          >
            <Plus size={15} /> {type === "Slideshow" ? "Add slide" : "Add clip"}
          </button>
        </div>
      ) : tab === "Caption" ? (
        <div className="flex flex-col gap-3">
          <TextArea label="Caption" value={g.caption} onChange={(e) => setG({ ...g, caption: e.target.value })} rows={4} />
          <TagInput tags={g.tags} onChange={(tags) => setG({ ...g, tags })} />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Field label="Reference link" value={g.link} onChange={(e) => setG({ ...g, link: e.target.value })} type="url" optional />
          <TextArea label="Notes" value={g.notes.startsWith("Search:") ? "" : g.notes} onChange={(e) => setG({ ...g, notes: e.target.value })} rows={4} optional />
        </div>
      )}
    </>
  );
}

type Draft =
  | { kind: "Guided"; type: Exclude<BriefType, "Long Text">; g: GuidedState }
  | { kind: "Guided"; type: "Long Text"; lt: LongTextState }
  | { kind: "Outline"; type: BriefType; o: { title: string; notes: string; link: string } };

export type BriefSeed = { title: string; link: string; itemId: string | null };

/* A new draft that starts from a Library idea or link. */
function seededDraft(type: BriefType, kind: BriefKind, seed: BriefSeed | null): Draft {
  const d = draftFor(type, kind);
  if (!seed) return d;
  if ("g" in d) return { ...d, g: { ...d.g, title: seed.title, link: seed.link } };
  if ("lt" in d) return { ...d, lt: { ...d.lt, title: seed.title } };
  return { ...d, o: { ...d.o, title: seed.title, link: seed.link } };
}

function draftFor(type: BriefType, kind: BriefKind, b?: Brief): Draft {
  if (kind === "Outline") return { kind, type, o: { title: b?.title ?? "", notes: b?.notes ?? "", link: b?.link ?? "" } };
  if (type === "Long Text") return { kind: "Guided", type, lt: b ? longTextOf(b) : { title: "", onScreen: "", notes: LONG_TEXT_NOTES, doc: null } };
  return { kind: "Guided", type, g: b ? guidedOf(b) : emptyGuided() };
}

function draftTitle(d: Draft): string {
  return "g" in d ? d.g.title : "lt" in d ? d.lt.title : d.o.title;
}

function BriefEditor({
  existing,
  start,
  seed = null,
  onClose,
  onSaved,
}: {
  existing: Brief | null;
  start: { type: BriefType; kind: BriefKind } | null;
  seed?: BriefSeed | null;
  onClose: () => void;
  onSaved: (list: Brief[], id: string) => void;
}) {
  const [step, setStep] = useState<"type" | "kind" | "compose">(existing ? "compose" : start ? "compose" : "type");
  const [type, setType] = useState<BriefType>(existing?.type ?? start?.type ?? "Talking Head");
  const [d, setD] = useState<Draft | null>(existing ? draftFor(existing.type, existing.kind, existing) : start ? draftFor(start.type, start.kind) : null);
  const [filling, setFilling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = d ? draftTitle(d) : "";
  const setTitle = (t: string) => {
    if (!d) return;
    if ("g" in d) setD({ ...d, g: { ...d.g, title: t } });
    else if ("lt" in d) setD({ ...d, lt: { ...d.lt, title: t } });
    else setD({ ...d, o: { ...d.o, title: t } });
  };

  const fill = async () => {
    if (!d || filling) return;
    setFilling(true);
    setError(null);
    if ("g" in d) {
      const r = await fillWithAi({ mode: "guided", type: d.type, title: d.g.title, link: d.g.link, notes: d.g.notes.startsWith("Search:") ? "" : d.g.notes });
      if (r.ok) setD({ ...d, g: guidedFromFill(r.data, d.g, d.type) });
      else setError(r.error);
    } else if ("lt" in d) {
      const r = await fillWithAi({ mode: "long_text", type: "Long Text", title: d.lt.title });
      if (r.ok) setD({ ...d, lt: { ...d.lt, onScreen: (r.data.clips?.[0]?.onScreen ?? d.lt.onScreen).trim() } });
      else setError(r.error);
    } else {
      const r = await fillWithAi({ mode: "outline", type: d.type, title: d.o.title, link: d.o.link, notes: d.o.notes });
      if (r.ok) setD({ ...d, o: { ...d.o, title: (r.data.title || d.o.title).trim(), notes: (r.data.notes || d.o.notes).trim() } });
      else setError(r.error);
    }
    setFilling(false);
  };

  const save = async () => {
    if (!d || saving) return;
    if (!title.trim()) {
      setError("Add a title.");
      return;
    }
    setSaving(true);
    setError(null);
    const id = existing?.from ?? existing?.id ?? uid();
    const input: SaveBriefInput =
      "g" in d ? guidedSaveInput(id, d.type, d.g) : "lt" in d ? longTextSaveInput(id, d.lt) : outlineSaveInput(id, d.type, d.o);
    const r = await saveBriefs([input]);
    setSaving(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    if (seed?.itemId && !existing) void markLibraryItemUsed(seed.itemId);
    onSaved(r.data, id);
  };

  /* Editing an outline twin edits the template it came from. */
  const heading = existing ? "Edit brief" : step === "type" ? "Post type" : step === "kind" ? "Format" : "New brief";

  return (
    <Modal title={heading} onClose={onClose} width={step === "compose" && d && "g" in d ? 760 : 600}>
      {step === "type" ? (
        <div className="grid grid-cols-2 gap-3">
          {BRIEF_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setStep("kind");
              }}
              className="flex cursor-pointer flex-col items-start gap-3 rounded-[16px] border border-line bg-white p-4 text-left transition-[transform,border-color] hover:-translate-y-0.5 hover:border-blue-300"
            >
              <TypeTile type={t} size={40} />
              <div>
                <div className="text-[15px] font-extrabold text-ink">{t}</div>
                <div className="text-[12.5px] font-semibold text-slate-400">{TYPE_INFO[t].sub}</div>
              </div>
            </button>
          ))}
        </div>
      ) : step === "kind" ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { k: "Guided" as const, icon: ListOrdered, label: "Guided", sub: type === "Long Text" ? "The text on screen, written for them" : "Clips, text on screen, teleprompter" },
                { k: "Outline" as const, icon: FileText, label: "Outline", sub: "Just a title and notes" },
              ]
            ).map((o) => (
              <button
                key={o.k}
                type="button"
                onClick={() => {
                  setD(seededDraft(type, o.k, seed));
                  setStep("compose");
                }}
                className="flex cursor-pointer flex-col items-start gap-3 rounded-[16px] border border-line bg-white p-4 text-left transition-[transform,border-color] hover:-translate-y-0.5 hover:border-blue-300"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-blue-100 text-blue-700">
                  <o.icon size={20} />
                </span>
                <div>
                  <div className="text-[15px] font-extrabold text-ink">{o.label}</div>
                  <div className="text-[12.5px] font-semibold text-slate-400">{o.sub}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4">
            <Pill variant="ghost" size="sm" icon={ChevronLeft} onClick={() => setStep("type")}>
              Back
            </Pill>
          </div>
        </>
      ) : d ? (
        <>
          <div className="mb-3 flex items-center gap-2">
            <TypeTile type={d.type} size={28} />
            <span className="text-[13px] font-bold text-slate-400">
              {d.type} · {d.kind === "Outline" ? "Outline" : "Guided"}
            </span>
          </div>
          <div className="mb-3 flex items-end gap-2">
            <div className="flex-1">
              <Field label="Title" value={title} onChange={(e) => setTitle(e.target.value.slice(0, 140))} autoFocus={!existing} />
            </div>
            <Pill variant="tint" icon={Sparkles} loading={filling} disabled={!title.trim() && !("o" in d && d.o.link) && !("g" in d && d.g.link)} onClick={() => void fill()}>
              {filling ? "Writing" : "Fill in with AI"}
            </Pill>
          </div>

          {"g" in d ? (
            <GuidedEditor type={d.type} g={d.g} setG={(g) => setD({ ...d, g })} />
          ) : "lt" in d ? (
            <div className="flex flex-col gap-3">
              <TextArea label="On screen" value={d.lt.onScreen} onChange={(e) => setD({ ...d, lt: { ...d.lt, onScreen: e.target.value } })} rows={5} />
              <TextArea label="Notes" value={d.lt.notes} onChange={(e) => setD({ ...d, lt: { ...d.lt, notes: e.target.value } })} rows={2} />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Field label="Reference link" value={d.o.link} onChange={(e) => setD({ ...d, o: { ...d.o, link: e.target.value } })} type="url" optional />
              <TextArea label="Notes" value={d.o.notes} onChange={(e) => setD({ ...d, o: { ...d.o, notes: e.target.value } })} rows={6} />
            </div>
          )}

          {error ? <div className="mt-3 text-[13px] font-semibold text-danger">{error}</div> : null}
          <div className="mt-5 flex items-center gap-2">
            {!existing && !start ? (
              <Pill variant="ghost" size="sm" icon={ChevronLeft} onClick={() => setStep("kind")}>
                Back
              </Pill>
            ) : null}
            <span className="flex-1" />
            <Pill variant="quiet" onClick={onClose}>
              Cancel
            </Pill>
            <Pill icon={Check} loading={saving} onClick={() => void save()}>
              {existing ? "Save changes" : "Save brief"}
            </Pill>
          </div>
        </>
      ) : null}
    </Modal>
  );
}

/* ------------------------------------------------------------ upload */

type Source = { id: string; kind: "file"; file: File };
type Written = { index: number; status: "writing" | "done" | "failed"; input?: SaveBriefInput };

const ACCEPT = ".pdf,.docx,.pptx,.xlsx,.rtf,.txt,.md,.csv,image/jpeg,image/png,image/webp";
const MAX_FILE = 24 * 1024 * 1024;

function UploadBrief({ companyId, onClose, onSaved }: { companyId: string; onClose: () => void; onSaved: (list: Brief[], ids: string[]) => void }) {
  const [sources, setSources] = useState<Source[]>([]);
  const [link, setLink] = useState("");
  const [phase, setPhase] = useState<"pick" | "reading" | "writing" | "saving">("pick");
  const [plan, setPlan] = useState<{ importId: string; summary: string; posts: PlannedPost[] } | null>(null);
  const [written, setWritten] = useState<Written[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next: Source[] = [];
    for (const f of Array.from(files)) {
      if (f.size > MAX_FILE) {
        setError(`${f.name} is over 24 MB.`);
        continue;
      }
      next.push({ id: uid(), kind: "file", file: f });
    }
    setSources((s) => [...s, ...next].slice(0, 8));
  };

  const read = async () => {
    const url = link.trim();
    if (!sources.length && !url) {
      setError("Add a file or a link.");
      return;
    }
    setError(null);
    setPhase("reading");
    try {
      const supabase = createClient();
      const files = await Promise.all(
        sources.map(async (s) => {
            const safe = s.file.name.replace(/[^A-Za-z0-9._-]+/g, "-").slice(-80) || "file";
            const path = `${companyId}/${uid()}-${safe}`;
            const { error: upErr } = await supabase.storage.from("brief-imports").upload(path, s.file, { contentType: s.file.type || "application/octet-stream" });
            if (upErr) throw new Error(`${s.file.name} did not upload.`);
            return { path, name: s.file.name, mime: s.file.type };
        }),
      );
      const r = await planImport({ files, links: url ? [url] : [] });
      if (!r.ok) throw new Error(r.error);
      setPlan(r.data);
      setPhase("writing");
      const state: Written[] = r.data.posts.map((p) => ({ index: p.index, status: "writing" }));
      setWritten(state);
      /* Four at a time, like the app. */
      let next = 0;
      const lane = async () => {
        while (next < r.data.posts.length) {
          const post = r.data.posts[next];
          next += 1;
          const w = await writeImportPost(r.data.importId, post.index);
          setWritten((list) =>
            list.map((x) => {
              if (x.index !== post.index) return x;
              if (!w.ok) return { ...x, status: "failed" };
              const id = uid();
              if (post.type === "Long Text") {
                const onScreen = (w.data.clips?.[0]?.onScreen ?? "").trim();
                return { ...x, status: "done", input: longTextSaveInput(id, { title: (w.data.title || post.title).trim(), onScreen, notes: LONG_TEXT_NOTES, doc: null }) };
              }
              const g = guidedFromFill(w.data, { ...emptyGuided(), title: post.title }, post.type);
              return { ...x, status: "done", input: { ...guidedSaveInput(id, post.type, g), noTwin: true } };
            }),
          );
        }
      };
      await Promise.all(Array.from({ length: Math.min(4, r.data.posts.length) }, lane));
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not work. Try again.");
      setPhase("pick");
    }
  };

  const done = written.filter((w) => w.status === "done" && w.input);
  const stillWriting = written.some((w) => w.status === "writing");

  const saveAll = async () => {
    setPhase("saving");
    const inputs = done.map((w) => w.input!);
    const r = await saveBriefs(inputs);
    if (!r.ok) {
      setError(r.error);
      setPhase("writing");
      return;
    }
    onSaved(r.data, inputs.map((i) => i.id));
  };

  return (
    <Modal title="Upload brief" onClose={onClose} width={520}>
      {phase === "pick" || phase === "reading" ? (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={phase === "reading"}
            onClick={() => input.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-ops-md border border-dashed px-4 py-10 text-[13.5px] font-bold transition-colors ${
              over ? "border-blue-500 bg-blue-50 text-blue-700" : "border-line-strong bg-white text-slate-500 hover:border-blue-300 hover:bg-fill-quiet"
            }`}
          >
            <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <Upload size={18} />
            </span>
            PDF, Word, slides, sheets or photos
          </button>
          <input ref={input} type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => addFiles(e.target.files)} />
          {sources.length ? (
            <div className="flex flex-wrap gap-1.5">
              {sources.map((s) => (
                <span key={s.id} className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-[12.5px] font-bold text-blue-700">
                  {s.file.name}
                  <button type="button" aria-label="Remove" onClick={() => setSources((l) => l.filter((x) => x.id !== s.id))} className="cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          <Field label="Or a Google Doc or Notion link" value={link} onChange={(e) => setLink(e.target.value)} type="url" />
          {error ? <div className="text-[13px] font-semibold text-danger">{error}</div> : null}
          <div className="mt-2 flex justify-end gap-2">
            <Pill variant="quiet" onClick={onClose}>
              Cancel
            </Pill>
            <Pill icon={Sparkles} loading={phase === "reading"} onClick={() => void read()}>
              {phase === "reading" ? "Reading" : "Read brief"}
            </Pill>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {plan?.summary ? <p className="m-0 text-[13.5px] font-medium leading-[1.45] text-slate-600">{plan.summary}</p> : null}
          <div className="flex max-h-[46vh] flex-col gap-1.5 overflow-y-auto pr-1">
            {plan?.posts.map((p) => {
              const w = written.find((x) => x.index === p.index);
              return (
                <div key={p.index} className="flex items-center gap-3 rounded-[12px] border border-line bg-white px-3 py-2.5">
                  <TypeTile type={p.type} size={28} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-extrabold text-ink">{w?.input?.title || p.title}</div>
                    <div className="truncate text-[12px] font-semibold text-slate-400">{p.type}</div>
                  </div>
                  {w?.status === "done" ? (
                    <Check size={17} className="text-green" />
                  ) : w?.status === "failed" ? (
                    <span className="text-[12px] font-bold text-danger">Failed</span>
                  ) : (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                  )}
                </div>
              );
            })}
          </div>
          {error ? <div className="text-[13px] font-semibold text-danger">{error}</div> : null}
          <div className="mt-2 flex items-center justify-end gap-2">
            <span className="flex-1 text-[13px] font-bold text-slate-400">
              {done.length} of {plan?.posts.length ?? 0} written
            </span>
            <Pill variant="quiet" onClick={onClose}>
              Cancel
            </Pill>
            <Pill icon={Check} loading={phase === "saving"} disabled={stillWriting || done.length === 0} onClick={() => void saveAll()}>
              {stillWriting ? "Writing" : `Save ${done.length}`}
            </Pill>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------ page */

export function BriefsLibraryView({
  initial,
  companyId,
  initialOpen = null,
  seed = null,
}: {
  initial: Brief[];
  companyId: string;
  initialOpen?: string | null;
  seed?: BriefSeed | null;
}) {
  const [briefs, setBriefs] = useState(initial);
  const [lane, setLane] = useState<Lane>("Guided");
  const [q, setQ] = useState("");
  const [type, setType] = useState<"All" | BriefType>("All");
  const [sort, setSort] = useState<SortKey>("new");
  const PER_PAGE = usePerPage();
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<string | null>(initialOpen);
  const [editing, setEditing] = useState<{ brief: Brief | null } | null>(seed ? { brief: null } : null);
  const [seeded, setSeeded] = useState<BriefSeed | null>(seed);

  /* A reload should not reopen New brief. */
  useEffect(() => {
    if (seed) window.history.replaceState(null, "", "/manager/briefs");
  }, [seed]);
  const [uploading, setUploading] = useState(false);
  const [fresh, setFresh] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  useEffect(() => {
    if (!fresh.length) return;
    const t = window.setTimeout(() => setFresh([]), 60_000);
    return () => window.clearTimeout(t);
  }, [fresh]);

  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const match = (b: Brief) => (type === "All" || b.type === type) && words.every((w) => `${b.title} ${b.notes} ${b.type}`.toLowerCase().includes(w));
  const count = (k: BriefKind) => briefs.filter((b) => b.kind === k && match(b)).length;

  const list = useMemo(() => {
    const out = briefs
      .filter((b) => b.kind === lane && match(b))
      .sort((a, b) => (sort === "az" ? a.title.localeCompare(b.title) : sort === "old" ? a.ts - b.ts : sort === "used" ? b.uses - a.uses || b.ts - a.ts : b.ts - a.ts));
    return fresh.length ? out.filter((b) => fresh.includes(b.id)).concat(out.filter((b) => !fresh.includes(b.id))) : out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [briefs, lane, q, type, sort, fresh]);

  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const safePage = Math.min(page, pages - 1);
  const shown = list.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);
  const openBrief = briefs.find((b) => b.id === open) ?? null;

  const saved = (next: Brief[], ids: string[], msg: string) => {
    setBriefs(next);
    setFresh(ids);
    setPage(0);
    const first = next.find((b) => b.id === ids[0]);
    if (first) setLane(first.kind);
    flash(msg);
  };

  return (
    <div className="flex flex-col lg:h-[calc(100dvh-120px)] lg:min-h-[560px]">
      <PageHead
        title="Briefs"
        right={
          <div className="flex items-center gap-2">
            <Pill variant="quiet" size="sm" icon={Upload} onClick={() => setUploading(true)}>
              Upload brief
            </Pill>
            <Pill size="sm" icon={Plus} onClick={() => setEditing({ brief: null })}>
              New brief
            </Pill>
          </div>
        }
      />

      {briefs.length === 0 ? (
        <Card pad={0} className="flex min-h-[300px] flex-1 flex-col items-center justify-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <ListOrdered size={22} />
          </span>
          <span className="text-[17px] font-extrabold text-ink">No briefs yet</span>
          <div className="flex gap-2">
            <Pill variant="quiet" icon={Upload} onClick={() => setUploading(true)}>
              Upload brief
            </Pill>
            <Pill icon={Plus} onClick={() => setEditing({ brief: null })}>
              New brief
            </Pill>
          </div>
        </Card>
      ) : (
        <>
          <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2">
            <Seg<Lane>
              options={[
                { key: "Guided", label: "Guided", count: count("Guided") },
                { key: "Outline", label: "Outlines", count: count("Outline") },
              ]}
              value={lane}
              onChange={(v) => {
                setLane(v);
                setPage(0);
              }}
            />
            <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
              <label className="flex h-9 min-w-[170px] flex-1 items-center gap-2 rounded-full border border-line bg-white px-3 shadow-card sm:max-w-[240px]">
                <Search size={15} className="text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Search"
                  className="min-w-0 flex-1 bg-transparent text-[13.5px] font-semibold text-ink outline-none"
                />
                {q ? (
                  <button type="button" aria-label="Clear" onClick={() => setQ("")} className="cursor-pointer text-slate-400">
                    <X size={14} />
                  </button>
                ) : null}
              </label>
              <SortDropdown
                prefix=""
                options={TYPE_OPTIONS}
                value={type === "All" ? ALL_TYPES : type}
                onSelect={(v) => {
                  setType(v === ALL_TYPES ? "All" : (v as BriefType));
                  setPage(0);
                }}
              />
              <SortDropdown
                prefix=""
                options={SORTS.map((x) => x.label)}
                value={SORTS.find((x) => x.key === sort)?.label ?? SORTS[0].label}
                onSelect={(v) => {
                  setSort(SORTS.find((x) => x.label === v)?.key ?? "new");
                  setPage(0);
                }}
              />
              {pages > 1 ? (
                <span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-500">
                  <button
                    type="button"
                    aria-label="Previous"
                    disabled={safePage === 0}
                    onClick={() => setPage(safePage - 1)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-ink disabled:cursor-default disabled:opacity-35"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="tabular-nums">
                    {safePage + 1} / {pages}
                  </span>
                  <button
                    type="button"
                    aria-label="Next"
                    disabled={safePage >= pages - 1}
                    onClick={() => setPage(safePage + 1)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-ink disabled:cursor-default disabled:opacity-35"
                  >
                    <ChevronRight size={16} />
                  </button>
                </span>
              ) : null}
            </div>
          </div>

          {shown.length ? (
            <div
              key={`${lane}-${safePage}`}
              className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-rows-3 lg:grid-cols-3 xl:grid-cols-4"
            >
              {shown.map((b, i) => (
                <div key={b.id} className="h-full min-h-0 min-w-0 animate-om-pop" style={{ animationDelay: `${i * 35}ms` } as CSSProperties}>
                  <BriefCard b={b} fresh={fresh.includes(b.id)} onOpen={() => setOpen(b.id)} />
                </div>
              ))}
            </div>
          ) : (
            <Card pad={0} className="flex min-h-[240px] flex-1 items-center justify-center">
              <span className="text-[15px] font-extrabold text-ink">{q || type !== "All" ? "No matches" : lane === "Guided" ? "No guided briefs yet" : "No outlines yet"}</span>
            </Card>
          )}
        </>
      )}

      {toast ? (
        <div className="pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2 animate-om-pop">
          <div className="relative flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[14px] font-extrabold text-white shadow-lg">
            <Check size={16} />
            {toast}
            <Burst colors={SPARKS} count={10} reach={40} />
          </div>
        </div>
      ) : null}

      {openBrief && !editing ? (
        <BriefViewer
          b={openBrief}
          onClose={() => setOpen(null)}
          onEdit={() => {
            /* An outline twin edits the template it came from. */
            const source = openBrief.from ? briefs.find((x) => x.id === openBrief.from) ?? openBrief : openBrief;
            setEditing({ brief: source });
          }}
          onDeleted={(next) => {
            setBriefs(next);
            setOpen(null);
            flash("Deleted");
          }}
        />
      ) : null}

      {editing ? (
        <BriefEditor
          existing={editing.brief}
          start={null}
          seed={editing.brief ? null : seeded}
          onClose={() => {
            setEditing(null);
            setSeeded(null);
          }}
          onSaved={(next, id) => {
            setEditing(null);
            setSeeded(null);
            setOpen(null);
            saved(next, [id], editing.brief ? "Saved" : "Brief saved");
          }}
        />
      ) : null}

      {uploading ? (
        <UploadBrief
          companyId={companyId}
          onClose={() => setUploading(false)}
          onSaved={(next, ids) => {
            setUploading(false);
            saved(next, ids, `${ids.length} briefs saved`);
          }}
        />
      ) : null}
    </div>
  );
}

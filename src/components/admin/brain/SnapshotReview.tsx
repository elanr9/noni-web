"use client";

import { Check, Package, Pencil, Sparkles, Users, X, Zap, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { getBrainSnapshot, settleBrainSnapshot } from "@/app/admin/brain/knowledge-actions";
import { Pill } from "@/components/kit";
import type { CompanySnapshot, SnapshotItem, SnapshotPart } from "@/lib/admin/brain-model";

/* The end of onboarding: what Noni understood about the company, in four
   parts (what it sells, who the videos speak to, the viral feature, the core
   features), each confirmed in one tap or fixed in the founder's words. A
   confirm springs the card and pops a check, because it should feel good. */

type Slot = { part: SnapshotPart; index?: number };

const slotKey = (s: Slot) => (s.index === undefined ? s.part : `${s.part}:${s.index}`);

function openSlots(snap: CompanySnapshot): Slot[] {
  const out: Slot[] = [];
  for (const part of ["sells", "audience", "viral"] as const) {
    if (snap[part] && snap[part]!.status === "open") out.push({ part });
  }
  snap.features.forEach((f, index) => {
    if (f.status === "open") out.push({ part: "features", index });
  });
  return out;
}

function counts(snap: CompanySnapshot): { done: number; total: number } {
  const items = [snap.sells, snap.audience, snap.viral, ...snap.features].filter(
    (x): x is SnapshotItem => x !== null && x.status !== "dismissed",
  );
  return { done: items.filter((x) => x.status === "confirmed").length, total: items.length };
}

const SPARKS = [
  [-34, -26],
  [0, -38],
  [34, -26],
  [40, 4],
  [28, 30],
  [-28, 30],
  [-40, 4],
  [0, 40],
] as const;

function ConfirmedMark({ dark = false }: { dark?: boolean }) {
  return (
    <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center">
      {SPARKS.map(([dx, dy], i) => (
        <span
          key={i}
          aria-hidden
          className={`absolute h-1.5 w-1.5 rounded-pill ${i % 2 ? "bg-green" : dark ? "bg-white" : "bg-blue-500"}`}
          style={
            {
              "--dx": `${dx}px`,
              "--dy": `${dy}px`,
              animation: `om-spark 560ms var(--ease-om) ${40 + i * 12}ms both`,
            } as CSSProperties
          }
        />
      ))}
      <span
        className={`inline-flex h-10 w-10 animate-om-check items-center justify-center rounded-pill ${
          dark ? "bg-white text-green" : "bg-green text-white"
        }`}
      >
        <Check size={20} strokeWidth={3} />
      </span>
    </span>
  );
}

function Editor({
  item,
  onSave,
  onCancel,
  dark,
}: {
  item: SnapshotItem;
  onSave: (title: string, text: string) => void;
  onCancel: () => void;
  dark?: boolean;
}) {
  const [title, setTitle] = useState(item.title);
  const [text, setText] = useState(item.text);
  const field = `box-border w-full border px-4 py-3 font-semibold outline-none rounded-ops-sm focus:border-blue-500 focus:[box-shadow:var(--ring-focus)] ${
    dark ? "border-white/30 bg-white text-ink" : "border-line bg-white text-ink"
  }`;
  return (
    <div className="mt-1 flex flex-col gap-2.5 animate-om-rise">
      <input aria-label="Name" className={`${field} text-[15px]`} value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea
        aria-label="Description"
        className={`${field} resize-y text-[16px] leading-[1.5]`}
        rows={3}
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex gap-2">
        <Pill size="sm" icon={Check} disabled={!text.trim()} onClick={() => onSave(title, text)}>
          Save and confirm
        </Pill>
        <Pill size="sm" variant={dark ? "tint" : "quiet"} onClick={onCancel}>
          Cancel
        </Pill>
      </div>
    </div>
  );
}

/* One confirmable line. `tone` "hero" is the blue viral card. */
function ItemCard({
  item,
  label,
  icon: Icon,
  tone = "plain",
  big = false,
  onConfirm,
  onEdit,
  onDismiss,
}: {
  item: SnapshotItem;
  label?: string;
  icon?: LucideIcon;
  tone?: "plain" | "hero" | "row";
  big?: boolean;
  onConfirm: () => void;
  onEdit: (title: string, text: string) => void;
  onDismiss: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const confirmed = item.status === "confirmed";
  const hero = tone === "hero";
  const row = tone === "row";
  /* Bounce once, on the confirm itself, not on every later render. */
  const [justConfirmed, setJustConfirmed] = useState(false);
  const was = useRef(confirmed);
  useEffect(() => {
    if (confirmed && !was.current) {
      setJustConfirmed(true);
      const id = window.setTimeout(() => setJustConfirmed(false), 700);
      was.current = true;
      return () => window.clearTimeout(id);
    }
    was.current = confirmed;
  }, [confirmed]);

  const shell = row
    ? `px-5 py-[18px] ${confirmed ? "bg-green-soft/60" : "bg-white"}`
    : hero
      ? "rounded-[20px] p-6 text-white shadow-card"
      : `rounded-[20px] border-2 bg-white p-6 shadow-card ${confirmed ? "border-green" : "border-transparent"}`;

  return (
    <div
      className={`transition-colors duration-[240ms] ease-om ${shell} ${justConfirmed ? "animate-om-bounce" : ""}`}
      style={
        hero
          ? { background: confirmed ? "linear-gradient(135deg, #16a37a 0%, #0f7c5c 100%)" : "linear-gradient(135deg, #2f8cff 0%, #1f5fd6 100%)" }
          : undefined
      }
    >
      {label ? (
        <div className={`mb-3 flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-[0.6px] ${hero ? "text-white/85" : "text-slate-400"}`}>
          {Icon ? <Icon size={15} /> : null}
          {label}
        </div>
      ) : null}
      {editing ? (
        <Editor
          item={item}
          dark={hero}
          onCancel={() => setEditing(false)}
          onSave={(title, text) => {
            setEditing(false);
            onEdit(title, text);
          }}
        />
      ) : (
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            {item.title ? (
              <div className={`font-bold ${big ? "text-[15px]" : "text-[16px]"} ${hero ? "text-white" : big ? "text-blue-700" : "text-ink"}`}>
                {item.title}
              </div>
            ) : null}
            <p
              className={`m-0 mt-1 font-semibold leading-[1.45] ${
                big ? "text-[21px] tracking-[-0.3px]" : row ? "text-[15px]" : "text-[17px]"
              } ${hero ? "text-white" : big ? "text-ink" : "text-slate-500"}`}
            >
              {item.text}
            </p>
          </div>
          {confirmed ? <ConfirmedMark dark={hero} /> : null}
          {row && !confirmed ? (
            <span className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                aria-label={`Fix ${item.title}`}
                onClick={() => setEditing(true)}
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center border-none bg-transparent text-slate-400 rounded-pill hover:bg-fill-quiet hover:text-ink"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                aria-label={`Remove ${item.title}`}
                onClick={onDismiss}
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center border-none bg-transparent text-slate-300 rounded-pill hover:bg-fill-quiet hover:text-slate-500"
              >
                <X size={17} />
              </button>
              <button
                type="button"
                aria-label={`Confirm ${item.title}`}
                onClick={onConfirm}
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center border-2 border-blue-500 bg-white text-blue-500 rounded-pill transition-transform duration-[120ms] ease-om hover:bg-blue-500 hover:text-white active:scale-90"
              >
                <Check size={19} strokeWidth={3} />
              </button>
            </span>
          ) : null}
        </div>
      )}
      {!confirmed && !editing && !row ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className={`inline-flex cursor-pointer items-center gap-1.5 border-none px-5 py-2.5 text-[14.5px] font-bold rounded-pill transition-transform duration-[120ms] ease-om active:scale-95 ${
              hero ? "bg-white text-blue-700 hover:bg-white/90" : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            <Check size={16} strokeWidth={3} />
            {row ? "Confirm" : "That's right"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={`inline-flex cursor-pointer items-center gap-1.5 border-none px-4 py-2.5 text-[14px] font-bold rounded-pill ${
              hero ? "bg-white/15 text-white hover:bg-white/25" : "bg-fill-quiet text-ink hover:bg-line"
            }`}
          >
            <Pencil size={14} />
            Fix it
          </button>
          <button
            type="button"
            aria-label="Remove"
            onClick={onDismiss}
            className={`ml-auto inline-flex h-9 w-9 cursor-pointer items-center justify-center border-none bg-transparent rounded-pill ${
              hero ? "text-white/70 hover:bg-white/15" : "text-slate-300 hover:bg-fill-quiet hover:text-slate-500"
            }`}
          >
            <X size={17} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SkeletonCard({ h }: { h: number }) {
  return <div className="animate-pulse bg-white shadow-card rounded-[20px]" style={{ height: h }} />;
}

export function SnapshotReview({
  refreshKey,
  scanning,
  pending,
  onDone,
}: {
  refreshKey?: string;
  scanning: boolean;
  /** The finish is saving. */
  pending: boolean;
  onDone: () => void;
}) {
  const [snap, setSnap] = useState<CompanySnapshot | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    let live = true;
    void getBrainSnapshot().then((r) => {
      if (!live) return;
      setLoaded(true);
      if (r.ok) {
        setError(null);
        if (r.data) setSnap(r.data);
      } else setError(r.error);
    });
    return () => {
      live = false;
    };
  }, [refreshKey]);

  const settle = async (slot: Slot, decision: "confirm" | "dismiss", edit?: { title: string; text: string }) => {
    /* Optimistic: the card springs the moment it is tapped. */
    const mark = (it: SnapshotItem): SnapshotItem => ({
      ...it,
      ...(edit ? { title: edit.title.trim() || it.title, text: edit.text.trim() || it.text } : {}),
      status: decision === "dismiss" ? "dismissed" : "confirmed",
    });
    setSnap((cur) =>
      !cur
        ? cur
        : slot.part === "features"
          ? { ...cur, features: cur.features.map((f, i) => (i === slot.index ? mark(f) : f)) }
          : { ...cur, [slot.part]: cur[slot.part] ? mark(cur[slot.part] as SnapshotItem) : null },
    );
    const r = await settleBrainSnapshot({ part: slot.part, index: slot.index, decision, ...(edit ?? {}) });
    if (r.ok) {
      setSnap(r.data);
      setError(null);
      return true;
    }
    setError(r.error);
    const fresh = await getBrainSnapshot();
    if (fresh.ok && fresh.data) setSnap(fresh.data);
    return false;
  };

  const confirmAll = async () => {
    if (!snap) return onDone();
    setFinishing(true);
    let ok = true;
    for (const slot of openSlots(snap)) ok = (await settle(slot, "confirm")) && ok;
    setFinishing(false);
    if (ok) onDone();
  };

  const heading = (
    <>
      <h1 className="m-0 text-[30px] font-bold leading-[1.15] tracking-[-0.8px] text-ink sm:text-[36px]">
        Here&apos;s what we understood
      </h1>
      <p className="mb-0 mt-2.5 text-[16px] font-semibold leading-[1.55] text-slate-400">
        Every brief and script is built on this. Confirm what&apos;s right, fix what isn&apos;t.
      </p>
    </>
  );

  if (!snap) {
    const waiting = scanning || !loaded;
    return (
      <div className="animate-om-rise">
        {heading}
        {waiting || !error ? (
          <>
            <p className="mb-0 mt-6 text-[14.5px] font-bold text-blue-700">
              {scanning ? "Still reading your site. Your summary appears here in a moment." : "Writing your summary…"}
            </p>
            <div className="mt-4 flex flex-col gap-3.5">
              <SkeletonCard h={130} />
              <SkeletonCard h={130} />
              <SkeletonCard h={160} />
            </div>
          </>
        ) : (
          <p className="mb-0 mt-5 text-[14px] font-semibold text-danger">{error}</p>
        )}
        {!waiting ? (
          <Pill onClick={onDone} disabled={pending} className="mt-7 w-full" style={{ padding: "17px 22px", fontSize: 16 }}>
            {pending ? "Saving…" : "Finish"}
          </Pill>
        ) : null}
      </div>
    );
  }

  const { done, total } = counts(snap);
  const left = openSlots(snap).length;
  const features = snap.features.map((f, index) => ({ f, index })).filter(({ f }) => f.status !== "dismissed");
  const section = (children: ReactNode) => <div className="mt-3.5">{children}</div>;

  return (
    <div className="animate-om-rise">
      {heading}
      <div className="mt-6 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden bg-line rounded-pill">
          <span
            className="block h-full bg-green transition-[width] duration-[400ms] ease-om-spring rounded-pill"
            style={{ width: total ? `${Math.round((done / total) * 100)}%` : "0%" }}
          />
        </div>
        <span className="text-[13.5px] font-bold text-slate-500 tabular-nums">{`${done} of ${total}`}</span>
      </div>

      {snap.sells && snap.sells.status !== "dismissed"
        ? section(
            <ItemCard
              item={snap.sells}
              label="What you sell"
              icon={Package}
              big
              onConfirm={() => void settle({ part: "sells" }, "confirm")}
              onEdit={(title, text) => void settle({ part: "sells" }, "confirm", { title, text })}
              onDismiss={() => void settle({ part: "sells" }, "dismiss")}
            />,
          )
        : null}
      {snap.audience && snap.audience.status !== "dismissed"
        ? section(
            <ItemCard
              item={snap.audience}
              label="Who the videos are for"
              icon={Users}
              big
              onConfirm={() => void settle({ part: "audience" }, "confirm")}
              onEdit={(title, text) => void settle({ part: "audience" }, "confirm", { title, text })}
              onDismiss={() => void settle({ part: "audience" }, "dismiss")}
            />,
          )
        : null}
      {snap.viral && snap.viral.status !== "dismissed"
        ? section(
            <ItemCard
              item={snap.viral}
              label="The viral feature"
              icon={Sparkles}
              tone="hero"
              onConfirm={() => void settle({ part: "viral" }, "confirm")}
              onEdit={(title, text) => void settle({ part: "viral" }, "confirm", { title, text })}
              onDismiss={() => void settle({ part: "viral" }, "dismiss")}
            />,
          )
        : null}
      {features.length > 0
        ? section(
            <div className="overflow-hidden bg-white shadow-card rounded-[20px]">
              <div className="flex items-center gap-2 px-5 pb-1 pt-5 text-[12.5px] font-bold uppercase tracking-[0.6px] text-slate-400">
                <Zap size={15} />
                Core features
              </div>
              <div className="divide-y divide-line">
                {features.map(({ f, index }) => (
                  <ItemCard
                    key={slotKey({ part: "features", index })}
                    item={f}
                    tone="row"
                    onConfirm={() => void settle({ part: "features", index }, "confirm")}
                    onEdit={(title, text) => void settle({ part: "features", index }, "confirm", { title, text })}
                    onDismiss={() => void settle({ part: "features", index }, "dismiss")}
                  />
                ))}
              </div>
            </div>,
          )
        : null}

      {error ? <p className="mb-0 mt-4 text-[13.5px] font-semibold text-danger">{error}</p> : null}
      <Pill
        onClick={() => void (left > 0 ? confirmAll() : onDone())}
        disabled={pending || finishing}
        className="mt-7 w-full"
        style={{ padding: "17px 22px", fontSize: 16 }}
      >
        {pending || finishing ? "Saving…" : left > 0 ? "All good, confirm the rest" : "Finish"}
      </Pill>
    </div>
  );
}

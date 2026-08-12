"use client";

import { AtSign, Check, Music2, Pencil, Plus, Sparkles, X } from "lucide-react";
import { useState, useTransition } from "react";

import {
  addInspirationAccount,
  cleanUpBrainDoc,
  removeInspirationAccount,
  saveBrainDoc,
  setInspirationAccountMuted,
  type BrainActionResult,
} from "@/app/admin/brain/actions";
import { Segmented } from "@/components/admin/posts/Segmented";
import { Card, Chip, Label, Modal, PageHead, Pill } from "@/components/kit";
import type { BrainDoc, InspirationAccount, Platform } from "@/lib/admin/types";

/* Company Brain tab (BrainPage in AdminSetupTabs.jsx): Product + Audience
   doc cards with an editor modal, plus the inspiration accounts card. */

const DOC_META: Record<"product" | "audience", { hint: string; editorHint: string }> = {
  product: {
    hint: "What you sell, what it costs, why it wins. Every hook and script starts here.",
    editorHint:
      "What you sell, what it costs, anything you'd like us to know about your company!",
  },
  audience: {
    hint: "Who buys, where they hang out, what they already believe.",
    editorHint: "Who buys, where they hang out, what they already believe.",
  },
};

const PLATFORMS = [
  { value: "tiktok", label: "TikTok", icon: Music2 },
  { value: "instagram", label: "Instagram", icon: AtSign },
] as const;

function DocEditorModal({ doc, onClose }: { doc: BrainDoc; onClose: () => void }) {
  const [text, setText] = useState(doc.body);
  const [cleaning, setCleaning] = useState(false);
  const [saving, startSave] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const meta = DOC_META[doc.kind];

  const cleanUp = () => {
    if (!text.trim() || cleaning) return;
    setError(null);
    setCleaning(true);
    void cleanUpBrainDoc({ text }).then((result) => {
      if (result.ok) setText(result.text);
      else setError(result.error);
      setCleaning(false);
    });
  };

  const save = () => {
    if (!text.trim() || saving) return;
    setError(null);
    startSave(async () => {
      const result = await saveBrainDoc({ kind: doc.kind, body: text });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onClose();
    });
  };

  return (
    <Modal title={doc.title} onClose={onClose}>
      <p className="mx-0 mb-3 mt-0 text-[13px] font-semibold leading-normal text-slate-400">
        {meta.editorHint}
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={11}
        autoFocus
        placeholder="Write it the way you'd explain it to a new hire."
        className={`box-border w-full resize-y border border-line bg-white px-3.5 py-3 text-[14px] font-semibold leading-[1.6] text-ink outline-none rounded-ops-sm transition-opacity duration-[160ms] ease-om ${
          cleaning ? "opacity-50" : ""
        }`}
      />
      {error ? (
        <p className="m-0 mt-2 text-[13px] font-semibold text-danger">{error}</p>
      ) : null}
      <div className="mt-3.5 flex items-center gap-2.5">
        <span className="flex-1" />
        <Pill
          size="sm"
          variant="tint"
          icon={Sparkles}
          onClick={cleanUp}
          disabled={!text.trim() || cleaning}
        >
          {cleaning ? "Cleaning up…" : "Clean up with AI"}
        </Pill>
        <Pill size="sm" onClick={save} disabled={!text.trim() || saving}>
          {saving ? "Saving…" : "Done"}
        </Pill>
      </div>
    </Modal>
  );
}

function DocCard({ doc, onOpen }: { doc: BrainDoc; onOpen: () => void }) {
  const meta = DOC_META[doc.kind];
  const filled = Boolean(doc.body.trim());
  const words = filled ? doc.body.trim().split(/\s+/).length : 0;

  return (
    <Card pad={20} lift onClick={onOpen} className="box-border flex h-full flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <Label className="flex-1">{doc.title}</Label>
        {filled ? (
          <Chip tone="green" style={{ padding: "3px 9px", fontSize: 11.5 }}>
            <Check size={11} /> Filled in
          </Chip>
        ) : (
          <Chip tone="amber" style={{ padding: "3px 9px", fontSize: 11.5 }}>
            Empty
          </Chip>
        )}
      </div>
      {filled ? (
        <>
          <p className="m-0 line-clamp-4 flex-1 text-[13.5px] font-semibold leading-[1.6] text-ink">
            {doc.body}
          </p>
          <span className="text-[12.5px] font-semibold text-slate-400">
            {words} words · updated {doc.updated || "just now"}
          </span>
        </>
      ) : (
        <>
          <p className="m-0 flex-1 text-[13.5px] font-semibold leading-[1.6] text-slate-400">
            {meta.hint}
          </p>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-blue-700">
            <Pencil size={13} /> Click to fill it in
          </span>
        </>
      )}
    </Card>
  );
}

export function BrainView({
  docs,
  accounts,
}: {
  docs: BrainDoc[];
  accounts: InspirationAccount[];
}) {
  const [editing, setEditing] = useState<BrainDoc | null>(null);
  const [adding, setAdding] = useState(false);
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<BrainActionResult>) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error);
    });
  };

  const addAccount = () => {
    const h = handle.trim();
    if (!h || pending) return;
    run(() => addInspirationAccount({ platform, handle: h }));
    setHandle("");
    setAdding(false);
  };

  return (
    <div>
      <PageHead
        title="Company Brain"
        sub="Noni writes every hook, script and caption from this. The better it is, the better every brief."
      />
      <div className="grid grid-cols-2 gap-3.5">
        {docs.map((d) => (
          <DocCard key={d.kind} doc={d} onOpen={() => setEditing(d)} />
        ))}
      </div>
      <Card pad={0} className="mt-3.5">
        <div className="flex items-center gap-2.5 px-5 py-4">
          <span className="flex-1">
            <Label>Inspiration accounts</Label>
            <span className="mt-[3px] block text-[13px] font-semibold text-slate-400">
              We watch these to see what already works in your niche.
            </span>
          </span>
          <Pill size="sm" variant="tint" icon={Plus} onClick={() => setAdding(true)}>
            Add account
          </Pill>
        </div>
        {adding ? (
          <div className="flex items-center gap-2.5 border-t border-line px-5 py-3 animate-om-rise">
            <Segmented
              options={PLATFORMS}
              value={platform}
              onSelect={setPlatform}
            />
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addAccount();
              }}
              placeholder="@handle"
              autoFocus
              className="min-w-0 flex-1 border border-line bg-white px-3.5 py-[9px] text-[13.5px] font-semibold text-ink outline-none rounded-pill focus:border-blue-500"
            />
            <Pill size="sm" onClick={addAccount} disabled={!handle.trim() || pending}>
              Add
            </Pill>
          </div>
        ) : null}
        {error ? (
          <p className="m-0 border-t border-line px-5 py-3 text-[13px] font-semibold text-danger">
            {error}
          </p>
        ) : null}
        {accounts.length === 0 && !adding ? (
          <p className="m-0 border-t border-line px-5 py-3.5 text-[13.5px] font-semibold text-slate-400">
            No accounts yet. Add the TikTok and Instagram accounts your
            customers already follow.
          </p>
        ) : null}
        {accounts.map((a) => (
          <div
            key={a.platform + a.handle}
            className="flex items-center gap-[11px] border-t border-line px-5 py-[11px]"
          >
            {a.platform === "tiktok" ? (
              <Music2 size={15} className="shrink-0 text-slate-500" />
            ) : (
              <AtSign size={15} className="shrink-0 text-slate-500" />
            )}
            <span
              className={`flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] font-bold ${
                a.muted ? "text-slate-400" : "text-ink"
              }`}
            >
              {a.handle}
            </span>
            <Chip tone="slate" style={{ padding: "3px 9px", fontSize: 11.5 }}>
              Reference
            </Chip>
            <Pill
              size="sm"
              variant="quiet"
              onClick={() =>
                run(() =>
                  setInspirationAccountMuted({
                    platform: a.platform,
                    handle: a.handle,
                    muted: !a.muted,
                  }),
                )
              }
            >
              {a.muted ? "Muted" : "Mute"}
            </Pill>
            <button
              type="button"
              aria-label="Remove"
              onClick={() =>
                run(() =>
                  removeInspirationAccount({
                    platform: a.platform,
                    handle: a.handle,
                  }),
                )
              }
              className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent rounded-pill hover:bg-fill-quiet"
            >
              <X size={13} className="text-slate-400" />
            </button>
          </div>
        ))}
      </Card>
      {editing ? (
        <DocEditorModal doc={editing} onClose={() => setEditing(null)} />
      ) : null}
    </div>
  );
}

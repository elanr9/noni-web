"use client";

import { AtSign, Check, ImagePlus, Mic, Music2, Pencil, Plus, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import {
  addInspirationAccount,
  addProductFeature,
  cleanUpBrainDoc,
  rankBrainFeatures,
  removeInspirationAccount,
  removeProductFeature,
  saveBrainDoc,
  setInspirationAccountMuted,
  speakBrainDoc,
  type BrainActionResult,
} from "@/app/admin/brain/actions";
import { Segmented } from "@/components/admin/posts/Segmented";
import { Card, Chip, Label, Modal, PageHead, Pill } from "@/components/kit";
import type {
  BrainDoc,
  BriefTemplate,
  InspirationAccount,
  Platform,
  ProductFeature,
} from "@/lib/admin/types";

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

const RECORDER_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

function recorderMime(): string {
  return RECORDER_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function fmtCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return Math.round(n / 1_000) + "k";
  return String(n);
}

function scoreChip(score: number | null): { tone: "green" | "blue" | "slate"; label: string } {
  if (score == null) return { tone: "slate", label: "Unranked" };
  if (score >= 80) return { tone: "green", label: "Best" };
  if (score >= 60) return { tone: "blue", label: "Strong" };
  return { tone: "slate", label: "Skip" };
}

function FeatureModal({ onClose }: { onClose: () => void }) {
  const [sentence, setSentence] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const pick = (next: File | undefined) => {
    if (!next) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setError(null);
  };

  const save = () => {
    if (!file || !sentence.trim() || saving) return;
    setError(null);
    setSaving(true);
    void addProductFeature({ sentence, image: file }).then((result) => {
      if (result.ok) onClose();
      else {
        setError(result.error);
        setSaving(false);
      }
    });
  };

  return (
    <Modal title="Add a feature" onClose={onClose}>
      <p className="mx-0 mb-3 mt-0 text-[13px] font-semibold leading-normal text-slate-400">
        Screenshot the feature and one sentence on what it does. We rank what
        will travel, then stamp this week&apos;s briefs from that.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mb-3 flex min-h-[160px] w-full cursor-pointer items-center justify-center overflow-hidden border border-dashed border-line bg-fill-quiet text-left rounded-ops-sm"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="max-h-[220px] w-full object-contain" />
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-blue-700">
            <ImagePlus size={15} /> Upload a screenshot
          </span>
        )}
      </button>
      <textarea
        value={sentence}
        onChange={(e) => setSentence(e.target.value)}
        rows={3}
        autoFocus
        placeholder="One sentence. What it does, in the buyer's words."
        className="box-border w-full resize-y border border-line bg-white px-3.5 py-3 text-[14px] font-semibold leading-[1.6] text-ink outline-none rounded-ops-sm"
      />
      {error ? (
        <p className="m-0 mt-2 text-[13px] font-semibold text-danger">{error}</p>
      ) : null}
      <div className="mt-3.5 flex items-center gap-2.5">
        <span className="flex-1" />
        <Pill
          size="sm"
          onClick={save}
          disabled={!file || !sentence.trim() || saving}
          icon={Sparkles}
        >
          {saving ? "Ranking…" : "Add feature"}
        </Pill>
      </div>
    </Modal>
  );
}

function FeaturesCard({
  features,
  templates,
}: {
  features: ProductFeature[];
  templates: BriefTemplate[];
}) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<BrainActionResult>) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error);
    });
  };

  return (
    <Card pad={0} className="mt-3.5">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <span className="flex-1">
          <Label>Features</Label>
          <span className="mt-[3px] block text-[13px] font-semibold text-slate-400">
            Screenshot plus one sentence. We pick what can go most viral and
            stamp the week&apos;s briefs from that.
          </span>
        </span>
        {features.length > 0 ? (
          <Pill
            size="sm"
            variant="quiet"
            icon={Sparkles}
            onClick={() => run(() => rankBrainFeatures())}
            disabled={pending}
          >
            {pending ? "Ranking…" : "Rank with AI"}
          </Pill>
        ) : null}
        <Pill size="sm" variant="tint" icon={Plus} onClick={() => setAdding(true)}>
          Add feature
        </Pill>
      </div>
      {error ? (
        <p className="m-0 border-t border-line px-5 py-3 text-[13px] font-semibold text-danger">
          {error}
        </p>
      ) : null}
      {features.length === 0 ? (
        <p className="m-0 border-t border-line px-5 py-3.5 text-[13.5px] font-semibold text-slate-400">
          No features yet. Add a screenshot and one sentence for each thing
          you sell.
        </p>
      ) : null}
      {features.map((feature) => {
        const chip = scoreChip(feature.score);
        return (
          <div
            key={feature.id}
            className="flex items-start gap-3 border-t border-line px-5 py-3"
          >
            {feature.screenshotUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={feature.screenshotUrl}
                alt=""
                className="h-14 w-14 shrink-0 object-cover border border-line rounded-ops-sm"
              />
            ) : (
              <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center bg-fill-quiet text-slate-400 rounded-ops-sm">
                <ImagePlus size={16} />
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] font-bold text-ink">
                  {feature.name || "New feature"}
                </span>
                <Chip tone={chip.tone} style={{ padding: "3px 9px", fontSize: 11.5 }}>
                  {feature.score != null ? `${chip.label} · ${feature.score}` : chip.label}
                </Chip>
              </span>
              <p className="m-0 mt-1 text-[13px] font-semibold leading-[1.5] text-ink">
                {feature.sentence}
              </p>
              {feature.reason ? (
                <p className="m-0 mt-1 text-[12.5px] font-semibold leading-[1.45] text-slate-400">
                  {feature.reason}
                </p>
              ) : null}
            </span>
            <button
              type="button"
              aria-label="Remove"
              onClick={() => run(() => removeProductFeature({ id: feature.id }))}
              className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent rounded-pill hover:bg-fill-quiet"
            >
              <X size={13} className="text-slate-400" />
            </button>
          </div>
        );
      })}
      {templates.length > 0 ? (
        <div className="border-t border-line px-5 py-4">
          <Label>This week&apos;s briefs</Label>
          <span className="mt-[3px] mb-3 block text-[13px] font-semibold text-slate-400">
            One example, one sentence, one action. Campaign managers just pick
            and go.
          </span>
          <div className="flex flex-col gap-2.5">
            {templates.map((t) => (
              <div
                key={t.id}
                className="border border-line bg-white px-3.5 py-3 rounded-ops-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 text-[13.5px] font-bold text-ink">
                    {t.title}
                  </span>
                  <Chip tone="slate" style={{ padding: "3px 9px", fontSize: 11.5 }}>
                    {t.format}
                    {t.typeLabel ? ` · ${t.typeLabel}` : ""}
                  </Chip>
                </div>
                <p className="m-0 mt-1.5 text-[13px] font-semibold leading-[1.5] text-ink">
                  {t.example}
                </p>
                <p className="m-0 mt-1 text-[13px] font-semibold leading-[1.5] text-slate-500">
                  {t.description}
                </p>
                <p className="m-0 mt-1 text-[13px] font-bold text-blue-700">
                  {t.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {adding ? <FeatureModal onClose={() => setAdding(false)} /> : null}
    </Card>
  );
}

function DocEditorModal({ doc, onClose }: { doc: BrainDoc; onClose: () => void }) {
  const [text, setText] = useState(doc.body);
  const [cleaning, setCleaning] = useState(false);
  const [recording, setRecording] = useState(false);
  const [saving, startSave] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const textRef = useRef(text);
  const liveRef = useRef(true);
  const meta = DOC_META[doc.kind];
  textRef.current = text;

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    liveRef.current = true;
    return () => {
      liveRef.current = false;
      recorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const finishVoice = (blob: Blob) => {
    const ext = blob.type.includes("mp4") ? "m4a" : "webm";
    const type = (blob.type || "audio/webm").split(";")[0];
    const audio = new File([blob], `voice.${ext}`, { type });
    setError(null);
    setCleaning(true);
    void speakBrainDoc({ kind: doc.kind, existing: textRef.current, audio }).then((result) => {
      if (result.ok) setText(result.text);
      else setError(result.error);
      setCleaning(false);
    });
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    recorder.stop();
  };

  const startRecording = async () => {
    if (recording || cleaning) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = recorderMime();
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        setRecording(false);
        recorderRef.current = null;
        stopTracks();
        if (!liveRef.current) return;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];
        if (blob.size < 200) {
          setError("Didn't catch that. Try speaking again.");
          return;
        }
        finishVoice(blob);
      };
      recorderRef.current = recorder;
      recorder.start(250);
      setRecording(true);
    } catch (err) {
      stopTracks();
      const name = err instanceof DOMException ? err.name : "";
      setError(
        name === "NotAllowedError"
          ? "Microphone access is blocked. Allow it in the browser and try again."
          : "Couldn't start the microphone.",
      );
    }
  };

  const cleanUp = () => {
    if (!text.trim() || cleaning || recording) return;
    setError(null);
    setCleaning(true);
    void cleanUpBrainDoc({ kind: doc.kind, text }).then((result) => {
      if (result.ok) setText(result.text);
      else setError(result.error);
      setCleaning(false);
    });
  };

  const save = () => {
    if (!text.trim() || saving || recording || cleaning) return;
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

  const busy = cleaning || recording;

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
        disabled={busy}
        placeholder={
          recording
            ? "Listening… tap Speak when you're done."
            : "Write it the way you'd explain it to a new hire."
        }
        className={`box-border w-full resize-y border border-line bg-white px-3.5 py-3 text-[14px] font-semibold leading-[1.6] text-ink outline-none rounded-ops-sm transition-opacity duration-[160ms] ease-om ${
          busy ? "opacity-50" : ""
        }`}
      />
      {error ? (
        <p className="m-0 mt-2 text-[13px] font-semibold text-danger">{error}</p>
      ) : null}
      <div className="mt-3.5 flex items-center gap-2.5">
        <Pill
          size="sm"
          variant={recording ? "danger" : "tint"}
          icon={Mic}
          onClick={recording ? stopRecording : () => void startRecording()}
          disabled={cleaning}
        >
          {recording ? "Listening…" : "Speak"}
        </Pill>
        <span className="flex-1" />
        <Pill
          size="sm"
          variant="tint"
          icon={Sparkles}
          onClick={cleanUp}
          disabled={!text.trim() || busy}
        >
          {cleaning && !recording ? "Cleaning up…" : "Clean up with AI"}
        </Pill>
        <Pill size="sm" onClick={save} disabled={!text.trim() || saving || busy}>
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
  features,
  templates,
}: {
  docs: BrainDoc[];
  accounts: InspirationAccount[];
  features: ProductFeature[];
  templates: BriefTemplate[];
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
    setError(null);
    startTransition(async () => {
      const result = await addInspirationAccount({ platform, handle: h });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setHandle("");
      setAdding(false);
    });
  };

  return (
    <div>
      <PageHead
        title="Company Brain"
        sub="Noni writes every hook, script and caption from this. The better it is, the better every brief."
      />
      <div data-tour="brain-docs" className="grid grid-cols-2 gap-3.5">
        {docs.map((d) => (
          <DocCard key={d.kind} doc={d} onOpen={() => setEditing(d)} />
        ))}
      </div>
      <FeaturesCard features={features} templates={templates} />
      <Card pad={0} className="mt-3.5">
        <div data-tour="brain-inspiration" className="flex items-center gap-2.5 px-5 py-4">
          <span className="flex-1">
            <Label>Inspiration accounts</Label>
            <span className="mt-[3px] block text-[13px] font-semibold text-slate-400">
              We pull their top 5 posts so briefs copy what already works.
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
              {pending ? "Pulling posts…" : "Add"}
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
            No accounts yet. Add a TikTok or Instagram handle. We save their
            best posts for brief generation.
          </p>
        ) : null}
        {accounts.map((a) => (
          <div key={a.platform + a.handle} className="border-t border-line">
            <div className="flex items-center gap-[11px] px-5 py-[11px]">
              {a.platform === "tiktok" ? (
                <Music2 size={15} className="shrink-0 text-slate-500" />
              ) : (
                <AtSign size={15} className="shrink-0 text-slate-500" />
              )}
              <span className="min-w-0 flex-1">
                <span
                  className={`block overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] font-bold ${
                    a.muted ? "text-slate-400" : "text-ink"
                  }`}
                >
                  {a.handle}
                </span>
                {a.posts.length > 0 ? (
                  <span className="text-[12px] font-semibold text-slate-400">
                    {a.posts.length} top post{a.posts.length === 1 ? "" : "s"} ·{" "}
                    {fmtCount(a.posts[0]?.views ?? 0)} views on the best one
                  </span>
                ) : null}
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
            {a.posts.length > 0 ? (
              <div className="flex flex-col gap-1.5 px-5 pb-3 pl-[52px]">
                {a.posts.slice(0, 5).map((p) => (
                  <a
                    key={p.id}
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px] font-semibold text-slate-500 no-underline hover:text-blue-700"
                  >
                    {fmtCount(p.views)} views
                    {p.likes ? ` · ${fmtCount(p.likes)} likes` : ""}
                    {p.shares ? ` · ${fmtCount(p.shares)} shares` : ""}
                    {" · "}
                    {p.hook || p.caption || "Saved post"}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </Card>
      {editing ? (
        <DocEditorModal doc={editing} onClose={() => setEditing(null)} />
      ) : null}
    </div>
  );
}

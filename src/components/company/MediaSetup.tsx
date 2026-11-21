"use client";

import { ArrowRight, Check, Plus } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type DragEvent } from "react";

import { addMediaLibraryItem, saveThemeColor } from "@/app/manager/media/actions";
import { Burst } from "@/components/admin/brain/BrainConfirm";
import { PostTextPreview } from "@/components/company/PostTextPreview";
import { useNavigate } from "@/components/motion/NavProgress";
import {
  checkMediaFile,
  THEME_SWATCHES,
  themeTextColor,
  type MediaKind,
} from "@/lib/media-library-shared";
import { prepareMedia, uploadToLibrary } from "@/lib/media-library-upload";

/* Getting a company's product into Noni, one thing per screen so there is
   never a choice of where to go: three screenshots, one screen recording,
   then the color of the text on its posts. Each screen is a title, the
   slots to fill and one button. Files upload as they are dropped, with no
   naming step; they can be named later in the Media library. */

const NONI_BLUE = "#1BA6EE";
const STEPS = ["shots", "recording", "color", "done"] as const;
type Step = (typeof STEPS)[number];

const SHOT_SLOTS = 3;
const ACCEPT: Record<MediaKind, string> = {
  screenshot: "image/jpeg,image/png,image/webp,image/heic,image/heif",
  recording: "video/mp4,video/quicktime",
};

type Slot = { url: string; busy: boolean };

export function MediaSetup({
  companyId,
  name,
  themeColor,
  shots: initialShots,
  recordings: initialRecordings,
}: {
  companyId: string;
  /** What people call the product, e.g. "Inkbound". */
  name: string;
  themeColor: string | null;
  /** Preview URLs of what is already in the library. */
  shots: string[];
  recordings: string[];
}) {
  const { go, pending: leaving } = useNavigate();
  const [step, setStep] = useState<Step>("shots");
  const [shots, setShots] = useState<Slot[]>(initialShots.map((url) => ({ url, busy: false })));
  const [recs, setRecs] = useState<Slot[]>(initialRecordings.map((url) => ({ url, busy: false })));
  const [color, setColor] = useState(themeColor ?? NONI_BLUE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  /* Uploads run one after another: the library names files by the clock. */
  const queue = useRef<Promise<void>>(Promise.resolve());

  const accent = color;
  const onAccent = themeTextColor(accent);
  const sparks = [accent, "#22C55E", "#FBBF24", accent];
  const kind: MediaKind = step === "recording" ? "recording" : "screenshot";
  const at = STEPS.indexOf(step);

  /* Each file shows at once from the device and uploads behind it. */
  const add = (files: FileList | File[]) => {
    setError(null);
    for (const file of Array.from(files)) {
      const check = checkMediaFile(file);
      if (!check.ok) {
        setError(check.error);
        continue;
      }
      if (check.kind !== kind) {
        setError(kind === "screenshot" ? "That is a video. Add an image here." : "That is an image. Add a video here.");
        continue;
      }
      const url = URL.createObjectURL(file);
      const set = kind === "screenshot" ? setShots : setRecs;
      set((prev) => [...prev, { url, busy: true }]);
      const settle = (ok: boolean) =>
        set((prev) =>
          ok ? prev.map((s) => (s.url === url ? { ...s, busy: false } : s)) : prev.filter((s) => s.url !== url),
        );
      queue.current = queue.current.then(async () => {
        try {
          const prepared = await prepareMedia(file, check.kind);
          const uploaded = await uploadToLibrary(companyId, prepared, () => undefined);
          const result = await addMediaLibraryItem({
            kind: prepared.kind,
            title: null,
            description: null,
            path: uploaded.path,
            thumbPath: uploaded.thumbPath,
            durationMs: prepared.durationMs,
            width: prepared.width,
            height: prepared.height,
          });
          if (!result.ok) setError(result.error);
          settle(result.ok);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Upload failed. Try again.");
          settle(false);
        }
      });
    }
  };

  const onDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    setOver(false);
    if (step === "shots" || step === "recording") add(e.dataTransfer.files);
  };

  const saveColor = () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    void saveThemeColor(color).then((result) => {
      setSaving(false);
      if (result.ok) setStep("done");
      else setError(result.error);
    });
  };

  const uploading = [...shots, ...recs].some((s) => s.busy);
  const primary =
    "group inline-flex cursor-pointer items-center gap-2 rounded-full border-none px-9 py-[18px] text-[18px] font-bold transition-[transform,filter,opacity] duration-150 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:scale-[0.96] disabled:cursor-default disabled:opacity-35 disabled:hover:translate-y-0";
  const primaryStyle = {
    backgroundColor: accent,
    color: onAccent,
    boxShadow: `0 12px 28px color-mix(in srgb, ${accent} 34%, transparent)`,
  };

  /* A slot: empty with a plus, or filled with the file and a popped check. */
  const slot = (s: Slot | undefined, i: number, wide: boolean) => (
    <button
      key={s?.url ?? `empty-${i}`}
      type="button"
      onClick={() => (s ? undefined : input.current?.click())}
      className={`relative flex items-center justify-center overflow-hidden rounded-[22px] transition-transform duration-150 ${
        wide ? "h-[300px] w-[169px]" : "h-[260px] w-[146px]"
      } ${
        s
          ? "cursor-default border-none bg-ink-900 shadow-[0_10px_30px_rgba(15,23,42,0.14)] animate-om-bounce"
          : "cursor-pointer border-2 border-dashed bg-white hover:-translate-y-1 active:scale-[0.97]"
      }`}
      style={s ? undefined : { borderColor: over ? accent : "#D5DEE8" }}
    >
      {s ? (
        <>
          {kind === "recording" && s.url.startsWith("blob:") ? (
            <video src={s.url} muted playsInline className="h-full w-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.url} alt="" className="h-full w-full object-cover" />
          )}
          <span
            className={`absolute right-2.5 top-2.5 inline-flex h-7 w-7 items-center justify-center rounded-full ${
              s.busy ? "bg-white/90" : "animate-om-check"
            }`}
            style={s.busy ? undefined : { backgroundColor: "#22C55E", color: "#FFFFFF" }}
          >
            {s.busy ? <span className="om-spinner text-ink" /> : <Check size={15} strokeWidth={3.5} />}
            {s.busy ? null : <Burst colors={sparks} />}
          </span>
        </>
      ) : (
        <span
          className="inline-flex h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: `color-mix(in srgb, ${accent} 14%, white)`, color: accent }}
        >
          <Plus size={22} strokeWidth={2.6} />
        </span>
      )}
    </button>
  );

  return (
    <div
      className="flex min-h-screen flex-col bg-[#fbfbfc] font-ops"
      onDragOver={(e) => {
        e.preventDefault();
        if (!over) setOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={onDrop}
    >
      <header className="flex items-center gap-[9px] px-5 py-4 sm:px-7">
        <Image src="/brand/noni-logo.svg" alt="" width={26} height={26} />
        <span className="text-[18px] font-bold tracking-[-0.6px] text-ink">noni</span>
        <span className="flex-1" />
        <span className="flex items-center gap-1.5" aria-label={`Step ${Math.min(at + 1, 3)} of 3`}>
          {STEPS.slice(0, 3).map((key, i) =>
            i < at ? (
              <span
                key={`${key}-done`}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full animate-om-check"
                style={{ backgroundColor: accent, color: onAccent }}
              >
                <Check size={13} strokeWidth={3.5} />
              </span>
            ) : (
              <span
                key={key}
                className={`h-6 w-6 rounded-full border-2 bg-white ${i === at ? "" : "border-line"}`}
                style={i === at ? { borderColor: accent } : undefined}
              />
            ),
          )}
        </span>
      </header>

      <input
        ref={input}
        type="file"
        accept={ACCEPT[kind]}
        multiple={kind === "screenshot"}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) add(e.target.files);
          e.target.value = "";
        }}
      />

      <main
        key={step}
        className="mx-auto flex w-full max-w-[760px] flex-1 flex-col items-center justify-center gap-8 px-5 pb-20 text-center animate-om-rise"
      >
        {step === "shots" ? (
          <>
            <h1 className="display m-0 text-[44px] font-bold leading-[1.05] tracking-[-1.4px] text-ink">
              Add 3 screenshots of <span style={{ color: accent }}>{name}</span>
            </h1>
            <div className="flex flex-wrap justify-center gap-4">
              {Array.from({ length: Math.max(SHOT_SLOTS, shots.length) }, (_, i) => slot(shots[i], i, false))}
            </div>
            <button
              type="button"
              disabled={shots.length === 0 || uploading}
              onClick={() => setStep("recording")}
              className={primary}
              style={primaryStyle}
            >
              Next
              <ArrowRight size={19} className="transition-transform duration-150 group-hover:translate-x-1" />
            </button>
          </>
        ) : null}

        {step === "recording" ? (
          <>
            <h1 className="display m-0 text-[44px] font-bold leading-[1.05] tracking-[-1.4px] text-ink">
              Add a screen recording
            </h1>
            <div className="flex flex-wrap justify-center gap-4">
              {recs.length > 0 ? recs.map((s, i) => slot(s, i, true)) : slot(undefined, 0, true)}
            </div>
            <button
              type="button"
              disabled={recs.length === 0 || uploading}
              onClick={() => setStep("color")}
              className={primary}
              style={primaryStyle}
            >
              Next
              <ArrowRight size={19} className="transition-transform duration-150 group-hover:translate-x-1" />
            </button>
          </>
        ) : null}

        {step === "color" ? (
          <>
            <h1 className="display m-0 text-[44px] font-bold leading-[1.05] tracking-[-1.4px] text-ink">
              Is this your color?
            </h1>
            <div
              className="relative flex h-[260px] w-[146px] items-center justify-center overflow-hidden bg-ink-900 px-2 rounded-[22px] shadow-[0_10px_30px_rgba(15,23,42,0.14)]"
              aria-hidden
            >
              {shots[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shots[0].url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
              ) : null}
              <span className="relative flex max-w-full justify-center text-center">
                <PostTextPreview text={`${name} is crazy`} color={color} fontSize={14} />
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-2.5">
              {[...new Set([themeColor, ...THEME_SWATCHES].filter((c): c is string => Boolean(c)))].map((hex) => (
                <button
                  key={hex}
                  type="button"
                  aria-label={hex}
                  aria-pressed={color === hex}
                  onClick={() => setColor(hex)}
                  className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 transition-transform duration-150 hover:scale-110 active:scale-95 ${
                    color === hex ? "border-ink" : "border-white shadow-card"
                  }`}
                  style={{ backgroundColor: hex }}
                >
                  {color === hex ? (
                    <Check size={16} strokeWidth={3.5} color={themeTextColor(hex)} className="animate-om-check" />
                  ) : null}
                </button>
              ))}
            </div>
            <button type="button" disabled={saving} onClick={saveColor} className={primary} style={primaryStyle}>
              {saving ? <span className="om-spinner" /> : <Check size={19} strokeWidth={3} />}
              Yes
            </button>
          </>
        ) : null}

        {step === "done" ? (
          <>
            <span
              className="relative inline-flex h-20 w-20 items-center justify-center rounded-full animate-om-check"
              style={{ backgroundColor: "#22C55E", color: "#FFFFFF" }}
            >
              <Burst colors={sparks} count={30} reach={150} />
              <Check size={40} strokeWidth={3.5} />
            </span>
            <h1 className="display m-0 text-[44px] font-bold leading-[1.05] tracking-[-1.4px] text-ink">
              <span style={{ color: accent }}>{name}</span> is in.
            </h1>
            <button type="button" disabled={leaving} onClick={() => go("/admin")} className={primary} style={primaryStyle}>
              Done
              <ArrowRight size={19} className="transition-transform duration-150 group-hover:translate-x-1" />
            </button>
          </>
        ) : null}

        {error ? <p className="m-0 text-[14px] font-semibold text-danger">{error}</p> : null}
      </main>
    </div>
  );
}

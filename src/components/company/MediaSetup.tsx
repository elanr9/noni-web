"use client";

import { ArrowRight, Check, Plus, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type DragEvent } from "react";

import { addMediaLibraryItem, removeMediaLibraryItem, saveThemeColor } from "@/app/manager/media/actions";
import { Burst } from "@/components/admin/brain/BrainConfirm";
import { PostTextPreview } from "@/components/company/PostTextPreview";
import { useNavigate } from "@/components/motion/NavProgress";
import { BackButton } from "@/components/onboarding/BackButton";
import {
  checkMediaFile,
  THEME_SWATCHES,
  themeTextColor,
  type MediaKind,
} from "@/lib/media-library-shared";
import { prepareMedia, uploadToLibrary } from "@/lib/media-library-upload";

/* Getting a company's product into Noni, one thing per screen so there is
   never a choice of where to go. Two onboarding steps open it: "Add
   screenshots" runs a screenshot then a screen recording for each top
   feature, with a toggle in the header to move between the two, and "Pick
   your color" opens on the color of the text on its posts. Each screen is a title, the
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

/** A file in a slot. `title` is the feature it was asked for; `id` is its library row once saved. */
type Slot = { url: string; busy: boolean; title?: string | null; id?: string | null };
/** What opened the file picker: a feature's card, the plus for more, or a filled card being changed. */
type Target = { feature?: string | null; more?: boolean; replace?: Slot };

const same = (a: string | null | undefined, b: string) => (a ?? "").trim().toLowerCase() === b.trim().toLowerCase();

export function MediaSetup({
  companyId,
  name,
  themeColor,
  features = [],
  shots: initialShots,
  recordings: initialRecordings,
  start = "shots",
}: {
  companyId: string;
  /** What people call the product, e.g. "Inkbound". */
  name: string;
  themeColor: string | null;
  /** The company's top features, one screenshot and one recording each, named under its card. Empty: plain cards. */
  features?: string[];
  /** What is already in the library: preview URLs, and the feature each was added for. */
  shots: Array<{ id: string; url: string; title: string | null }>;
  recordings: Array<{ id: string; url: string; title: string | null }>;
  /** Open on the color screen, for the "Pick your color" step on its own. */
  start?: "shots" | "color";
}) {
  const { go, pending: leaving } = useNavigate();
  const [step, setStep] = useState<Step>(start);
  const [shots, setShots] = useState<Slot[]>(initialShots.map((s) => ({ ...s, busy: false })));
  const [recs, setRecs] = useState<Slot[]>(initialRecordings.map((s) => ({ ...s, busy: false })));
  const [color, setColor] = useState(themeColor ?? NONI_BLUE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  /* What opened the file picker, so its file lands in the right place. */
  const target = useRef<Target>({});
  /* Uploads run one after another: the library names files by the clock. */
  const queue = useRef<Promise<void>>(Promise.resolve());

  const accent = color;
  const onAccent = themeTextColor(accent);
  const sparks = [accent, "#22C55E", "#FBBF24", accent];
  const kind: MediaKind = step === "recording" ? "recording" : "screenshot";
  const at = STEPS.indexOf(step);

  /* With features, each card holds the file named for it; the rest are extras. */
  const fileFor = (list: Slot[], feature: string) => list.find((s) => same(s.title, feature));
  const extrasOf = (list: Slot[]) => list.filter((s) => !features.some((f) => same(s.title, f)));
  const current = kind === "screenshot" ? shots : recs;

  /* Each file shows at once from the device and uploads behind it. A file
     for a feature card is named for that feature; more files, and dropped
     ones, fill the empty feature cards in order. Files from the plus are
     saved unnamed. A file that takes a filled card's place deletes the old
     one from the library once it is saved. */
  const add = (files: FileList | File[], { feature = null, more = false, replace }: Target = {}) => {
    setError(null);
    const open = features.filter((f) => !fileFor(current, f) && f !== feature);
    const names = more ? [] : feature ? [feature, ...open] : open;
    let list = Array.from(files);
    if (replace) list = list.slice(0, 1);
    else if (features.length > 0 && !more) list = list.slice(0, names.length);
    for (const [n, file] of list.entries()) {
      const title = names[n] ?? null;
      const old = current.filter((s) => (replace ? s.url === replace.url : Boolean(title) && same(s.title, title!)));
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
      set((prev) => [...prev.filter((s) => !old.some((o) => o.url === s.url)), { url, busy: true, title }]);
      const settle = (ok: boolean, id: string | null = null) => {
        set((prev) =>
          ok ? prev.map((s) => (s.url === url ? { ...s, busy: false, id } : s)) : prev.filter((s) => s.url !== url),
        );
        if (ok) for (const o of old) if (o.id) void removeMediaLibraryItem(o.id);
      };
      queue.current = queue.current.then(async () => {
        try {
          const prepared = await prepareMedia(file, check.kind);
          const uploaded = await uploadToLibrary(companyId, prepared, () => undefined);
          const result = await addMediaLibraryItem({
            kind: prepared.kind,
            title,
            description: null,
            path: uploaded.path,
            thumbPath: uploaded.thumbPath,
            durationMs: prepared.durationMs,
            width: prepared.width,
            height: prepared.height,
          });
          if (!result.ok) setError(result.error);
          settle(result.ok, result.ok ? (result.id ?? null) : null);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Upload failed. Try again.");
          settle(false);
        }
      });
    }
  };

  const remove = (s: Slot) => {
    setError(null);
    (kind === "screenshot" ? setShots : setRecs)((prev) => prev.filter((x) => x.url !== s.url));
    if (s.id)
      void removeMediaLibraryItem(s.id).then((result) => {
        if (!result.ok) setError(result.error);
      });
  };
  const pick = (t: Target) => {
    target.current = t;
    input.current?.click();
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

  /* Back walks the screens in reverse; from the first one it is the dashboard. */
  const back = () => {
    setError(null);
    if (step === "recording") setStep("shots");
    else if (step === "done") setStep(start === "color" ? "color" : "recording");
    else go("/admin");
  };
  const primary =
    "group inline-flex cursor-pointer items-center gap-2 rounded-full border-none px-9 py-[18px] text-[18px] font-bold transition-[transform,filter,opacity] duration-150 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:scale-[0.96] disabled:cursor-default disabled:opacity-35 disabled:hover:translate-y-0";
  const primaryStyle = {
    backgroundColor: accent,
    color: onAccent,
    boxShadow: `0 12px 28px color-mix(in srgb, ${accent} 34%, transparent)`,
  };

  /* A slot: empty with a plus, or filled with the file and a popped check.
     A filled slot takes the shape of its own file, so nothing is cropped. */
  const slot = (s: Slot | undefined, i: number, wide: boolean, feature: string | null = null) => {
    const box = wide ? "h-[300px]" : "h-[260px]";
    const fit = wide ? "max-h-[300px] max-w-[min(480px,84vw)]" : "max-h-[260px] max-w-[230px]";
    if (!s) {
      return (
        <button
          key={`empty-${i}`}
          type="button"
          aria-label={feature ?? undefined}
          onClick={() => pick({ feature })}
          className={`relative flex cursor-pointer items-center justify-center rounded-[22px] border-2 border-dashed bg-white transition-transform duration-150 hover:-translate-y-1 active:scale-[0.97] ${box} ${
            wide ? "w-[169px]" : "w-[146px]"
          }`}
          style={{ borderColor: over ? accent : "#D5DEE8" }}
        >
          <span
            className="inline-flex h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: `color-mix(in srgb, ${accent} 14%, white)`, color: accent }}
          >
            <Plus size={22} strokeWidth={2.6} />
          </span>
        </button>
      );
    }
    return (
      <div key={s.url} className={`flex items-center justify-center ${box}`}>
        <div
          role="button"
          tabIndex={0}
          aria-label={feature ?? "Change"}
          onClick={() => (s.busy ? undefined : pick({ feature, more: !feature, replace: s }))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !s.busy) pick({ feature, more: !feature, replace: s });
          }}
          className="relative cursor-pointer overflow-hidden rounded-[6px] shadow-[0_10px_30px_rgba(15,23,42,0.14)] transition-transform duration-150 hover:-translate-y-1 animate-om-bounce"
        >
          {s.busy ? null : (
            <button
              type="button"
              aria-label="Remove"
              onClick={(e) => {
                e.stopPropagation();
                remove(s);
              }}
              className="absolute left-2 top-2 z-10 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-none bg-ink/70 text-white transition-transform duration-150 hover:scale-110 active:scale-95"
            >
              <X size={15} strokeWidth={3} />
            </button>
          )}
          {kind === "recording" && s.url.startsWith("blob:") ? (
            <video src={s.url} muted playsInline className={`block h-auto w-auto ${fit}`} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.url} alt="" className={`block h-auto w-auto ${fit}`} />
          )}
          <span
            className={`absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full ${
              s.busy ? "bg-white/90" : "animate-om-check"
            }`}
            style={s.busy ? undefined : { backgroundColor: "#22C55E", color: "#FFFFFF" }}
          >
            {s.busy ? <span className="om-spinner text-ink" /> : <Check size={15} strokeWidth={3.5} />}
            {s.busy ? null : <Burst colors={sparks} />}
          </span>
        </div>
      </div>
    );
  };

  /* The cards of a screen: one per feature with its name under it, then the
     unnamed extras, then a small plus to add more. With no features, plain cards. */
  const cards = (list: Slot[], wide: boolean, min: number) => {
    const label = wide ? "w-[169px]" : "w-[146px]";
    return (
      <div className="flex flex-wrap items-start justify-center gap-4">
          {features.length > 0 ? (
            <>
              {features.map((feature, i) => (
                <div key={feature} className="flex flex-col items-center gap-2.5">
                  {slot(fileFor(list, feature), i, wide, feature)}
                  <span className={`text-[15px] font-bold leading-[1.3] tracking-[-0.2px] text-ink ${label}`}>
                    {feature}
                  </span>
                </div>
              ))}
              {extrasOf(list).map((s, i) => slot(s, i, wide))}
            </>
          ) : (
            Array.from({ length: Math.max(min, list.length) }, (_, i) => slot(list[i], i, wide))
          )}
          <div className={`flex items-center ${wide ? "h-[300px]" : "h-[260px]"}`}>
            <button
              type="button"
              aria-label="Add more"
              onClick={() => pick({ more: true })}
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-none transition-transform duration-150 hover:scale-110 active:scale-95"
              style={{ backgroundColor: `color-mix(in srgb, ${accent} 14%, white)`, color: accent }}
            >
              <Plus size={22} strokeWidth={2.6} />
            </button>
          </div>
      </div>
    );
  };
  const filled = (list: Slot[]) =>
    features.length > 0 ? features.every((f) => fileFor(list, f)) : list.length > 0;

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
        <BackButton disabled={leaving} onClick={back} />
        <Image src="/brand/noni-logo.svg" alt="" width={26} height={26} />
        <span className="text-[18px] font-bold tracking-[-0.6px] text-ink">noni</span>
        <span className="flex-1" />
        {step === "shots" || step === "recording" ? (
          <span className="inline-flex rounded-full bg-[#EEF1F5] p-1">
            {(["shots", "recording"] as const).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={step === key}
                onClick={() => {
                  setError(null);
                  setStep(key);
                }}
                className={`cursor-pointer rounded-full border-none px-4 py-2 text-[14px] font-bold transition-colors duration-150 ${
                  step === key ? "bg-white text-ink shadow-card" : "bg-transparent text-ink/50 hover:text-ink"
                }`}
              >
                {key === "shots" ? "Screenshots" : "Recordings"}
              </button>
            ))}
          </span>
        ) : null}
        <span className="flex-1" />
        <span className="flex items-center gap-1.5" aria-hidden>
          {(start === "color" ? [] : STEPS.slice(0, 2)).map((key, i) =>
            /* Done is past every dot. */
            i < at || step === "done" ? (
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
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) add(e.target.files, target.current);
          target.current = {};
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
              Add {features.length || SHOT_SLOTS} screenshots of <span style={{ color: accent }}>{name}</span>
            </h1>
            {cards(shots, false, SHOT_SLOTS)}
            <button
              type="button"
              disabled={!filled(shots) || uploading}
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
              {features.length > 1 ? `Add ${features.length} screen recordings` : "Add a screen recording"}
            </h1>
            {cards(recs, true, 1)}
            <button
              type="button"
              disabled={!filled(recs) || uploading}
              onClick={() => setStep(filled(shots) ? "done" : "shots")}
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
              {start === "color" ? (
                "Color set."
              ) : (
                <>
                  <span style={{ color: accent }}>{name}</span> is in.
                </>
              )}
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

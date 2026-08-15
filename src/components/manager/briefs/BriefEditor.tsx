"use client";

import {
  Check,
  ImagePlus,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { Card, Chip, Label, Modal, PageHead, Pill } from "@/components/kit";

import {
  fillBrief,
  regenerateBriefField,
  removeSegmentScreenshot,
  runBriefReview,
  saveBrief,
  confirmBriefReview,
  updateSegment,
  uploadSegmentScreenshot,
} from "@/app/manager/briefs/actions";
import { PostTypeChip } from "./bits";
import {
  briefRowState,
  parseHookOptions,
  parseTalkingPoints,
  parseTextOverlay,
  type BriefFormat,
  type BriefReviewResult,
  type BriefSegment,
  type BriefWithType,
  type Json,
  type PostType,
  type RegenDraftPayload,
  type RegenField,
  type ReviewEventInput,
  type TalkingPoint,
  type TextOverlay,
  type TextOverlayMode,
} from "./lib";

/* Brief detail and editor, ported from the mobile stepped post editor at
   web fidelity: every field on one page. Nothing generates on open, AI
   assist is on demand. Screenshots live on brief_segments keyed by
   talking_point_index. */

/** What save must re-derive segments for: points, hook, or type changed. */
function deriveSnapshot(params: {
  hook: string | null;
  points: TalkingPoint[];
  postTypeId: string | null;
}): string {
  return JSON.stringify({
    hook: params.hook,
    points: params.points.map((p) => ({ id: p.id, text: p.text })),
    postTypeId: params.postTypeId,
  });
}

/** The fields as they stood when review opened, for edit diffs and bans. */
type ReviewSnapshot = {
  hook: string;
  cta: string;
  caption: string;
  searchPhrase: string;
  points: Array<{ id: string; text: string | null; edited_by_admin: boolean }>;
};

const INPUT_CLASS =
  "w-full border border-line bg-white px-3.5 py-3 text-[14px] font-semibold text-ink outline-none rounded-ops-sm focus:border-blue-500 focus:[box-shadow:var(--ring-focus)]";
const TEXTAREA_CLASS = `${INPUT_CLASS} min-h-[92px] resize-y leading-relaxed`;

function SectionCard({
  title,
  intent,
  action,
  children,
}: {
  title: string;
  intent?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card pad={18} className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="block text-[14px] font-bold tracking-[-0.2px] text-ink">
            {title}
          </span>
          {intent ? (
            <span className="mt-0.5 block text-[12px] leading-relaxed text-slate-400">
              {intent}
            </span>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </Card>
  );
}

function RegenButton({
  busy,
  onClick,
  label = "Regenerate",
}: {
  busy: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-none bg-fill-quiet px-3 py-1.5 text-[12px] font-bold text-slate-500 rounded-pill disabled:opacity-35"
    >
      <RefreshCw size={12} className={busy ? "animate-spin" : ""} />
      {busy ? "Working…" : label}
    </button>
  );
}

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="inline-flex cursor-pointer items-center gap-2 border-none bg-transparent p-0"
    >
      <span
        className={`relative inline-block h-[20px] w-[34px] rounded-pill transition-colors duration-[160ms] ease-om ${
          on ? "bg-blue-500" : "bg-fill-quiet"
        }`}
      >
        <span
          className="absolute top-[2px] h-4 w-4 bg-white rounded-pill shadow-card transition-[left] duration-[160ms] ease-om"
          style={{ left: on ? 16 : 2 }}
        />
      </span>
      <span className="text-[12.5px] font-semibold text-slate-500">{label}</span>
    </button>
  );
}

export function BriefEditor({
  brief,
  postTypes,
  initialSegments,
  initialScreenshotUrls,
  hashtagBank,
  campaignId,
  postNumber,
  weekNumber,
}: {
  brief: BriefWithType;
  postTypes: PostType[];
  initialSegments: BriefSegment[];
  initialScreenshotUrls: Record<string, string>;
  hashtagBank: string[];
  campaignId: string | null;
  postNumber: number | null;
  weekNumber: number | null;
}) {
  const router = useRouter();

  const initialOptions = parseHookOptions(brief.hook_options);
  const initialChosen = brief.hook ? initialOptions.indexOf(brief.hook) : 0;
  const initialPoints = parseTalkingPoints(brief.talking_points);

  const [title, setTitle] = useState(brief.title);
  const [postTypeId, setPostTypeId] = useState<string | null>(brief.post_type_id);
  const [hookOptions, setHookOptions] = useState<string[]>(initialOptions);
  const [chosenHookIndex, setChosenHookIndex] = useState(
    initialChosen >= 0 ? initialChosen : 0,
  );
  const [useCustomHook, setUseCustomHook] = useState(
    Boolean(brief.hook && initialChosen < 0),
  );
  const [customHook, setCustomHook] = useState(
    brief.hook && initialChosen < 0 ? brief.hook : "",
  );
  const [points, setPoints] = useState<TalkingPoint[]>(initialPoints);
  const [cta, setCta] = useState(brief.cta ?? "");
  const [searchPhrase, setSearchPhrase] = useState(brief.search_phrase ?? "");
  const [caption, setCaption] = useState(brief.caption ?? "");
  const [hashtags, setHashtags] = useState<string[]>(brief.hashtags);
  const [whyItWorks, setWhyItWorks] = useState(brief.why_it_works ?? "");
  const [script, setScript] = useState<string | null>(brief.script);
  const [targetWords, setTargetWords] = useState(brief.target_words);
  const [generationId, setGenerationId] = useState<string | null>(
    brief.generation_id,
  );
  const [exampleUrl, setExampleUrl] = useState<string | null>(brief.example_url);
  const [killReason, setKillReason] = useState<string | null>(brief.kill_reason);
  const [textOverlay, setTextOverlay] = useState<TextOverlay>(
    parseTextOverlay(brief.text_overlay),
  );
  const [segments, setSegments] = useState<BriefSegment[]>(initialSegments);
  const [screenshotUrls, setScreenshotUrls] = useState<Record<string, string>>(
    initialScreenshotUrls,
  );
  const [reviewedAt, setReviewedAt] = useState<string | null>(brief.reviewed_at);

  const [pendingOverlayLabels, setPendingOverlayLabels] = useState<
    (string | null)[] | null
  >(null);
  const [hookStale, setHookStale] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [baseline, setBaseline] = useState(() =>
    deriveSnapshot({
      hook: brief.hook,
      points: initialPoints,
      postTypeId: brief.post_type_id,
    }),
  );

  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [filling, setFilling] = useState(false);
  const [fillOpen, setFillOpen] = useState(false);
  const [fillUrl, setFillUrl] = useState("");
  const [fillContext, setFillContext] = useState("");
  const [regenBusy, setRegenBusy] = useState<RegenField | null>(null);
  const [regenPointIndex, setRegenPointIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customTag, setCustomTag] = useState("");
  const [segmentBusyId, setSegmentBusyId] = useState<string | null>(null);
  const uploadForSegment = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRunning, setReviewRunning] = useState(false);
  const [reviewConfirming, setReviewConfirming] = useState(false);
  const [reviewResult, setReviewResult] = useState<BriefReviewResult | null>(null);
  const [appliedIndexes, setAppliedIndexes] = useState<ReadonlySet<number>>(
    new Set(),
  );
  const [appliedPointIds, setAppliedPointIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [reviewSnapshot, setReviewSnapshot] = useState<ReviewSnapshot | null>(
    null,
  );

  const currentType = useMemo(
    () => postTypes.find((t) => t.id === postTypeId) ?? null,
    [postTypes, postTypeId],
  );
  const family: BriefFormat =
    currentType?.family === "photo_carousel" ? "photo_carousel" : "video";

  function resolvedHook(): string | null {
    if (useCustomHook) return customHook.trim() || null;
    return hookOptions[chosenHookIndex]?.trim() || null;
  }

  function mergedCaption(): string {
    const body = caption.replace(/#\w+/g, " ").replace(/\s+/g, " ").trim();
    const tags = hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
    return [body, tags].filter(Boolean).join("\n\n");
  }

  function buildRegenPayload(): RegenDraftPayload {
    return {
      title,
      search_phrase: searchPhrase.trim() || null,
      format: family,
      point_count: points.length,
      target_words: targetWords,
      hook_options: hookOptions,
      talking_points: points,
      cta: cta.trim() || null,
      caption,
      hashtags,
      why_it_works: whyItWorks,
      script,
    };
  }

  // --- Save through the server action, deriving segments when needed. ------

  async function save(): Promise<boolean> {
    setSaving(true);
    setError(null);
    try {
      const chosenHook = resolvedHook();
      const optionsToStore = useCustomHook
        ? [...hookOptions.filter((h) => h.trim()), customHook.trim()].filter(Boolean)
        : hookOptions;
      const snapshot = deriveSnapshot({ hook: chosenHook, points, postTypeId });
      const deriveNeeded =
        postTypeId !== null &&
        (points.length > 0 || chosenHook !== null) &&
        (snapshot !== baseline || segments.length === 0);
      const result = await saveBrief(
        brief.id,
        {
          title: title.trim() || searchPhrase.trim() || "Untitled post",
          format: family,
          hook: chosenHook,
          hook_options: optionsToStore,
          talking_points: points,
          hashtags,
          search_phrase: searchPhrase.trim() || null,
          point_count: points.length,
          target_words: targetWords,
          script,
          caption: mergedCaption() || null,
          why_it_works: whyItWorks || null,
          cta: cta.trim() || null,
          post_type_id: postTypeId,
          kill_reason: killReason,
          generation_id: generationId,
          example_url: exampleUrl,
          text_overlay: textOverlay,
        },
        { deriveSegments: deriveNeeded, overlayLabels: pendingOverlayLabels },
      );
      if (!result.ok) {
        setError(result.error);
        return false;
      }
      if (result.segments !== null) {
        setSegments(result.segments);
        setScreenshotUrls(result.screenshotUrls ?? {});
        setPendingOverlayLabels(null);
      }
      setBaseline(snapshot);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1600);
      return true;
    } finally {
      setSaving(false);
    }
  }

  // --- AI fill through ingest-brief. Kill rather than pad. -----------------

  async function fillFrom(source: { query?: string; url?: string; context?: string }) {
    setFilling(true);
    setError(null);
    const result = await fillBrief({
      briefId: brief.id,
      ...source,
      postTypeKey: currentType?.key,
    });
    setFilling(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.kind === "kill") {
      setKillReason(result.killReason);
      setFillOpen(false);
      return;
    }
    const d = result.draft;
    setTitle(d.title);
    setPoints(d.talking_points);
    setCta(d.cta ?? "");
    setHookOptions(d.hook_options);
    setChosenHookIndex(0);
    setUseCustomHook(false);
    setSearchPhrase(d.search_phrase ?? searchPhrase);
    setCaption(d.caption);
    setHashtags(d.hashtags);
    setWhyItWorks(d.why_it_works);
    setScript(d.script);
    setTargetWords(d.target_words);
    setGenerationId(d.generation_id);
    if (d.example_url) setExampleUrl(d.example_url);
    setPendingOverlayLabels(d.overlay_labels);
    setWarnings(d.warnings);
    setKillReason(null);
    setHookStale(false);
    setFillOpen(false);
  }

  // --- Per-field regeneration through brief-assist. -------------------------

  async function regenerate(field: RegenField, index?: number) {
    setRegenBusy(field);
    if (field === "talking_point") setRegenPointIndex(index ?? null);
    setError(null);
    const response = await regenerateBriefField({
      field,
      draft: buildRegenPayload(),
      postTypeKey: currentType?.key,
      index,
    });
    setRegenBusy(null);
    setRegenPointIndex(null);
    if (!response.ok) {
      setError(response.error);
      return;
    }
    const result = response.result;
    if (result.kind === "kill") {
      setError(`Generation refused: ${result.kill_reason}`);
      return;
    }
    setWarnings(result.warnings);
    switch (result.kind) {
      case "search_phrase":
        if (result.search_phrase) setSearchPhrase(result.search_phrase);
        break;
      case "talking_points":
        setPoints(result.talking_points);
        setCta(result.cta ?? "");
        if (result.script !== null) setScript(result.script);
        if (result.target_words !== null) setTargetWords(result.target_words);
        setPendingOverlayLabels(result.overlay_labels);
        if (result.hook_may_be_stale) setHookStale(true);
        break;
      case "talking_point":
        setPoints((prev) =>
          prev.map((p, i) => (i === result.index ? result.talking_point : p)),
        );
        setPendingOverlayLabels((prev) => {
          const next = prev ? [...prev] : points.map(() => null);
          next[result.index] = result.overlay_label;
          return next;
        });
        if (result.hook_may_be_stale) setHookStale(true);
        break;
      case "hook":
        setHookOptions(result.hook_options);
        setChosenHookIndex(0);
        setUseCustomHook(false);
        setHookStale(false);
        break;
      case "caption":
        setCaption(result.caption);
        setHashtags(result.hashtags);
        break;
    }
  }

  // --- AI review: on demand, never blocks, never edits without Apply. -------

  function takeReviewSnapshot(): ReviewSnapshot {
    return {
      hook: resolvedHook() ?? "",
      cta,
      caption: mergedCaption(),
      searchPhrase,
      points: points.map((p) => ({
        id: p.id,
        text: p.text,
        edited_by_admin: p.edited_by_admin,
      })),
    };
  }

  async function startReview() {
    const saved = await save();
    if (!saved) return;
    setReviewResult(null);
    setAppliedIndexes(new Set());
    setAppliedPointIds(new Set());
    setReviewSnapshot(takeReviewSnapshot());
    setReviewOpen(true);
    setReviewRunning(true);
    const response = await runBriefReview({
      draft: {
        ...buildRegenPayload(),
        caption: mergedCaption(),
        hook_options: useCustomHook
          ? [customHook.trim(), ...hookOptions].filter(Boolean)
          : hookOptions,
      },
      postTypeKey: currentType?.key,
      hookIndex: useCustomHook ? 0 : chosenHookIndex,
    });
    setReviewRunning(false);
    if (!response.ok) {
      setReviewOpen(false);
      setError(response.error);
      return;
    }
    setReviewResult(response.result);
  }

  function applySuggestion(checkIndex: number) {
    const suggestion = reviewResult?.checks[checkIndex]?.suggestion;
    if (!suggestion) return;
    const replacement = suggestion.replacement;
    switch (suggestion.field) {
      case "hook":
        if (useCustomHook) {
          setCustomHook(replacement);
        } else {
          setHookOptions((prev) =>
            prev.map((h, i) => (i === chosenHookIndex ? replacement : h)),
          );
        }
        break;
      case "talking_point": {
        const index = suggestion.index ?? -1;
        const target = points[index];
        if (!target) return;
        setPoints((prev) =>
          prev.map((p, i) => (i === index ? { ...p, text: replacement } : p)),
        );
        /* Applied swaps are the model correcting itself, never a rewrite;
           they never feed banned_phrases. */
        setAppliedPointIds((prev) => new Set([...prev, target.id]));
        break;
      }
      case "cta":
        setCta(replacement);
        break;
      case "caption":
        setCaption(replacement);
        break;
      case "search_phrase":
        setSearchPhrase(replacement);
        break;
    }
    setAppliedIndexes((prev) => new Set([...prev, checkIndex]));
  }

  async function confirmReview() {
    if (!reviewResult || !reviewSnapshot) return;
    setReviewConfirming(true);
    setError(null);
    try {
      const events: ReviewEventInput[] = [];
      const snapshot = reviewSnapshot;
      const hookNow = resolvedHook() ?? "";
      const captionNow = mergedCaption();
      const fieldDiffs: Array<{
        field: string;
        before: string | null;
        after: string | null;
      }> = [];
      if (snapshot.hook !== hookNow) {
        fieldDiffs.push({
          field: "hook",
          before: snapshot.hook || null,
          after: hookNow || null,
        });
      }
      if (snapshot.cta !== cta) {
        fieldDiffs.push({ field: "cta", before: snapshot.cta || null, after: cta || null });
      }
      if (snapshot.caption !== captionNow) {
        fieldDiffs.push({
          field: "caption",
          before: snapshot.caption || null,
          after: captionNow || null,
        });
      }
      if (snapshot.searchPhrase !== searchPhrase) {
        fieldDiffs.push({
          field: "search_phrase",
          before: snapshot.searchPhrase || null,
          after: searchPhrase || null,
        });
      }
      const bannedPhrases: string[] = [];
      for (const before of snapshot.points) {
        const now = points.find((p) => p.id === before.id);
        if (!now || (now.text ?? "") === (before.text ?? "")) continue;
        fieldDiffs.push({
          field: `talking_point:${before.id}`,
          before: before.text,
          after: now.text,
        });
        /* A rewrite of a generated line bans the removed phrase. Lines she
           had already hand edited, and applied suggestions, do not count. */
        if (before.text && !before.edited_by_admin && !appliedPointIds.has(before.id)) {
          bannedPhrases.push(before.text);
        }
      }
      for (const diff of fieldDiffs) {
        events.push({ event: "edit", diff });
      }
      /* Overrides: tier 2 and 3 checks that were not applied. Tier 1 is
         re-checked server side by the review function on the next run. */
      reviewResult.checks.forEach((check, index) => {
        if (check.tier !== 1 && !appliedIndexes.has(index)) {
          events.push({ event: "override", check_id: check.check_id, tier: check.tier });
        }
      });
      events.push({ event: "confirm" });

      const saved = await save();
      if (!saved) return;
      const result = await confirmBriefReview({
        briefId: brief.id,
        result: reviewResult,
        events,
        bannedPhrases,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setReviewedAt(new Date().toISOString());
      setReviewOpen(false);
      router.refresh();
    } finally {
      setReviewConfirming(false);
    }
  }

  // --- Clips: overlay text, show on screen, layout, screenshots. -----------

  async function patchSegment(
    segmentId: string,
    patch: {
      overlay_text?: string | null;
      show_on_screen?: boolean;
      layout?: "standard" | "green_screen";
    },
  ) {
    setSegments((prev) =>
      prev.map((s) => (s.id === segmentId ? { ...s, ...patch } : s)),
    );
    const result = await updateSegment(segmentId, patch);
    if (!result.ok) setError(result.error);
  }

  function pickScreenshot(segmentId: string) {
    uploadForSegment.current = segmentId;
    fileInputRef.current?.click();
  }

  async function onFilePicked(file: File | null) {
    const segmentId = uploadForSegment.current;
    uploadForSegment.current = null;
    if (!file || !segmentId) return;
    setSegmentBusyId(segmentId);
    setError(null);
    const formData = new FormData();
    formData.set("segmentId", segmentId);
    formData.set("file", file);
    const result = await uploadSegmentScreenshot(formData);
    setSegmentBusyId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSegments((prev) =>
      prev.map((s) => (s.id === segmentId ? { ...s, screenshot_url: result.path } : s)),
    );
    setScreenshotUrls((prev) => ({ ...prev, [segmentId]: result.signedUrl }));
  }

  async function removeScreenshot(segmentId: string) {
    setSegmentBusyId(segmentId);
    const result = await removeSegmentScreenshot(segmentId);
    setSegmentBusyId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSegments((prev) =>
      prev.map((s) => (s.id === segmentId ? { ...s, screenshot_url: null } : s)),
    );
  }

  // --- Hashtags. ------------------------------------------------------------

  function toggleHashtag(tag: string) {
    setHashtags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= 5) return prev;
      return [...prev, tag];
    });
  }

  function addCustomTag() {
    const tag = customTag.trim().replace(/^#/, "");
    if (!tag) return;
    setCustomTag("");
    setHashtags((prev) => {
      if (prev.includes(tag) || prev.length >= 5) return prev;
      return [...prev, tag];
    });
  }

  // --- Talking points. -------------------------------------------------------

  function updatePointText(index: number, text: string) {
    setPoints((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, text, edited_by_admin: true } : p,
      ),
    );
  }

  function togglePlug(index: number) {
    setPoints((prev) =>
      prev.map((p, i) => ({ ...p, is_product: i === index ? !p.is_product : false })),
    );
  }

  function addPoint() {
    setPoints((prev) => [
      ...prev,
      {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : String(Date.now()),
        text: "",
        is_product: false,
        edited_by_admin: true,
        claim_id: null,
      },
    ]);
  }

  function removePoint(index: number) {
    setPoints((prev) => prev.filter((_, i) => i !== index));
  }

  // --- Render. ---------------------------------------------------------------

  const state = briefRowState(
    {
      ...brief,
      hook: resolvedHook(),
      reviewed_at: reviewedAt,
      talking_points: points as unknown as Json,
      hashtags,
      caption: mergedCaption() || null,
      cta: cta.trim() || null,
    },
    currentType,
  );
  const stateChip =
    reviewedAt !== null ? (
      <Chip tone="green">Reviewed</Chip>
    ) : state === "filled" ? (
      <Chip tone="amber">Needs review</Chip>
    ) : state === "partial" ? (
      <Chip tone="slate">In progress</Chip>
    ) : (
      <Chip tone="slate">Empty</Chip>
    );
  const typeLabel = currentType?.label ?? "Post";
  const captionBody = caption.replace(/#\w+/g, " ").replace(/\s+/g, " ").trim();
  const bankTags = [...new Set([...hashtagBank, ...hashtags])];
  const pointCountLine =
    currentType === null
      ? "Clip count comes from the type."
      : currentType.clip_structure === "single_clip"
        ? "One clip, derived from the type."
        : currentType.clip_structure === "slide_per_point"
          ? `One slide per point = ${Math.max(points.length, currentType.min_points)} slides. Derived from the type, never entered.`
          : `Hook + ${Math.max(points.length, currentType.min_points)} points + outro = ${Math.max(points.length, currentType.min_points) + 2} clips. Derived from the type, never entered.`;

  return (
    <div>
      <PageHead
        title={
          postNumber !== null
            ? `Post ${String(postNumber).padStart(2, "0")}`
            : brief.title
        }
        sub={weekNumber !== null ? `${typeLabel} · Week ${weekNumber}` : typeLabel}
        onBack={() =>
          router.push(
            campaignId ? `/manager/briefs/week/${campaignId}` : "/manager/briefs",
          )
        }
        right={
          <>
            {stateChip}
            <Pill size="sm" variant="quiet" disabled={saving} onClick={() => void save()}>
              {saving ? "Saving…" : savedFlash ? "Saved" : "Save progress"}
            </Pill>
          </>
        }
      />

      {error ? (
        <p className="mb-3 text-[13px] font-semibold text-danger">{error}</p>
      ) : null}

      {killReason ? (
        <div className="mb-3.5 flex flex-col gap-1 bg-danger-soft p-3.5 rounded-[11px]">
          <span className="text-[13px] font-extrabold text-danger">
            Generation killed this slot
          </span>
          <span className="text-[13px] text-ink">{killReason}</span>
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <div className="mb-3.5 flex flex-col gap-1 border border-amber bg-white p-3 rounded-ops-sm">
          {warnings.map((w) => (
            <span key={w} className="text-[12px] font-semibold text-amber">
              {w}
            </span>
          ))}
        </div>
      ) : null}

      <div className="grid gap-3.5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-3.5">
          <SectionCard
            title="Title"
            intent="Optional. It is how the post reads in the grid, not on the platform."
            action={
              <Pill
                size="sm"
                variant="tint"
                icon={Sparkles}
                disabled={filling}
                onClick={() => setFillOpen(true)}
              >
                {filling ? "Filling…" : "Fill with AI"}
              </Pill>
            }
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled post"
              className={INPUT_CLASS}
            />
            {postTypeId !== null ? (
              <div className="flex flex-wrap gap-1.5">
                {postTypes.map((t) => {
                  const on = t.id === postTypeId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setPostTypeId(t.id)}
                      className={`cursor-pointer whitespace-nowrap border-none px-3 py-[7px] text-[12px] font-bold transition-colors duration-[160ms] ease-om rounded-pill ${
                        on
                          ? "bg-blue-100 text-blue-700"
                          : "bg-fill-quiet text-slate-500"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </SectionCard>

          <SectionCard
            title="Search phrase"
            intent="The TikTok search this post answers. Everything downstream is written against it."
            action={
              <RegenButton
                busy={regenBusy === "search_phrase"}
                onClick={() => void regenerate("search_phrase")}
              />
            }
          >
            <input
              value={searchPhrase}
              onChange={(e) => setSearchPhrase(e.target.value)}
              placeholder="What would someone search?"
              className={INPUT_CLASS}
            />
          </SectionCard>

          <SectionCard
            title="Hook"
            intent="Nine words maximum, written against the finished body. Pick one or write your own."
            action={
              <RegenButton
                busy={regenBusy === "hook"}
                onClick={() => void regenerate("hook")}
              />
            }
          >
            {hookStale ? (
              <p className="m-0 text-[12px] font-semibold text-amber">
                The points changed since these hooks were written. Regenerate to
                refresh them.
              </p>
            ) : null}
            <div className="flex flex-col gap-2">
              {hookOptions.map((option, i) => {
                const on = !useCustomHook && chosenHookIndex === i;
                return (
                  <button
                    key={`${i}-${option}`}
                    type="button"
                    onClick={() => {
                      setUseCustomHook(false);
                      setChosenHookIndex(i);
                    }}
                    className={`flex cursor-pointer items-center gap-2.5 border p-3 text-left text-[13.5px] font-semibold rounded-ops-sm transition-colors duration-[160ms] ease-om ${
                      on
                        ? "border-blue-500 bg-blue-100/40 text-ink"
                        : "border-line bg-white text-slate-500"
                    }`}
                  >
                    <span
                      className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-pill ${
                        on ? "bg-blue-500" : "border border-line bg-white"
                      }`}
                    >
                      {on ? <Check size={11} className="text-white" /> : null}
                    </span>
                    {option || "Empty option"}
                  </button>
                );
              })}
              <div
                className={`flex items-center gap-2.5 border p-3 rounded-ops-sm transition-colors duration-[160ms] ease-om ${
                  useCustomHook ? "border-blue-500 bg-blue-100/40" : "border-line bg-white"
                }`}
              >
                <button
                  type="button"
                  aria-label="Use a custom hook"
                  onClick={() => setUseCustomHook(true)}
                  className={`inline-flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center border-none rounded-pill ${
                    useCustomHook ? "bg-blue-500" : "border border-line bg-white"
                  }`}
                >
                  {useCustomHook ? <Check size={11} className="text-white" /> : null}
                </button>
                <input
                  value={customHook}
                  onChange={(e) => {
                    setUseCustomHook(true);
                    setCustomHook(e.target.value);
                  }}
                  placeholder="Write your own hook"
                  className="w-full border-none bg-transparent text-[13.5px] font-semibold text-ink outline-none"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="CTA"
            intent="One plug sentence. It lands inside one talking point, never its own clip."
          >
            <input
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              placeholder={
                currentType !== null && !currentType.requires_plug
                  ? "Optional for this type"
                  : "The one plug sentence"
              }
              className={INPUT_CLASS}
            />
          </SectionCard>

          <SectionCard
            title="Talking points"
            intent={pointCountLine}
            action={
              <RegenButton
                busy={regenBusy === "talking_points"}
                onClick={() => void regenerate("talking_points")}
                label="Regenerate all"
              />
            }
          >
            <div className="flex flex-col gap-2.5">
              {points.map((p, i) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-2 border border-line bg-white p-3 rounded-ops-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.9px] text-slate-400">
                      Point {i + 1}
                    </span>
                    {p.is_product ? <Chip tone="blue">Plug</Chip> : null}
                    <span className="flex-1" />
                    <button
                      type="button"
                      onClick={() => togglePlug(i)}
                      className="cursor-pointer border-none bg-transparent text-[11.5px] font-bold text-slate-400 hover:text-blue-700"
                    >
                      {p.is_product ? "Unmark plug" : "Mark as plug"}
                    </button>
                    <RegenButton
                      busy={regenBusy === "talking_point" && regenPointIndex === i}
                      onClick={() => void regenerate("talking_point", i)}
                      label="Redo"
                    />
                    <button
                      type="button"
                      aria-label="Remove point"
                      onClick={() => removePoint(i)}
                      className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center border-none bg-fill-quiet rounded-pill"
                    >
                      <Trash2 size={13} className="text-slate-500" />
                    </button>
                  </div>
                  <textarea
                    value={p.text ?? ""}
                    onChange={(e) => updatePointText(i, e.target.value)}
                    className={`${INPUT_CLASS} min-h-[64px] resize-y leading-relaxed`}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addPoint}
                className="cursor-pointer border-[1.5px] border-dashed border-line bg-transparent px-3 py-2.5 text-[12.5px] font-bold text-slate-500 rounded-ops-sm transition-colors duration-[160ms] ease-om hover:border-blue-300"
              >
                Add point
              </button>
              {currentType !== null ? (
                <p className="m-0 text-[11.5px] font-semibold text-slate-400">
                  This type wants {currentType.min_points} to {currentType.max_points}{" "}
                  points.
                </p>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard
            title="Caption and hashtags"
            intent="Caption and 3 to 5 hashtags. Instagram reads tags inside the caption."
            action={
              <RegenButton
                busy={regenBusy === "caption"}
                onClick={() => void regenerate("caption")}
              />
            }
          >
            <textarea
              value={captionBody}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption body, hashtags come after"
              className={TEXTAREA_CLASS}
            />
            <div className="flex flex-wrap gap-1.5">
              {bankTags.map((tag) => {
                const on = hashtags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleHashtag(tag)}
                    className={`cursor-pointer whitespace-nowrap border-none px-3 py-[6px] text-[12px] font-bold transition-colors duration-[160ms] ease-om rounded-pill ${
                      on ? "bg-blue-100 text-blue-700" : "bg-fill-quiet text-slate-500"
                    }`}
                  >
                    #{tag.replace(/^#/, "")}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
                placeholder="Add a hashtag"
                className={INPUT_CLASS}
              />
              <Pill size="sm" variant="quiet" onClick={addCustomTag}>
                Add
              </Pill>
            </div>
            {mergedCaption() ? (
              <div className="bg-fill-quiet p-3 rounded-ops-sm">
                <Label>Preview</Label>
                <p className="mb-0 mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed text-slate-500">
                  {mergedCaption()}
                </p>
              </div>
            ) : null}
          </SectionCard>

          {script !== null && script.trim() !== "" ? (
            <SectionCard
              title="Script"
              intent="Legacy full script. New posts run on talking points instead."
            >
              <textarea
                value={script ?? ""}
                onChange={(e) => setScript(e.target.value)}
                className={`${TEXTAREA_CLASS} min-h-[140px]`}
              />
            </SectionCard>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-3.5">
          <SectionCard title="AI review" intent="Suggestions only. Apply what helps, ignore the rest, confirm when it reads right.">
            {reviewedAt !== null ? (
              <p className="m-0 text-[12.5px] font-semibold text-slate-400">
                Reviewed {new Date(reviewedAt).toLocaleDateString("en-US")}. You
                can still edit and review again.
              </p>
            ) : null}
            <Pill
              icon={Sparkles}
              disabled={saving || reviewRunning}
              onClick={() => void startReview()}
            >
              {reviewRunning ? "Reviewing…" : "Run AI review"}
            </Pill>
          </SectionCard>

          <SectionCard
            title="Text overlay"
            intent="On screen text for the whole post, burned in by the render pass."
          >
            <Toggle
              on={textOverlay.enabled}
              onChange={(next) => setTextOverlay((prev) => ({ ...prev, enabled: next }))}
              label={textOverlay.enabled ? "Overlay on" : "Overlay off"}
            />
            <div className="flex flex-wrap gap-1.5">
              {(["box", "outline", "plain"] as TextOverlayMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTextOverlay((prev) => ({ ...prev, mode }))}
                  className={`cursor-pointer border-none px-3 py-[7px] text-[12px] font-bold capitalize transition-colors duration-[160ms] ease-om rounded-pill ${
                    textOverlay.mode === mode
                      ? "bg-blue-100 text-blue-700"
                      : "bg-fill-quiet text-slate-500"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="color"
                  value={textOverlay.text_color}
                  onChange={(e) =>
                    setTextOverlay((prev) => ({ ...prev, text_color: e.target.value }))
                  }
                  className="h-8 w-10 cursor-pointer border border-line bg-white p-0.5 rounded-ops-sm"
                />
                <span className="text-[12px] font-semibold text-slate-500">Text</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="color"
                  value={textOverlay.accent_color}
                  onChange={(e) =>
                    setTextOverlay((prev) => ({
                      ...prev,
                      accent_color: e.target.value,
                    }))
                  }
                  className="h-8 w-10 cursor-pointer border border-line bg-white p-0.5 rounded-ops-sm"
                />
                <span className="text-[12px] font-semibold text-slate-500">
                  {textOverlay.mode === "outline" ? "Outline" : "Box"}
                </span>
              </label>
            </div>
            <p className="m-0 text-[11.5px] font-semibold text-slate-400">
              Saved with the post when you save progress.
            </p>
          </SectionCard>

          <SectionCard
            title="Clips"
            intent="Derived from the type on save. Overlay text and screenshots are kept when clips change."
          >
            {segments.length === 0 ? (
              <p className="m-0 text-[12.5px] font-semibold text-slate-400">
                Save the post with a hook or points and the clips appear here.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {segments.map((seg) => {
                  const busy = segmentBusyId === seg.id;
                  const shotUrl = seg.screenshot_url ? screenshotUrls[seg.id] : undefined;
                  return (
                    <div
                      key={seg.id}
                      className="flex flex-col gap-2 border border-line bg-white p-3 rounded-ops-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-[0.9px] text-slate-400">
                          {String(seg.slot_index + 1).padStart(2, "0")}
                        </span>
                        <PostTypeChip label={seg.kind} />
                        <span className="flex-1" />
                        <Toggle
                          on={seg.show_on_screen}
                          onChange={(next) =>
                            void patchSegment(seg.id, { show_on_screen: next })
                          }
                          label="On screen"
                        />
                      </div>
                      <input
                        value={seg.overlay_text ?? ""}
                        onChange={(e) =>
                          setSegments((prev) =>
                            prev.map((s) =>
                              s.id === seg.id
                                ? { ...s, overlay_text: e.target.value }
                                : s,
                            ),
                          )
                        }
                        onBlur={(e) =>
                          void patchSegment(seg.id, {
                            overlay_text: e.target.value.trim() || null,
                          })
                        }
                        placeholder="Overlay text"
                        className={INPUT_CLASS}
                      />
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          {(["standard", "green_screen"] as const).map((layout) => {
                            const on = (seg.layout ?? "standard") === layout;
                            return (
                              <button
                                key={layout}
                                type="button"
                                onClick={() => void patchSegment(seg.id, { layout })}
                                className={`cursor-pointer border-none px-2.5 py-[5px] text-[11px] font-bold transition-colors duration-[160ms] ease-om rounded-pill ${
                                  on
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-fill-quiet text-slate-500"
                                }`}
                              >
                                {layout === "standard" ? "Standard" : "Green screen"}
                              </button>
                            );
                          })}
                        </div>
                        <span className="flex-1" />
                        {shotUrl ? (
                          <>
                            {/* Signed thumbnail from the private brief-assets bucket. */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={shotUrl}
                              alt="Clip screenshot"
                              className="h-12 w-9 rounded-[7px] object-cover"
                            />
                            <button
                              type="button"
                              aria-label="Remove screenshot"
                              disabled={busy}
                              onClick={() => void removeScreenshot(seg.id)}
                              className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center border-none bg-fill-quiet rounded-pill disabled:opacity-35"
                            >
                              <X size={13} className="text-slate-500" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => pickScreenshot(seg.id)}
                            className="inline-flex cursor-pointer items-center gap-1.5 border-none bg-fill-quiet px-3 py-1.5 text-[12px] font-bold text-slate-500 rounded-pill disabled:opacity-35"
                          >
                            <ImagePlus size={12} />
                            {busy ? "Uploading…" : "Screenshot"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Details">
            <div className="flex flex-col gap-2 text-[12.5px] font-semibold text-slate-500">
              {exampleUrl ? (
                <span className="truncate">
                  Example:{" "}
                  <a
                    href={exampleUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 underline"
                  >
                    {exampleUrl}
                  </a>
                </span>
              ) : null}
              {whyItWorks ? (
                <span className="leading-relaxed">Why it works: {whyItWorks}</span>
              ) : null}
              <span>Target words: {targetWords}</span>
              {exampleUrl === null && !whyItWorks ? (
                <span className="text-slate-400">
                  Fill with AI to attach an example and the reasoning.
                </span>
              ) : null}
            </div>
          </SectionCard>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          e.target.value = "";
          void onFilePicked(file);
        }}
      />

      {fillOpen ? (
        <Modal title="Fill with AI" onClose={() => setFillOpen(false)}>
          <div className="flex flex-col gap-4">
            <p className="m-0 text-[13px] leading-relaxed text-slate-500">
              Fill this post from the search phrase, or paste a reference link.
              A refusal is a normal outcome: the slot stays empty with the
              reason.
            </p>
            <Pill
              disabled={filling || !searchPhrase.trim()}
              onClick={() => void fillFrom({ query: searchPhrase })}
            >
              {filling
                ? "Filling…"
                : searchPhrase.trim()
                  ? `Fill from "${searchPhrase.trim()}"`
                  : "Add a search phrase first"}
            </Pill>
            <div className="flex flex-col gap-2">
              <Label>Or a reference link</Label>
              <input
                value={fillUrl}
                onChange={(e) => setFillUrl(e.target.value)}
                placeholder="https://"
                className={INPUT_CLASS}
              />
              <textarea
                value={fillContext}
                onChange={(e) => setFillContext(e.target.value)}
                placeholder="Optional context for the writer"
                className={`${INPUT_CLASS} min-h-[64px] resize-y`}
              />
              <Pill
                variant="tint"
                disabled={filling || !fillUrl.trim()}
                onClick={() =>
                  void fillFrom({ url: fillUrl, context: fillContext })
                }
              >
                {filling ? "Filling…" : "Fill from link"}
              </Pill>
            </div>
          </div>
        </Modal>
      ) : null}

      {reviewOpen ? (
        <Modal title="AI review" onClose={() => setReviewOpen(false)} width={560}>
          {reviewRunning ? (
            <p className="m-0 py-6 text-center text-[13.5px] font-semibold text-slate-400">
              Reviewing the post…
            </p>
          ) : reviewResult ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { label: "Overall", value: reviewResult.scores.overall },
                    { label: "Hook", value: reviewResult.scores.hook },
                    { label: "Points", value: reviewResult.scores.talking_points },
                    { label: "CTA", value: reviewResult.scores.cta },
                  ] as const
                ).map((s) => (
                  <div key={s.label} className="bg-fill-quiet p-2.5 text-center rounded-ops-sm">
                    <span className="block text-[17px] font-bold text-ink">
                      {Math.round(s.value)}
                    </span>
                    <span className="block text-[10.5px] font-bold uppercase tracking-[0.3px] text-slate-400">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              {!reviewResult.tier3.spoken ? (
                <div className="flex flex-col gap-1 bg-amber-soft p-3 rounded-ops-sm">
                  <span className="text-[12.5px] font-bold text-amber">
                    Reads written, not spoken
                  </span>
                  {reviewResult.tier3.worst_line ? (
                    <span className="text-[12.5px] text-ink">
                      Worst line: {reviewResult.tier3.worst_line}
                    </span>
                  ) : null}
                </div>
              ) : null}

              {reviewResult.checks.length === 0 ? (
                <p className="m-0 text-[13px] font-semibold text-slate-400">
                  No issues fired. Confirm to mark the post reviewed.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {reviewResult.checks.map((check, i) => {
                    const applied = appliedIndexes.has(i);
                    return (
                      <div
                        key={`${check.check_id}-${i}`}
                        className="flex flex-col gap-1.5 border border-line bg-white p-3 rounded-ops-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Chip tone={check.severity === "fail" ? "amber" : "slate"}>
                            {check.section}
                          </Chip>
                          <span className="text-[10.5px] font-bold uppercase tracking-[0.3px] text-slate-400">
                            Tier {check.tier}
                          </span>
                          <span className="flex-1" />
                          {check.suggestion ? (
                            applied ? (
                              <span className="inline-flex items-center gap-1 text-[12px] font-bold text-green">
                                <Check size={12} /> Applied
                              </span>
                            ) : (
                              <Pill size="sm" variant="tint" onClick={() => applySuggestion(i)}>
                                Apply
                              </Pill>
                            )
                          ) : null}
                        </div>
                        <span className="text-[12.5px] leading-relaxed text-slate-500">
                          {check.message}
                        </span>
                        {check.suggestion ? (
                          <span className="text-[12.5px] leading-relaxed text-ink">
                            {check.suggestion.replacement}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end gap-2.5">
                <Pill variant="quiet" onClick={() => setReviewOpen(false)}>
                  Keep editing
                </Pill>
                <Pill
                  disabled={reviewConfirming}
                  onClick={() => void confirmReview()}
                >
                  {reviewConfirming ? "Saving…" : "Save post"}
                </Pill>
              </div>
            </div>
          ) : null}
        </Modal>
      ) : null}
    </div>
  );
}

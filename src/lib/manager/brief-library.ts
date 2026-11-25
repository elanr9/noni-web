/* The Briefs library on the website, the same model as the app
   (lib/brief-library.ts, table library_briefs, migration 121). A brief is
   what the campaign manager saves for creators: a Guided template (clips,
   caption) or an Outline (title and notes). Saving a Guided brief also
   saves its Outline twin `<id>-o`, like the app. Creators see both in their
   Briefs; posts point back with assignments.library_brief_id. */

export type BriefKind = "Guided" | "Outline";
export type BriefType = "Talking Head" | "Long Text" | "Slideshow" | "Greenscreen";
export const BRIEF_TYPES: readonly BriefType[] = ["Talking Head", "Long Text", "Slideshow", "Greenscreen"];

export const TYPE_INFO: Record<BriefType, { sub: string; tone: string; text: string }> = {
  "Talking Head": { sub: "Creator to camera", tone: "bg-blue-100", text: "text-blue-700" },
  "Long Text": { sub: "Text on screen, voiceover under it", tone: "bg-[#EFE9FF]", text: "text-[#6D4AE0]" },
  Slideshow: { sub: "Images with text, swiped through", tone: "bg-[#FDE8F1]", text: "text-[#D0397A]" },
  Greenscreen: { sub: "Creator over a screenshot or clip", tone: "bg-green-soft", text: "text-green" },
};

export type BriefAudio = { mode: "none" | "pick" | "creator" | null; track: unknown | null };

/** A clip as the app stores it. The web edits text fields and keeps the rest. */
export type BriefClip = {
  id: string;
  text: string;
  onScreen: string;
  cta: boolean;
  green: boolean;
  gs: unknown | null;
  doc: unknown | null;
  shot?: string;
};

export type BriefAi = {
  hooks: { say: string; onScreen: string; visual: string; archetype: string }[];
  warnings: string[];
  referenceNote: string | null;
  questions: string[];
  draft: unknown | null;
};

export type GuidedState = {
  title: string;
  link: string;
  linkNotes: string;
  phrase: string;
  notes: string;
  fullGreen: boolean;
  gs: unknown | null;
  caption: string;
  tags: string[];
  clips: BriefClip[];
  audio: BriefAudio;
  filled?: boolean;
  angle?: string;
  ai?: BriefAi | null;
};

export type LongTextState = { title: string; onScreen: string; notes: string; doc: unknown | null; ai?: BriefAi | null };

export type Brief = {
  id: string;
  type: BriefType;
  kind: BriefKind;
  title: string;
  notes: string;
  link: string;
  ts: number;
  audio: BriefAudio | null;
  clips: BriefClip[] | null;
  g: GuidedState | null;
  lt: LongTextState | null;
  from: string | null;
  caption: string;
  tags: string[];
  /** Posts made from it (submitted, approved or posted). */
  uses: number;
};

export const LONG_TEXT_NOTES = "One take, eyes on the lens, natural light. Hold the frame for the full 7 seconds.";

export function uid(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function newClip(text = "", o: Partial<BriefClip> = {}): BriefClip {
  return { id: uid(), text, cta: false, green: true, gs: null, onScreen: "", doc: null, ...o };
}

export function emptyGuided(): GuidedState {
  return {
    title: "",
    link: "",
    linkNotes: "",
    phrase: "",
    notes: "",
    fullGreen: true,
    gs: null,
    caption: "",
    tags: [],
    clips: [newClip("")],
    audio: { mode: null, track: null },
  };
}

export const outlineTwinId = (id: string) => `${id}-o`;

/** "Hook", "Clip 1", "Slide 2", "The clip". */
export function clipLabel(i: number, type: BriefType): string {
  if (type === "Long Text") return "The clip";
  if (type === "Slideshow") return `Slide ${i + 1}`;
  return i === 0 ? "Hook" : `Clip ${i}`;
}

/** The guided state a saved brief reopens as, like the app's fromBrief. */
export function guidedOf(b: Brief): GuidedState {
  return (
    b.g ?? {
      ...emptyGuided(),
      title: b.title,
      notes: b.notes,
      link: b.link,
      audio: b.audio ?? { mode: "creator", track: null },
      caption: b.caption,
      tags: b.tags,
      clips: (b.clips ?? []).length ? (b.clips as BriefClip[]) : [newClip("")],
    }
  );
}

export function longTextOf(b: Brief): LongTextState {
  return b.lt ?? { title: b.title, notes: b.notes || LONG_TEXT_NOTES, onScreen: b.clips?.[0]?.onScreen || "", doc: b.clips?.[0]?.doc ?? null };
}

/** The notes line the app writes for a guided brief: the search phrase, then each clip. */
export function guidedNotes(g: GuidedState, type: BriefType): string {
  const phrase = (g.phrase || g.title).trim();
  return [`Search: ${phrase}`].concat(g.clips.map((c, i) => `${clipLabel(i, type)}: ${c.text || c.onScreen}`)).join("\n");
}

export type SaveBriefInput = {
  id: string;
  type: BriefType;
  kind: BriefKind;
  title: string;
  notes: string;
  link: string;
  g: GuidedState | null;
  lt: LongTextState | null;
  clips: BriefClip[] | null;
  audio: BriefAudio | null;
  caption: string;
  tags: string[];
  /** Long Text and imported posts save without an Outline twin, like the app. */
  noTwin?: boolean;
};

/** One post the Upload brief reader listed. */
export type PlannedPost = { index: number; title: string; type: BriefType; origin: "document" | "new"; angle: string; hook: string };

/** What brief-fill and brief-import answer for a guided post. */
export type FillResponse = {
  title?: string;
  phrase?: string;
  angle?: string;
  caption?: string;
  tags?: string[];
  notes?: string;
  clips?: { say?: string; onScreen?: string; cta?: boolean; shot?: string }[];
  hooks?: BriefAi["hooks"];
  warnings?: string[];
  questions?: string[];
  reference_note?: string;
  kill_reason?: string;
  error?: string;
};

/** A guided state from a brief-fill or brief-import answer (the app's guidedPlanOf). */
export function guidedFromFill(res: FillResponse, base: GuidedState, type: BriefType): GuidedState {
  const clips = (res.clips ?? []).map((c) => {
    const extra = c.shot?.trim() ? { shot: c.shot.trim() } : {};
    const say = type === "Slideshow" || type === "Long Text" ? "" : (c.say ?? "");
    return newClip(say, { onScreen: c.onScreen ?? "", cta: !!c.cta, ...extra });
  });
  const green = type === "Greenscreen" && !base.fullGreen ? clips.map((c, i) => ({ ...c, green: i > 0 && !c.cta })) : clips;
  return {
    ...base,
    title: (res.title || base.title).trim(),
    phrase: (res.phrase || "").trim(),
    clips: green.length ? green : base.clips,
    caption: (res.caption || base.caption).trim(),
    tags: res.tags?.length ? res.tags : base.tags,
    angle: (res.angle || "").trim(),
    filled: true,
    ai: {
      hooks: res.hooks ?? [],
      warnings: res.warnings ?? [],
      referenceNote: res.reference_note?.trim() || null,
      questions: res.questions ?? [],
      draft: null,
    },
  };
}

/** What a guided state saves as. */
export function guidedSaveInput(id: string, type: BriefType, g: GuidedState): SaveBriefInput {
  return {
    id,
    type,
    kind: "Guided",
    title: g.title.trim(),
    notes: g.notes.trim() || guidedNotes(g, type),
    link: g.link.trim(),
    g,
    lt: null,
    audio: g.audio,
    caption: g.caption,
    tags: g.tags,
    clips: g.clips.map((c) => ({ ...c, green: type === "Greenscreen" && (g.fullGreen || c.green) })),
  };
}

export function longTextSaveInput(id: string, lt: LongTextState): SaveBriefInput {
  return {
    id,
    type: "Long Text",
    kind: "Guided",
    noTwin: true,
    title: lt.title.trim(),
    notes: lt.notes,
    link: "",
    g: null,
    lt,
    audio: null,
    caption: "",
    tags: [],
    clips: [newClip(lt.notes, { onScreen: lt.onScreen })],
  };
}

export function outlineSaveInput(id: string, type: BriefType, o: { title: string; notes: string; link: string }): SaveBriefInput {
  return { id, type, kind: "Outline", title: o.title.trim(), notes: o.notes.trim(), link: o.link.trim(), g: null, lt: null, audio: null, clips: null, caption: "", tags: [] };
}

export function timeAgo(ts: number): string {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

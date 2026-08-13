/* Rank Company Brain features for UGC virality and stamp CM-ready
   weekly briefs: one example to copy, one sentence, one action. */

import type { PostFormat } from "./types";

export interface FeatureDraft {
  id: string;
  sentence: string;
  imageBase64: string;
  mime: string;
}

export interface RankedFeature {
  id: string;
  name: string;
  score: number;
  reason: string;
  format: PostFormat;
  typeLabel: string;
  title: string;
  example: string;
  description: string;
  action: string;
  phrase: string;
}

const MODELS = ["gpt-5.4-mini", "gpt-4o"] as const;

const SYSTEM = `You rank a company's product features for UGC virality on TikTok and Instagram Reels. Noni then stamps the week's campaign-manager briefs from your ranking.

Campaign managers do not write hooks, scripts, or captions. Each brief they fill is extremely easy: one example to copy, one sentence of description, one action. Noni writes the rest later.

Score harshly.
- High: a phone can demo it in one take, a stranger sees the payoff in 2 seconds, it is specific, it is visually obvious from the screenshot.
- Low: admin panels, settings, internal tools, vague platform claims, anything a creator cannot show.

Never invent capabilities that are not in the screenshot or the sentence. Never use an em dash or en dash.

Return JSON only:
{"features":[{"id":"","name":"","score":0,"reason":"","format":"Video","typeLabel":"","title":"","example":"","description":"","action":"","phrase":""}]}

Rules for each feature:
- name: 2 to 5 words.
- score: integer 1 to 100.
- reason: one sentence on why it will or will not travel.
- format: Video or Carousel.
- typeLabel: one of Numbered list, Talking head, Explainer, Contrast, Replay bait, Numbered tips, How to, Getting started.
- title: a post title the manager can keep.
- example: the concrete visual to film or screenshot, one or two sentences.
- description: one sentence the manager pastes as the brief body.
- action: the single thing the creator does on camera.
- phrase: a search phrase that pre-stamps the empty week row.`;

interface ChatResponse {
  error?: { message?: string };
  choices?: { message?: { content?: string | null } }[];
}

function weekStartDate(d = new Date()): Date {
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

export function currentWeekStart(): string {
  return weekStartDate().toISOString().slice(0, 10);
}

function parseJsonObject(text: string): { features?: unknown } {
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(trimmed) as { features?: unknown };
}

function asFormat(value: unknown): PostFormat {
  return value === "Carousel" ? "Carousel" : "Video";
}

function asRanked(raw: unknown, allowed: Set<string>): RankedFeature[] {
  if (!Array.isArray(raw)) return [];
  const out: RankedFeature[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const id = typeof r.id === "string" ? r.id : "";
    if (!allowed.has(id)) continue;
    const scoreRaw = typeof r.score === "number" ? r.score : Number(r.score);
    const score = Number.isFinite(scoreRaw)
      ? Math.max(1, Math.min(100, Math.round(scoreRaw)))
      : 1;
    out.push({
      id,
      name: typeof r.name === "string" ? r.name.trim() : "",
      score,
      reason: typeof r.reason === "string" ? r.reason.trim() : "",
      format: asFormat(r.format),
      typeLabel: typeof r.typeLabel === "string" ? r.typeLabel.trim() : "Explainer",
      title: typeof r.title === "string" ? r.title.trim() : "",
      example: typeof r.example === "string" ? r.example.trim() : "",
      description: typeof r.description === "string" ? r.description.trim() : "",
      action: typeof r.action === "string" ? r.action.trim() : "",
      phrase: typeof r.phrase === "string" ? r.phrase.trim() : "",
    });
  }
  return out.sort((a, b) => b.score - a.score);
}

export async function rankProductFeatures(
  product: string,
  audience: string,
  drafts: FeatureDraft[],
  inspiration = "",
): Promise<{ ok: true; ranked: RankedFeature[] } | { ok: false; error: string }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      error: "Clean up with AI is not configured. Add OPENAI_API_KEY on the server.",
    };
  }
  if (drafts.length === 0) return { ok: true, ranked: [] };

  const content: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  > = [
    {
      type: "text",
      text: `Product document:\n${product.trim() || "(empty)"}\n\nAudience document:\n${audience.trim() || "(empty)"}${
        inspiration.trim()
          ? `\n\nWhat already works in this niche (top inspiration posts). Copy these mechanics, not the claims:\n${inspiration.trim()}`
          : ""
      }\n\nRank these features. Each id is followed by the founder's one sentence, then its screenshot.`,
    },
  ];
  for (const draft of drafts.slice(0, 12)) {
    content.push({
      type: "text",
      text: `id: ${draft.id}\nsentence: ${draft.sentence}`,
    });
    content.push({
      type: "image_url",
      image_url: { url: `data:${draft.mime};base64,${draft.imageBase64}` },
    });
  }

  let lastError = "OpenAI is unavailable.";
  for (const model of MODELS) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content },
        ],
        max_completion_tokens: 2500,
        response_format: { type: "json_object" },
      }),
    });
    const json = (await res.json()) as ChatResponse;
    if (!res.ok) {
      lastError = json.error?.message ?? `OpenAI ${res.status}`;
      const retryable = res.status === 404 || res.status === 400;
      if (!retryable) return { ok: false, error: lastError };
      continue;
    }
    const text = json.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) {
      lastError = "OpenAI returned an empty ranking.";
      continue;
    }
    try {
      const parsed = parseJsonObject(text);
      const ranked = asRanked(
        parsed.features,
        new Set(drafts.map((d) => d.id)),
      );
      if (ranked.length === 0) {
        lastError = "OpenAI returned no ranked features.";
        continue;
      }
      return { ok: true, ranked };
    } catch {
      lastError = "OpenAI returned a ranking we could not read.";
    }
  }
  return { ok: false, error: lastError };
}

export function pickWeekTemplates(ranked: RankedFeature[]): RankedFeature[] {
  const strong = ranked.filter((f) => f.score >= 60);
  if (strong.length > 0) return strong;
  return ranked.slice(0, 3);
}

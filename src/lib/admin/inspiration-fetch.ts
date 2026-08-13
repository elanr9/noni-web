/* Pull the best public posts from an inspiration account and write a
   short hook / why so brief generation can copy what already works. */

import type { Platform, PostFormat } from "./types";

export interface FetchedPost {
  externalId: string;
  url: string;
  caption: string;
  thumbnailUrl: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  score: number;
  format: PostFormat;
  hook: string;
  why: string;
}

const TOP_N = 5;
const SAMPLE = 30;

function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function virality(views: number, likes: number, shares: number, comments: number): number {
  const reach = views > 0 ? views : likes * 20;
  return reach + likes * 8 + shares * 20 + comments * 12;
}

function pickTop(posts: FetchedPost[]): FetchedPost[] {
  return [...posts].sort((a, b) => b.score - a.score).slice(0, TOP_N);
}

async function getJson(url: string, headers: Record<string, string> = {}): Promise<unknown> {
  const res = await fetch(url, {
    headers: { Accept: "application/json", ...headers },
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Fetch ${res.status}`);
  return res.json();
}

function fromTikwm(raw: unknown, handle: string): FetchedPost[] {
  const root = raw as {
    code?: number;
    data?: { videos?: unknown[]; aweme_list?: unknown[] };
  };
  if (root.code !== 0 && root.code !== undefined) return [];
  const list = root.data?.videos ?? root.data?.aweme_list ?? [];
  const posts: FetchedPost[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const id = str(row.video_id || row.aweme_id || row.id);
    if (!id) continue;
    const views = num(row.play_count ?? row.playCount);
    const likes = num(row.digg_count ?? row.diggCount);
    const shares = num(row.share_count ?? row.shareCount);
    const comments = num(row.comment_count ?? row.commentCount);
    posts.push({
      externalId: id,
      url: str(row.play) || `https://www.tiktok.com/@${handle}/video/${id}`,
      caption: str(row.title || row.desc),
      thumbnailUrl: str(row.cover || row.origin_cover),
      views,
      likes,
      shares,
      comments,
      score: virality(views, likes, shares, comments),
      format: "Video",
      hook: "",
      why: "",
    });
  }
  return posts;
}

async function fetchTikTok(handle: string): Promise<FetchedPost[]> {
  const raw = await getJson(
    `https://www.tikwm.com/api/user/posts?unique_id=${encodeURIComponent(handle)}&count=${SAMPLE}`,
  );
  return fromTikwm(raw, handle);
}

function fromInstagramProfile(raw: unknown, handle: string): FetchedPost[] {
  const user = (raw as { data?: { user?: Record<string, unknown> } }).data?.user;
  if (!user) return [];
  const edges =
    (user.edge_owner_to_timeline_media as { edges?: unknown[] } | undefined)?.edges ?? [];
  const posts: FetchedPost[] = [];
  for (const edge of edges) {
    const node = (edge as { node?: Record<string, unknown> })?.node;
    if (!node) continue;
    const id = str(node.id || node.shortcode);
    if (!id) continue;
    const shortcode = str(node.shortcode) || id;
    const caption =
      (
        node.edge_media_to_caption as
          | { edges?: { node?: { text?: string } }[] }
          | undefined
      )?.edges?.[0]?.node?.text ?? "";
    const likes = num(
      (node.edge_liked_by as { count?: unknown } | undefined)?.count ?? node.like_count,
    );
    const comments = num(
      (node.edge_media_to_comment as { count?: unknown } | undefined)?.count ??
        node.comment_count,
    );
    const views = num(node.video_view_count ?? node.video_play_count);
    const typename = str(node.__typename);
    const format: PostFormat = typename === "GraphSidecar" ? "Carousel" : "Video";
    posts.push({
      externalId: id,
      url: `https://www.instagram.com/p/${shortcode}/`,
      caption,
      thumbnailUrl: str(node.thumbnail_src || node.display_url),
      views,
      likes,
      shares: 0,
      comments,
      score: virality(views, likes, 0, comments),
      format,
      hook: "",
      why: "",
    });
  }
  return posts;
}

async function fetchInstagram(handle: string): Promise<FetchedPost[]> {
  const raw = await getJson(
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(handle)}`,
    {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "X-IG-App-ID": "936619743392459",
    },
  );
  return fromInstagramProfile(raw, handle);
}

export async function fetchTopInspirationPosts(
  platform: Platform,
  handle: string,
): Promise<{ ok: true; posts: FetchedPost[] } | { ok: false; error: string }> {
  const bare = handle.replace(/^@+/, "");
  try {
    const all = platform === "instagram" ? await fetchInstagram(bare) : await fetchTikTok(bare);
    if (all.length === 0) {
      return {
        ok: false,
        error: `Couldn't find public posts for @${bare} on ${platform === "instagram" ? "Instagram" : "TikTok"}.`,
      };
    }
    return { ok: true, posts: pickTop(all) };
  } catch {
    return {
      ok: false,
      error: `Couldn't load posts for @${bare}. Check the handle and try again.`,
    };
  }
}

interface ChatResponse {
  error?: { message?: string };
  choices?: { message?: { content?: string | null } }[];
}

const ANALYZE_MODELS = ["gpt-5.4-mini", "gpt-4o"] as const;

const ANALYZE = `You study winning TikTok and Instagram posts so Noni can write better UGC briefs.

For each post, name the opening hook and why it traveled. Be concrete. Never invent stats. Never use an em dash or en dash.

Return JSON only:
{"posts":[{"id":"","hook":"","why":"","format":"Video"}]}

hook: the first-line idea a creator could copy, one sentence.
why: one sentence on the mechanic (open mid-action, price in 2 seconds, contrast, list, etc.).
format: Video or Carousel.`;

export async function analyzeInspirationPosts(
  product: string,
  audience: string,
  posts: FetchedPost[],
): Promise<FetchedPost[]> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || posts.length === 0) return posts;

  const listing = posts
    .map(
      (p, i) =>
        `${i + 1}. id=${p.externalId} format=${p.format} views=${p.views} likes=${p.likes} shares=${p.shares} comments=${p.comments}\n${p.caption || "(no caption)"}`,
    )
    .join("\n\n");

  const user = `Product:\n${product.trim() || "(empty)"}\n\nAudience:\n${audience.trim() || "(empty)"}\n\nPosts:\n${listing}`;

  for (const model of ANALYZE_MODELS) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: ANALYZE },
          { role: "user", content: user },
        ],
        max_completion_tokens: 1200,
        response_format: { type: "json_object" },
      }),
    });
    const json = (await res.json()) as ChatResponse;
    if (!res.ok) continue;
    const text = json.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) continue;
    try {
      const parsed = JSON.parse(
        text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""),
      ) as { posts?: unknown };
      if (!Array.isArray(parsed.posts)) continue;
      const byId = new Map<string, { hook: string; why: string; format: PostFormat }>();
      for (const row of parsed.posts) {
        if (!row || typeof row !== "object") continue;
        const r = row as Record<string, unknown>;
        const id = typeof r.id === "string" ? r.id : "";
        if (!id) continue;
        byId.set(id, {
          hook: typeof r.hook === "string" ? r.hook.trim() : "",
          why: typeof r.why === "string" ? r.why.trim() : "",
          format: r.format === "Carousel" ? "Carousel" : "Video",
        });
      }
      return posts.map((p) => {
        const extra = byId.get(p.externalId);
        if (!extra) return p;
        return { ...p, hook: extra.hook, why: extra.why, format: extra.format };
      });
    } catch {
      continue;
    }
  }
  return posts;
}

export function inspirationDigest(
  posts: Array<{ handle: string; views: number; hook: string; why: string; caption: string }>,
): string {
  if (posts.length === 0) return "";
  return posts
    .slice(0, 20)
    .map((p) => {
      const hook = p.hook || p.caption.slice(0, 120);
      const why = p.why ? ` Why: ${p.why}` : "";
      return `@${p.handle.replace(/^@+/, "")} · ${p.views.toLocaleString("en-US")} views · ${hook}${why}`;
    })
    .join("\n");
}

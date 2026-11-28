"use client";

import { BriefsLibraryView } from "@/components/manager/briefs/library/BriefsLibraryView";
import type { UploadApi } from "@/lib/manager/brief-import-client";
import type { Brief, BriefType, FillResponse, PlannedPost } from "@/lib/manager/brief-library";

/* Dev preview: the Briefs library with Upload brief answered from canned
   posts, so the whole flow runs with no session and no model. A recorded run
   can be replayed by setting window.__briefImportReplay = { posts, written }. */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const SAMPLE: [string, BriefType][] = [
  ["I wrote my whole essay in 10 minutes", "Talking Head"],
  ["Reacting to my professor's feedback", "Greenscreen"],
  ["5 study apps I cannot live without", "Slideshow"],
  ["Things that just make sense in college", "Long Text"],
  ["Why I stopped pulling all nighters", "Talking Head"],
  ["The essay hack nobody tells freshmen", "Talking Head"],
  ["My GPA before and after", "Slideshow"],
  ["What I do the night before a deadline", "Talking Head"],
];

type Replay = { posts: PlannedPost[]; written: (FillResponse & { index: number })[] };

function canned(post: PlannedPost): FillResponse {
  const spoken = post.type === "Talking Head" || post.type === "Greenscreen";
  if (post.type === "Long Text") return { title: post.title, clips: [{ onScreen: "when you finish the essay at 9pm instead of 4am" }] };
  return {
    title: post.title,
    phrase: "how to write essays faster",
    caption: "How to write essays faster when finals are close.",
    tags: ["#studytok", "#college"],
    outline_note: "Video on how you write essays faster",
    clips: [
      { say: spoken ? `${post.title}.` : "", onScreen: post.title },
      { say: spoken ? "I used to spend six hours on one essay." : "", onScreen: "6 hours per essay", shot: "At your desk, laptop open." },
      { say: spoken ? "Now it outlines and drafts in my own voice." : "", onScreen: "Drafts in your voice", shot: "Screen recording of a draft." },
      { say: spoken ? "Search Inkbound if finals are coming up." : "", onScreen: "Search Inkbound", cta: true },
    ],
  };
}

let failedOnce = false;

const api: UploadApi = {
  plan: async (_company, _files, _link, handlers) => {
    const replay = (window as unknown as { __briefImportReplay?: Replay }).__briefImportReplay;
    const posts: PlannedPost[] = replay?.posts ?? SAMPLE.map(([title, type], index) => ({ index, title, type, origin: "document", angle: "", hook: title }));
    await wait(900);
    handlers.onSkipped?.([]);
    for (const post of posts) {
      handlers.onPost?.(post);
      if (post.index === 1 || posts.length === 1) handlers.onReady?.("preview");
      await wait(350);
    }
    return { importId: "preview", count: posts.length };
  },
  write: async (_id, post) => {
    await wait(1200 + Math.random() * 2600);
    const replay = (window as unknown as { __briefImportReplay?: Replay }).__briefImportReplay;
    if (replay) return replay.written.find((w) => w.index === post.index) ?? canned(post);
    if (post.index === 4 && !failedOnce) {
      failedOnce = true;
      throw new Error("preview failure");
    }
    return canned(post);
  },
  finish: () => undefined,
};

export function BriefsPreviewClient({ initial, initialOpen }: { initial: Brief[]; initialOpen: string | null }) {
  return <BriefsLibraryView initial={initial} companyId="preview" initialOpen={initialOpen} uploadApi={api} />;
}

/* Dev only (ADMIN_QA_MOCK=1): a scripted stand-in for the onboarding-chat
   edge function, streaming word by word, so the chat can be previewed with
   no model and no session. Same wire format as the real function. */

import type { ChatMessage, SlotSpec } from "@/lib/onboarding-chat";

const SCRIPT: Array<{ spec: SlotSpec; say: string }> = [
  {
    spec: { key: "website", kind: "text", draft: "fieldvision.ai", placeholder: "yourcompany.com" },
    say: "Hi Riley, I'm Noni. A few quick questions and your first videos are moving. Is fieldvision.ai your site?",
  },
  {
    spec: {
      key: "goal",
      kind: "choice",
      options: [
        { value: "signups", label: "Downloads and sign ups" },
        { value: "audience", label: "A bigger audience" },
        { value: "trust", label: "Trust in the brand" },
      ],
    },
    say: "Reading it now. What should the videos do for FieldVision first?",
  },
  {
    spec: {
      key: "platforms",
      kind: "multi",
      options: [
        { value: "tiktok", label: "TikTok" },
        { value: "instagram", label: "Instagram Reels" },
        { value: "youtube", label: "YouTube Shorts" },
      ],
    },
    say: "Downloads it is, so every script ends on one clear step. Where should the videos go?",
  },
  {
    spec: {
      key: "sells",
      kind: "choice",
      options: [
        "Turns a full game into a highlight video in minutes",
        "Cuts every tagged play into clips coaches can share",
        "Video analysis for youth and high school teams",
      ].map((l) => ({ value: l, label: l })),
    },
    say: "I've read www.fieldvision.ai. Which line says best what FieldVision does?",
  },
  {
    spec: {
      key: "never_say",
      kind: "multi",
      options: [
        { value: "Guarantee a scholarship", label: "Guarantee a scholarship" },
        { value: "Show a real player's private data", label: "Show a real player's private data" },
        { value: "Name a competitor", label: "Name a competitor" },
        { value: "none", label: "Nothing specific" },
      ],
    },
    say: "Last one. Anything creators must never say or show?",
  },
  { spec: { key: "summary", kind: "summary" }, say: "That's everything I need. Here's what I understood about FieldVision. Confirm it or fix anything." },
  { spec: { key: "done", kind: "done" }, say: "You're all set. I'm writing your first briefs from this now, so take a look around." },
];

let at = 0;
const messages: ChatMessage[] = [];

function sse(obj: unknown): string {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

export function mockChatResponse(raw: string): Response {
  const body = JSON.parse(raw || "{}") as { action?: string; answer?: { slot: string; text: string; value: string | string[] } };
  if (body.action === "state") {
    return Response.json({
      messages,
      pending: messages.length && at < SCRIPT.length ? SCRIPT[at].spec : null,
      first_name: "Riley",
      company_name: "FieldVision",
      progress: { at: Math.max(0, at - 1), total: SCRIPT.length - 1 },
    });
  }
  if (body.answer) {
    const v = body.answer.value;
    messages.push({ role: "user", text: body.answer.text || (Array.isArray(v) ? v.join(", ") : v), slot: body.answer.slot });
  }
  const step = SCRIPT[Math.min(at, SCRIPT.length - 1)];
  at = Math.min(at + 1, SCRIPT.length);
  const words = step.say.split(/(?<= )/);
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      await new Promise((r) => setTimeout(r, 450));
      for (const w of words) {
        controller.enqueue(enc.encode(sse({ type: "delta", text: w })));
        await new Promise((r) => setTimeout(r, 28));
      }
      messages.push({ role: "assistant", text: step.say, slot: step.spec.key });
      controller.enqueue(enc.encode(sse({ type: "done", pending: step.spec, progress: { at: at - 1, total: SCRIPT.length - 1 } })));
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
}

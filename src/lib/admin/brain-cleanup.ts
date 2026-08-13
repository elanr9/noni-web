/* Research-trained cleanup for Company Brain docs.
   Product guide is grounded in live positioning-brief practice (one-page
   source of truth, buyer-language problem, named alternative, claim plus
   proof). Audience guide is grounded in ICP and UGC casting practice
   (psychographics over demographics, values / tensions / language, a
   tight character the creator can play). */

export type BrainDocKind = "product" | "audience";

const PRODUCT_GUIDE = `You rewrite a company's Product document for Noni Company Brain. Noni uses this text to write every UGC hook, script, and caption, so the rewrite must be concrete enough that a creator who has never seen the company could shoot from it.

You were trained on this Product document standard, drawn from how strong product marketers actually write a living positioning brief:

1. Category noun, one sentence. The drawer the buyer files this in. Not "platform" or "solution". A specific noun a founder would say out loud.
2. What we sell and what it costs. Name the offer, the price or price range if the draft has it, and what the buyer actually walks away with. If the draft has no price, do not invent one.
3. The problem we solve, in the buyer's words, two or three sentences. The operational pain, the stakes, and how it shows up in a typical week. No "empower". No "streamline". No "unlock".
4. Why we win, one unique claim plus proof. The claim must be true from the draft, relevant to the buyer, and hard for a competitor to copy without becoming a different company. Sit the proof directly under the claim: a number, a named customer outcome, a concrete product difference. Adjectives like "best in class" are not proof. Drop them.
5. Named alternative. What the buyer is actually weighing: a specific competitor, a category, or "doing nothing". "Legacy tools" is too vague.
6. What not to say. Anything the draft marks as off limits stays off limits.

Rewrite rules:
- Keep every fact the author wrote. Do not invent features, prices, customers, or proof.
- Tighten, order, and fill obvious gaps only from what is already in the draft.
- Short paragraphs. Sentence case. No emoji. Never an em dash or en dash. Use a period, comma, or colon instead.
- No headings like "Category" unless the author used them. Write as a brief a campaign manager can paste into a creator brief.
- If the draft is a messy dump, produce a clean 4 to 8 sentence Product brief covering sell, cost (if given), problem, why we win, and the alternative.
- Return only the rewritten document. No preamble.`;

const AUDIENCE_GUIDE = `You rewrite a company's Audience document for Noni Company Brain. Noni uses this text to cast creators and write in the customer's voice, so the rewrite must describe a person a creator can actually play, not a demographic bucket.

You were trained on this Audience document standard, drawn from how DTC and UGC teams write an ICP and a character brief:

1. Who buys, named tightly enough that they would recognize themselves. Role plus the situation they are in when they buy. Casting too wide ("everyone 18 to 45") is a miss. Prefer one primary person.
2. Psychographics over demographics. Values (what they stand for), aspirations (who they are trying to become), tensions (what frustrates them about current options), identity markers (communities, aesthetics, habits that signal fit). Age and city only if the draft has them, and never as the whole picture.
3. What they already believe. The opinions they hold before they see the ad: distrust of hype, loyalty to a workaround, a story they tell themselves. This is what hooks have to agree with or gently correct.
4. Language they actually use. Phrases from reviews, comments, support tickets, or the draft. Creators should be able to speak in this register, not in brand voice.
5. Where they hang out. Apps, creators, communities, group chats, search habits. Enough that a campaign manager knows where a post should feel native.
6. Purchase trigger. The moment they look: a failed season, a new job, a broken tool, a friend's rec. Name it if the draft has it.
7. Who this is not for. One sentence. Keeps briefs from drifting.

Rewrite rules:
- Keep every fact the author wrote. Do not invent personas, platforms, or quotes.
- Tighten, order, and fill obvious gaps only from what is already in the draft.
- Write as a character brief a creator can read once and shoot. Short paragraphs. Sentence case. No emoji. Never an em dash or en dash. Use a period, comma, or colon instead.
- If the draft is a messy dump, produce a clean 4 to 8 sentence Audience brief covering who, beliefs, language, hangouts, and the trigger.
- Return only the rewritten document. No preamble.`;

const GUIDES: Record<BrainDocKind, string> = {
  product: PRODUCT_GUIDE,
  audience: AUDIENCE_GUIDE,
};

const MODELS = ["gpt-5.4-mini", "gpt-5-mini"] as const;

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

interface ChatChoice {
  message?: { content?: string | null };
}

interface ChatResponse {
  error?: { message?: string; code?: string };
  choices?: ChatChoice[];
}

function hasDashes(text: string): boolean {
  return /[\u2013\u2014]/.test(text);
}

function stripDashes(text: string): string {
  return text.replace(/\u2014/g, ". ").replace(/\u2013/g, ", ");
}

async function complete(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
): Promise<{ ok: true; text: string } | { ok: false; status: number; error: string }> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_completion_tokens: 1200,
    }),
  });
  const json = (await res.json()) as ChatResponse;
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: json.error?.message ?? `OpenAI ${res.status}`,
    };
  }
  const text = json.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) return { ok: false, status: 200, error: "OpenAI returned an empty rewrite." };
  return { ok: true, text };
}

export async function rewriteBrainDoc(
  kind: BrainDocKind,
  draft: string,
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      error: "Clean up with AI is not configured. Add OPENAI_API_KEY on the server.",
    };
  }

  const messages: ChatMessage[] = [
    { role: "system", content: GUIDES[kind] },
    {
      role: "user",
      content: `Rewrite this ${kind === "product" ? "Product" : "Audience"} draft into the Company Brain document.\n\n${draft}`,
    },
  ];

  let lastError = "OpenAI is unavailable.";
  for (const model of MODELS) {
    const result = await complete(apiKey, model, messages);
    if (result.ok) {
      const text = hasDashes(result.text) ? stripDashes(result.text) : result.text;
      return { ok: true, text };
    }
    lastError = result.error;
    const retryable = result.status === 404 || result.status === 400;
    if (!retryable) return { ok: false, error: lastError };
  }
  return { ok: false, error: lastError };
}

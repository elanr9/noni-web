/* The onboarding conversation's wire format (edge function onboarding-chat,
   relayed by /onboarding/chat) and the client that reads its stream. */

export type ChatOption = { value: string; label: string };

export type SlotSpec = {
  key: string;
  kind: "choice" | "multi" | "text" | "summary" | "done";
  options?: ChatOption[];
  placeholder?: string;
  /** A draft answer from the site, offered as "That's right". */
  draft?: string;
};

export type ChatMessage = { role: "assistant" | "user"; text: string; slot: string };

export type ChatState = {
  messages: ChatMessage[];
  pending: SlotSpec | null;
  first_name: string;
  company_name: string;
  progress?: ChatProgress;
};

export type ChatProgress = { at: number; total: number };

export type ChatAnswer = { slot: string; value: string | string[]; text: string };

export async function loadChat(): Promise<ChatState> {
  const res = await fetch("/onboarding/chat", { method: "POST", body: JSON.stringify({ action: "state" }) });
  const json = (await res.json().catch(() => null)) as (ChatState & { error?: string }) | null;
  if (!res.ok || !json) throw new Error(json?.error ?? "The conversation could not be loaded.");
  return json;
}

/** Sends one turn and calls onDelta with each piece of the reply as it is written. */
export async function sendTurn(
  answer: ChatAnswer | null,
  onDelta: (text: string) => void,
  onProgress?: (p: ChatProgress) => void,
): Promise<SlotSpec | null> {
  const res = await fetch("/onboarding/chat", {
    method: "POST",
    body: JSON.stringify({ action: "turn", ...(answer ? { answer } : {}) }),
  });
  if (!res.ok || !res.body) {
    const json = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(json?.error ?? "Noni could not answer. Try again.");
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let pending: SlotSpec | null = null;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let cut = buffer.indexOf("\n\n");
    while (cut >= 0) {
      const line = buffer.slice(0, cut).trim();
      buffer = buffer.slice(cut + 2);
      cut = buffer.indexOf("\n\n");
      if (!line.startsWith("data:")) continue;
      const event = JSON.parse(line.slice(5)) as
        | { type: "delta"; text: string }
        | { type: "done"; pending: SlotSpec | null; progress?: ChatProgress }
        | { type: "error"; message: string };
      if (event.type === "delta") onDelta(event.text);
      else if (event.type === "done") {
        pending = event.pending;
        if (event.progress) onProgress?.(event.progress);
      }
      else throw new Error(event.message);
    }
  }
  return pending;
}

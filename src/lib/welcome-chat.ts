import type { ApplyKind } from "@/lib/applications";

/* The first lines of the Get started chat (components/apply/WelcomeChat):
   sign in with Google first, then Noni asks company or creator (and the
   name only when Google did not give one). They are carried into the real
   chat after it (app/apply/page.tsx), so the conversation reads as one. */

export const SIGN_IN_FIRST = "Hi, I'm Noni! Sign in with Google to get started.";
export const ASK_NAME = "Hi, I'm Noni! What should I call you?";
export const askKind = (first: string) => `Nice to meet you, ${first}! Are you a company or a creator?`;
export const KIND_ANSWER: Record<ApplyKind, string> = { company: "A company", creator: "A creator" };

export type IntroLine = { role: "assistant" | "user"; text: string; slot: string };

/** The opening as chat messages: the name when it was asked, and the company or creator answer when it was asked. */
export function introOf(name: string, kind: ApplyKind, askedKind: boolean, askedName = false): IntroLine[] {
  const first = name.trim().split(/\s+/)[0] ?? name;
  return [
    ...(askedName
      ? [
          { role: "assistant" as const, text: ASK_NAME, slot: "intro_name" },
          { role: "user" as const, text: name, slot: "intro_name" },
        ]
      : []),
    ...(askedKind
      ? [
          { role: "assistant" as const, text: askKind(first), slot: "intro_kind" },
          { role: "user" as const, text: KIND_ANSWER[kind], slot: "intro_kind" },
        ]
      : []),
  ];
}

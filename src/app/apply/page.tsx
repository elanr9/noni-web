import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ApplyChooser } from "@/components/apply/ApplyChooser";
import { GetStartedChat } from "@/components/apply/GetStartedChat";
import { SignUpWithGoogle } from "@/components/apply/SignUpWithGoogle";
import { WelcomeChat } from "@/components/apply/WelcomeChat";
import { ChatDone, CreatorApproved, InReview, NotAccepted } from "@/components/apply/ApplyStatus";
import { ChatOnboarding } from "@/components/admin/onboarding/ChatOnboarding";
import { parseKind, type ApplyKind, type ApplyState, type MyApplication } from "@/lib/applications";
import { callEdgeFunction } from "@/lib/edge";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_URL } from "@/lib/site-config";
import { introOf } from "@/lib/welcome-chat";

export const metadata = { title: "Join Noni" };
export const dynamic = "force-dynamic";

/* The front door (Get started). Signed out, one chat with no account
   (GetStartedChat): Noni asks their name, then company or creator.
   - Company: the questions for the call, saved as a lead, then the
     founders' Calendly in the chat. Companies never make an account here;
     ops invites them after the call (/ops/leads).
   - Creator: the Google sign-up card, then the creator chat (these first
     lines carried in) and review (/ops/applications).
   People who already have a Noni account are sent to it. */
export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const wanted = parseKind(params.as);
  const again = params.again === "1";
  /* Said in the Get started chat before sign in: carried into the real chat. */
  const told = typeof params.name === "string" ? params.name.trim().slice(0, 60) : "";
  const intro = told && wanted ? introOf(told, wanted, params.asked === "1", params.named === "1") : [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const host = (await headers()).get("host") ?? "usenoni.app";
  if (!user) {
    if (wanted === "creator") {
      const carry = told ? `&name=${encodeURIComponent(told)}&asked=${params.asked === "1" ? 1 : 0}&named=${params.named === "1" ? 1 : 0}` : "";
      return <SignUpWithGoogle preselect="creator" carry={carry} />;
    }
    return <GetStartedChat bookingUrl={BOOKING_URL} host={host} />;
  }

  const email = user.email?.toLowerCase() ?? "";
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const name = typeof meta.full_name === "string" ? meta.full_name : typeof meta.name === "string" ? meta.name : "";

  /* An email invite waiting for this person beats an application. */
  await supabase.rpc("claim_pending_invite");

  const state = await callEdgeFunction<ApplyState>("apply-chat", { action: "state" });
  if (state.error !== null) {
    return <ApplyChooser signedIn preselect={wanted} />;
  }
  const apps = state.data.applications;
  const pick = (kind: ApplyKind | null): MyApplication | undefined =>
    kind ? apps.find((a) => a.kind === kind) : apps.find((a) => a.status !== "approved") ?? apps[0];
  let app = pick(wanted);
  const kind: ApplyKind | null = wanted ?? app?.kind ?? null;

  /* Already on Noni and not in the middle of applying: go to the account. */
  if (!app && state.data.has_profile && !wanted) redirect("/dash");
  if (!kind) return <WelcomeChat signedIn preselect={null} />;
  /* Signing up fresh with company or creator already in the link: the chat
     still asks their name first (always, whatever Google gave). */
  if (!told && !app && !state.data.has_profile) return <WelcomeChat signedIn preselect={kind} />;

  /* A company never gets an account from here: the same lead chat as
     signed out, then the call. */
  if (kind === "company") return <GetStartedChat bookingUrl={BOOKING_URL} host={host} startName={told || name} />;

  if (!app || (app.status === "rejected" && again)) {
    const started = await callEdgeFunction<{ application: MyApplication }>("apply-chat", {
      action: "start",
      kind,
      ...(told ? { name: told, intro } : {}),
    });
    if (started.error !== null) return <ApplyChooser signedIn preselect={kind} />;
    app = started.data.application;
  }

  if (app.status === "approved") return <CreatorApproved email={email} name={name} />;
  if (app.status === "pending") return <InReview kind={kind} email={email} />;
  if (app.status === "rejected") return <NotAccepted kind={kind} note={app.decision_note} />;

  return <ChatOnboarding email={email} source={{ endpoint: "/apply/chat", body: { kind } }} done={<ChatDone kind={kind} />} />;
}

import { redirect } from "next/navigation";

import { ApplyChooser } from "@/components/apply/ApplyChooser";
import { WelcomeChat } from "@/components/apply/WelcomeChat";
import { ChatDone, CreatorApproved, InReview, NotAccepted } from "@/components/apply/ApplyStatus";
import { ChatOnboarding } from "@/components/admin/onboarding/ChatOnboarding";
import { parseKind, type ApplyKind, type ApplyState, type MyApplication } from "@/lib/applications";
import { callEdgeFunction } from "@/lib/edge";
import { createClient } from "@/lib/supabase/server";
import { introOf } from "@/lib/welcome-chat";

export const metadata = { title: "Join Noni" };
export const dynamic = "force-dynamic";

/* The front door (Get started). Signed out, the chat starts at once
   (WelcomeChat): Noni asks their name and whether they are a company or a
   creator, then they sign in with Google and come back here with both.
   A company gets its workspace straight away and carries on in the
   onboarding chat; a creator carries on in the creator chat and waits for
   review (/ops/applications). The first lines are carried into either chat.
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
  const intro = told && wanted ? introOf(told, wanted, params.asked === "1") : [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <WelcomeChat signedIn={false} preselect={wanted} />;

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

  /* A company is let straight in: its workspace is made now and the
     onboarding chat (the first thing every company does) asks the rest. */
  if (kind === "company") {
    const joined = await callEdgeFunction<{ company_id: string | null }>("apply-chat", {
      action: "join_company",
      kind: "company",
      ...(told ? { name: told, intro } : {}),
    });
    if (joined.error !== null) return <ApplyChooser signedIn preselect="company" />;
    redirect("/onboarding");
  }

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

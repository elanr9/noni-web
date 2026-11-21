import { redirect } from "next/navigation";

import { ApplyChooser } from "@/components/apply/ApplyChooser";
import { ChatDone, CreatorApproved, InReview, NotAccepted } from "@/components/apply/ApplyStatus";
import { ChatOnboarding } from "@/components/admin/onboarding/ChatOnboarding";
import { parseKind, type ApplyKind, type ApplyState, type MyApplication } from "@/lib/applications";
import { callEdgeFunction } from "@/lib/edge";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Join Noni" };
export const dynamic = "force-dynamic";

/* The front door. Brands and creators sign in with Google, answer a short
   chat (edge function apply-chat) and wait in review; the platform admin
   approves them in /ops/applications. Where someone lands here depends only
   on their application: no application shows the two choices, a draft opens
   the chat, pending shows "in review", and an approved company goes to its
   dashboard. People who already have a Noni account are sent to it. */
export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const wanted = parseKind(params.as);
  const again = params.again === "1";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <ApplyChooser signedIn={false} preselect={wanted} />;

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
  if (!kind) return <ApplyChooser signedIn preselect={null} />;

  if (!app || (app.status === "rejected" && again)) {
    const started = await callEdgeFunction<{ application: MyApplication }>("apply-chat", { action: "start", kind });
    if (started.error !== null) return <ApplyChooser signedIn preselect={kind} />;
    app = started.data.application;
  }

  if (app.status === "approved") {
    if (kind === "company") {
      /* First visit after approval: start reading their site for the briefs. */
      await callEdgeFunction<unknown>("apply-chat", { action: "first_scan" }).catch(() => null);
      redirect("/dash");
    }
    return <CreatorApproved email={email} name={name} />;
  }
  if (app.status === "pending") return <InReview kind={kind} email={email} />;
  if (app.status === "rejected") return <NotAccepted kind={kind} note={app.decision_note} />;

  return <ChatOnboarding email={email} source={{ endpoint: "/apply/chat", body: { kind } }} done={<ChatDone kind={kind} />} />;
}

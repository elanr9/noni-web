import { redirect } from "next/navigation";

import {
  getSessionProfile,
  isCampaignManager,
  isPlatformAdmin,
} from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/* Role router: after sign-in or an account switch, sends each account to
   its home dashboard. Creators land on /admin, which shows the friendly
   app-only gate. Pending email invites are attached first, like the app
   does on launch, so a new membership is in place before routing. */
export async function GET() {
  const supabase = await createClient();
  await supabase.rpc("claim_pending_invite");
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect("/login");
  if (isPlatformAdmin(profile)) redirect("/ops");
  if (isCampaignManager(profile)) redirect("/manager");
  redirect("/admin");
}

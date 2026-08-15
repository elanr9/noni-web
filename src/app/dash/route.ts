import { redirect } from "next/navigation";

import {
  getSessionProfile,
  isCampaignManager,
  isPlatformAdmin,
} from "@/lib/auth";

/* Role router: after sign-in or an account switch, sends each account to
   its home dashboard. Creators land on /admin, which shows the friendly
   app-only gate. */
export async function GET() {
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect("/login");
  if (isPlatformAdmin(profile)) redirect("/ops");
  if (isCampaignManager(profile)) redirect("/manager");
  redirect("/admin");
}

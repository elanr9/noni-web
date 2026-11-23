import { GetTheApp } from "@/components/GetTheApp";
import { getSessionProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/* The setup step after the plan: get the iPhone app (TestFlight while in
   beta). Reached from the Onboarding checklist. */
export default async function AdminAppPage() {
  const { profile } = await getSessionProfile();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto w-full max-w-[560px] px-5 py-10">
      <h1 className="display m-0 text-[30px] font-bold tracking-[-0.02em] text-ink">Get the app</h1>
      <div className="mt-6 rounded-[20px] border border-line bg-white p-5">
        <GetTheApp email={user?.email ?? ""} name={profile?.full_name ?? ""} source="dashboard" look="ops" />
      </div>
    </div>
  );
}

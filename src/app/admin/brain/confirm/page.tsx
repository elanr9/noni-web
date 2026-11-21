import { redirect } from "next/navigation";

/* The company chat moved out of the dashboard frame to its own full screen. */
export default function BrainConfirmRedirect() {
  redirect("/onboarding/company");
}

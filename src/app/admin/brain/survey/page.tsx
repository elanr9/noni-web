import { redirect } from "next/navigation";

/* The founder questions are gone: Noni fills the brain in for the company.
   Old links land on the brain itself. */
export default function AdminBrainSurveyPage() {
  redirect("/admin/brain");
}

/* Applications (edge function apply-chat): a company or a creator applies on
   /apply and waits for the platform admin to approve them in /ops. */

export type ApplyKind = "company" | "creator";
export type ApplyStatus = "draft" | "pending" | "approved" | "rejected";

export type MyApplication = { id: string; kind: ApplyKind; status: ApplyStatus; decision_note: string | null };

export type ApplyState = { applications: MyApplication[]; has_profile: boolean };

export type CreatorResume = {
  instagram: string | null;
  tiktok: string | null;
  experience: "pro" | "some" | "new" | null;
  campaigns_done: string | null;
  best_campaign: string | null;
  niches: string[];
  on_camera: string | null;
  weekly_capacity: string | null;
  portfolio: { url: string }[];
};

export type ReviewApplication = {
  id: string;
  kind: ApplyKind;
  status: Exclude<ApplyStatus, "draft">;
  email: string | null;
  full_name: string | null;
  answers: Record<string, string | string[]>;
  submitted_at: string | null;
  decided_at: string | null;
  decision_note: string | null;
  company_id: string | null;
  resume: CreatorResume | null;
};

export function parseKind(value: string | string[] | undefined): ApplyKind | null {
  const v = Array.isArray(value) ? value[0] : value;
  return v === "company" || v === "creator" ? v : null;
}

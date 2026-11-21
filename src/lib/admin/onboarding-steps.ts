/* The onboarding flow's screens in order, shared by the client flow and the
   server page that resumes it. The current step is kept in a cookie so a
   refresh or a return visit opens on the same screen. */

export const ONBOARDING_STEPS = [
  "welcome",
  "name",
  "role",
  "website",
  "goal",
  "platforms",
  "creatorsWanted",
  "budget",
  "launch",
  "ugc",
  "creators",
  "managers",
  "selfManager",
  "download",
  "scan",
  "survey",
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number];

export const ONBOARDING_STEP_COOKIE = "noni_onb";

export interface OnboardingSaved {
  name: string;
  website: string;
  role: string;
  doesUgc: boolean;
  managerCount: number;
}

/* The step to reopen on. A remembered step is only trusted when the answers
   it depends on were saved; otherwise the flow reopens on the first screen
   whose answer is missing. */
export function resumeStep(remembered: string | undefined, saved: OnboardingSaved): OnboardingStepId {
  const step = ONBOARDING_STEPS.find((s) => s === remembered);
  if (!step || step === "welcome") return "welcome";
  const at = ONBOARDING_STEPS.indexOf(step);
  const past = (other: OnboardingStepId) => at > ONBOARDING_STEPS.indexOf(other);
  if (past("name") && !saved.name.trim()) return "name";
  if (past("role") && !saved.role.trim()) return "role";
  if (past("website") && !saved.website.trim()) return "website";
  if ((step === "creators" || step === "managers") && !saved.doesUgc) return "ugc";
  if ((step === "selfManager" || step === "download") && saved.managerCount < 1) return "ugc";
  return step;
}

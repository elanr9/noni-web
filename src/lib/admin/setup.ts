/* The setup to-do, derived from the dataset. Everything a company has to
   do itself is a step here, never a card on some other page waiting to be
   found. The company sets itself up first and brings people in last:
   1. Plan: a running subscription (active or trialing). The creator budget
      is set by the Noni team and does not gate the step.
   2. Connections: done once both Stripe (sales) and Supabase (sign-ups)
      are connected, so every post shows what it brought in.
   2b. Logo: done once the company has uploaded its logo; creators see it
      on the campaign card.
   3. Screenshots: done once the media library holds at least one
      screenshot or recording of the product.
   4. App: done once a company admin asked for the iPhone app invite
      (TestFlight while in beta) or signed in on the app.
   5. Managers: done once at least one campaign manager is on the team,
      or the admin runs the campaigns themselves (runBy "me", or the
      "I'll manage it" option on the step).
   6. Creators: done once at least one creator is on the team.
   The company details are never a step: onboarding and the site scan
   settle them, and Noni fills the brain itself.
   When the company hands the campaigns to Noni (onboarding chat: "Noni runs
   it for us"), it is hands off: only the plan and the connections are its
   to do. Noni writes the company details, gets the screenshots and brings
   the creators in itself.
   The steps run in order: each one stays locked until the one before it
   is done, so there is always exactly one thing to do next.
   When every step is done the Onboarding tab retires: nav item, badge and
   search entry disappear and /admin redirects to /admin/analytics. */

import type { AdminDataset } from "./types";

export type SetupStepKey =
  | "billing"
  | "logo"
  | "app"
  | "media"
  | "managers"
  | "creators"
  | "sales";

export interface SetupStep {
  key: SetupStepKey;
  done: boolean;
  title: string;
  /** One or two words for the step strip, e.g. "Plan". */
  short: string;
  /** Action pill label, e.g. "Open Billing". */
  action: string;
  /** Where the action pill navigates. */
  href: string;
}

export interface SetupStatus {
  /** Ordered steps. */
  steps: SetupStep[];
  doneCount: number;
  remaining: number;
  /** True retires the Onboarding tab everywhere. */
  complete: boolean;
}

export function deriveSetupStatus(dataset: AdminDataset): SetupStatus {
  const { onboarding } = dataset.company;

  const { subscription } = dataset.billing;
  const billingDone =
    subscription.status === "active" || subscription.status === "trialing";

  /* Running the campaigns themselves: the admin is the manager. */
  const runsItThemselves = onboarding.runBy === "me" || onboarding.selfIsManager;
  const managersDone = runsItThemselves || dataset.managers.length >= 1;
  const creatorsDone = dataset.creators.length >= 1;

  const steps: SetupStep[] = [
    {
      key: "billing",
      done: billingDone,
      title: "Pick your plan",
      short: "Plan",
      action: "Pick a plan",
      href: "/admin/billing",
    },
    {
      key: "sales",
      done: dataset.billing.stripeConnected && dataset.billing.supabaseConnected,
      title: "Connect Stripe and Supabase",
      short: "Connections",
      action: "Connect",
      href: "/admin/billing?step=sales",
    },
    {
      key: "logo",
      done: Boolean(dataset.company.logoPath),
      title: "Upload your logo",
      short: "Logo",
      action: "Upload logo",
      href: "/admin/brain",
    },
    {
      key: "media",
      done: dataset.company.mediaCount >= 1,
      title: "Add screenshots of your product",
      short: "Screenshots",
      action: "Add screenshots",
      href: "/onboarding/media",
    },
    {
      key: "app",
      done: dataset.company.appRequested,
      title: "Get the iPhone app",
      short: "App",
      action: "Get the app",
      href: "/admin/app",
    },
    {
      key: "managers",
      done: managersDone,
      title: "Invite a campaign manager",
      short: "Manager",
      action: "Invite a manager",
      href: "/admin/team?tab=managers",
    },
    {
      key: "creators",
      done: creatorsDone,
      title: "Invite your first creator",
      short: "Creator",
      action: "Invite a creator",
      href: "/admin/team?tab=creators",
    },
  ];

  const keep: SetupStepKey[] = ["billing", "sales", "logo", "app"];
  const shown = onboarding.runBy === "noni" ? steps.filter((s) => keep.includes(s.key)) : steps;

  const doneCount = shown.filter((s) => s.done).length;
  return {
    steps: shown,
    doneCount,
    remaining: shown.length - doneCount,
    complete: doneCount === shown.length,
  };
}

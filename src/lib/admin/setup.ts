/* The setup to-do, derived from the dataset. Everything a company has to
   do itself is a step here, never a card on some other page waiting to be
   found. The company sets itself up first and brings people in last:
   1. Plan: a running subscription (active or trialing). The creator budget
      is set by the Noni team and does not gate the step.
   1b. App: done once a company admin asked for the iPhone app invite
      (TestFlight while in beta) or signed in on the app. Never offered
      before the plan.
   2. Company brain: done once the company has confirmed (or fixed) every
      line of the summary Noni wrote from its website, in the short chat at
      /onboarding/company. Noni still fills in the detail itself.
   3. Screenshots: done once the media library holds at least one
      screenshot or recording of the product.
   The color of the text on posts is not a step: Noni reads it off the
   company's website, and it can be changed under Media.
   4. Connections: done once both Stripe (sales) and Supabase (sign-ups)
      are connected, so every post shows what it brought in. Required.
   5. Managers: done once at least one campaign manager is on the team
      (self-as-manager rows count like any other). Omitted when the admin
      runs the campaigns themselves (runBy "me"), and when the
      onboarding count is 0.
   6. Creators: done once at least one creator is on the team.
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
  | "app"
  | "brain"
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
  /** Ordered steps; manager and creator steps are omitted at count 0. */
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

  /* A company that does not do UGC yet still starts with one of each. */
  /* Running the campaigns themselves: there is no manager to invite. */
  const runsItThemselves = onboarding.runBy === "me" || onboarding.selfIsManager;
  const showManagers = runsItThemselves ? false : onboarding.doesUgc ? onboarding.managerCount > 0 : true;
  const showCreators = onboarding.doesUgc ? onboarding.creatorCount > 0 : true;
  const managersDone = dataset.managers.length >= 1;
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
      key: "app",
      done: dataset.company.appRequested,
      title: "Get the iPhone app",
      short: "App",
      action: "Get the app",
      href: "/admin/app",
    },
    {
      key: "brain",
      done: dataset.company.brainConfirmed,
      title: "Confirm your company details",
      short: "Your company",
      action: "Confirm",
      href: "/onboarding/company",
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
      key: "sales",
      done: dataset.billing.stripeConnected && dataset.billing.supabaseConnected,
      title: "Connect Stripe and Supabase",
      short: "Connections",
      action: "Connect",
      href: "/admin/billing?step=sales",
    },
    ...(showManagers
      ? [
          {
            key: "managers" as const,
            done: managersDone,
            title: "Invite your first campaign manager",
            short: "Manager",
            action: "Invite a manager",
            href: "/admin/team",
          },
        ]
      : []),
    ...(showCreators
      ? [
          {
            key: "creators" as const,
            done: creatorsDone,
            title: "Invite your first creator",
            short: "Creator",
            action: "Invite a creator",
            href: "/admin/team",
          },
        ]
      : []),
  ];

  const keep: SetupStepKey[] = ["billing", "app", "sales"];
  const shown = onboarding.runBy === "noni" ? steps.filter((s) => keep.includes(s.key)) : steps;

  const doneCount = shown.filter((s) => s.done).length;
  return {
    steps: shown,
    doneCount,
    remaining: shown.length - doneCount,
    complete: doneCount === shown.length,
  };
}

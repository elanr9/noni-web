/* The gamified setup to-do, derived from the dataset exactly per the
   handoff README:
   1. Plan: a running subscription (active or trialing). The creator budget
      is set by the Noni team on a call and Stripe Connect is optional, so
      neither gates the step.
   2. Managers: done once at least one campaign manager is on the team
      (self-as-manager rows count like any other). Omitted when the
      onboarding count is 0.
   3. Creators: done once at least one creator is on the team.
   4. Screenshots: done once the media library holds at least one
      screenshot or recording of the product. It comes last: the team is
      in before anyone is asked to gather files.
   Anything else a company has to do itself belongs here as a step, never
   as a card on some other page waiting to be found.
   The steps run in order: each one stays locked until the one before it
   is done, so there is always exactly one thing to do next.
   The company brain is not a step: Noni fills it in for the company.
   When every step is done the Onboarding tab retires: nav item, badge and
   search entry disappear and /admin redirects to /admin/analytics. */

import type { AdminDataset } from "./types";

export type SetupStepKey = "billing" | "media" | "managers" | "creators";

export interface SetupStep {
  key: SetupStepKey;
  done: boolean;
  title: string;
  sub: string;
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
  const showManagers = onboarding.doesUgc ? onboarding.managerCount > 0 : true;
  const showCreators = onboarding.doesUgc ? onboarding.creatorCount > 0 : true;
  const managersDone = dataset.managers.length >= 1;
  const creatorsDone = dataset.creators.length >= 1;

  const steps: SetupStep[] = [
    {
      key: "billing",
      done: billingDone,
      title: "Pick your plan",
      sub: "Choose how many creators you want to run. It takes a minute.",
      action: "Pick a plan",
      href: "/admin/billing",
    },
    ...(showManagers
      ? [
          {
            key: "managers" as const,
            done: managersDone,
            title: "Invite your first campaign manager",
            sub: "The person who sends briefs and reviews posts. It can be you.",
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
            sub: "The people who post for you. You and your managers can be creators too.",
            action: "Invite a creator",
            href: "/admin/team",
          },
        ]
      : []),
    {
      key: "media",
      done: dataset.company.mediaCount >= 1,
      title: "Add screenshots of your product",
      sub: "A few screenshots or screen recordings. Your posts are built from them.",
      action: "Add screenshots",
      href: "/admin/media",
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  return {
    steps,
    doneCount,
    remaining: steps.length - doneCount,
    complete: doneCount === steps.length,
  };
}

/* The gamified setup to-do, derived from the dataset exactly per the
   handoff README:
   1. Brain: Product AND Audience docs non-empty.
   2. Billing: subscription active AND monthly spend limit set AND Stripe
      connected.
   3. Managers: done at the onboarding manager count (self-as-manager rows
      count like any other). Omitted entirely when the count is 0.
   4. Creators: same count logic, subtitle tracks invited-so-far.
   When every step is done the Onboarding tab retires: nav item, badge and
   search entry disappear and /admin redirects to /admin/analytics. */

import type { AdminDataset } from "./types";

export type SetupStepKey = "brain" | "billing" | "managers" | "creators";

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

function inviteProgress(invited: number, required: number): string {
  return invited > 0 && invited < required
    ? ` ${invited} of ${required} invited so far.`
    : "";
}

export function deriveSetupStatus(dataset: AdminDataset): SetupStatus {
  const { onboarding } = dataset.company;

  const product = dataset.brainDocs.find((d) => d.kind === "product");
  const audience = dataset.brainDocs.find((d) => d.kind === "audience");
  const brainDone = Boolean(product?.body.trim() && audience?.body.trim());

  const billingDone =
    dataset.billing.subscription.status === "active" &&
    dataset.billing.monthlySpendLimit !== null &&
    dataset.billing.monthlySpendLimit > 0 &&
    dataset.billing.stripeConnected;

  /* A company that does not do UGC yet still starts with one of each. */
  const managersRequired = onboarding.doesUgc ? onboarding.managerCount : 1;
  const creatorsRequired = onboarding.doesUgc ? onboarding.creatorCount : 1;
  const managersDone =
    managersRequired > 0 && dataset.managers.length >= managersRequired;
  const creatorsDone =
    creatorsRequired > 0 && dataset.creators.length >= creatorsRequired;

  const steps: SetupStep[] = [
    {
      key: "brain",
      done: brainDone,
      title: "Fill in your company brain",
      sub: "Help us learn more about your company.",
      action: "Open Company Brain",
      href: "/admin/brain",
    },
    {
      key: "billing",
      done: billingDone,
      title: "Set your budget and subscription",
      sub: "Purchase your subscription, set the monthly budget that pays bounties, and connect Stripe so Analytics shows real numbers.",
      action: "Open Billing",
      href: "/admin/billing",
    },
    ...(managersRequired > 0
      ? [
          {
            key: "managers" as const,
            done: managersDone,
            title:
              managersRequired > 1
                ? `Invite your ${managersRequired} campaign managers`
                : "Invite your campaign manager(s)",
            sub:
              "Anyone that's a part of your brief generation and campaign management!" +
              inviteProgress(dataset.managers.length, managersRequired),
            action: "Invite managers",
            href: "/admin/team",
          },
        ]
      : []),
    ...(creatorsRequired > 0
      ? [
          {
            key: "creators" as const,
            done: creatorsDone,
            title:
              creatorsRequired > 1
                ? `Invite your ${creatorsRequired} creators`
                : "Invite your creators",
            sub:
              "Let's get your creator army over here!" +
              inviteProgress(dataset.creators.length, creatorsRequired),
            action: "Invite creators",
            href: "/admin/team",
          },
        ]
      : []),
  ];

  const doneCount = steps.filter((s) => s.done).length;
  return {
    steps,
    doneCount,
    remaining: steps.length - doneCount,
    complete: doneCount === steps.length,
  };
}

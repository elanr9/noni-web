/* Accounts that may restart onboarding from scratch to test it. The server
   action checks this list against the signed-in email; the buttons only
   show for these accounts. */
export const ONBOARDING_TESTERS = ["elanromo09@gmail.com"];

export function isOnboardingTester(email: string | null | undefined): boolean {
  return Boolean(email) && ONBOARDING_TESTERS.includes(email!.trim().toLowerCase());
}

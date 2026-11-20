/* Where the web sends someone after they join a company, by the seat they
   hold in THAT company. A company admin goes through onboarding only while
   the company itself is not set up. Creators have no web dashboard. */
export function inviteDestination(
  memberRole: string | null | undefined,
  companyOnboarded: boolean,
): string | null {
  if (memberRole === "company_admin") return companyOnboarded ? "/admin" : "/onboarding";
  if (memberRole === "campaign_manager") return "/manager";
  return null;
}

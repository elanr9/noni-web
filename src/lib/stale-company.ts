/* The active company is one server value shared by every tab and by the
   mobile app, so a page rendered for company A can still be open after the
   account moved to company B. Mutating server actions take the company id
   their page was rendered for and refuse when it is no longer the caller's
   active company, instead of writing to the wrong one. Keep this module
   free of server only imports. */

export const STALE_COMPANY_ERROR =
  "You switched companies since this page loaded, so nothing was changed. Reload the page and try again.";

/** True when the page that sent an action was rendered for another company
    than the one the caller is working in now. */
export function isStaleCompany(
  activeCompanyId: string | null | undefined,
  renderedForCompanyId: string | null | undefined,
): boolean {
  return !activeCompanyId || !renderedForCompanyId || activeCompanyId !== renderedForCompanyId;
}

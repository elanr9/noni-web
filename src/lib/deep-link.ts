/* Deep link grammar shared with the app and the notify edge functions:
   noni://<role>/<company_id>/<screen>[/<id>]. The web only hosts the
   manager side; creator links land on the manager home of that company. */

export type DeepLink = {
  role: "creator" | "manager";
  companyId: string;
  screen: string;
  id: string | null;
};

const SCHEME = "noni://";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SEGMENT = /^[a-z0-9-]+$/;

export function parseDeepLink(raw: unknown): DeepLink | null {
  if (typeof raw !== "string" || !raw.startsWith(SCHEME)) return null;
  const parts = raw.slice(SCHEME.length).split("/").filter((p) => p.length > 0);
  if (parts.length < 3 || parts.length > 4) return null;
  const [role, companyId, screen, id] = parts;
  if (role !== "creator" && role !== "manager") return null;
  if (!UUID.test(companyId)) return null;
  if (!SEGMENT.test(screen)) return null;
  if (id !== undefined && !SEGMENT.test(id)) return null;
  return { role, companyId, screen, id: id ?? null };
}

const MANAGER_ROUTES: Record<string, (id: string) => string> = {
  review: (id) => `/manager/review/${id}`,
  week: (id) => `/manager/briefs/week/${id}`,
  chat: (id) => `/manager/creators/${id}/chat`,
  creator: (id) => `/manager/creators/${id}`,
  music: (id) => `/manager/music/${id}`,
  "account-approval": (id) => `/manager/accounts/${id}`,
};

/* Web route for a parsed link. Unknown screens land on the manager home. */
export function webRouteForDeepLink(link: DeepLink): string {
  if (link.role !== "manager") return "/manager";
  if (link.screen === "analytics") return "/manager/analytics";
  const build = link.id ? MANAGER_ROUTES[link.screen] : undefined;
  return build && link.id ? build(link.id) : "/manager";
}

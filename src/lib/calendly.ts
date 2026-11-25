/* The founders' Calendly as an inline embed, filled in with who they are.
   embed_domain + embed_type make Calendly post its events
   (calendly.event_scheduled) back to the page. */
export function calendlySrc(url: string, host: string, who: { name: string; email: string; color: string }): string {
  const u = new URL(url);
  u.searchParams.set("embed_domain", host);
  u.searchParams.set("embed_type", "Inline");
  u.searchParams.set("hide_gdpr_banner", "1");
  u.searchParams.set("hide_event_type_details", "1");
  u.searchParams.set("primary_color", who.color.replace("#", ""));
  if (who.name) u.searchParams.set("name", who.name);
  if (who.email) u.searchParams.set("email", who.email);
  return u.toString();
}

/** True for Calendly's "booked" message. */
export function isCalendlyBooked(e: MessageEvent): boolean {
  if (e.origin !== "https://calendly.com") return false;
  const data = e.data as { event?: string } | null;
  return data?.event === "calendly.event_scheduled";
}

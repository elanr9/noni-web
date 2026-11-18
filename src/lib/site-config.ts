/* Public links that change per deploy, configured in one place. Client safe.
   Each NEXT_PUBLIC_ value is referenced literally so Next inlines it into
   client bundles at build time.

   - NEXT_PUBLIC_IOS_APP_URL: where people get the iPhone app. Before launch
     set it to the TestFlight public link (https://testflight.apple.com/join/
     ...); after launch, the App Store listing. Leave it empty while neither
     exists: every "Get the app" surface then explains that a TestFlight
     invite is on its way instead of linking to a listing that 404s.
   - NEXT_PUBLIC_CONTACT_EMAIL: the Noni inbox behind every Contact link.
     Leave it empty and Contact opens the lead form instead of a mailto. */

function cleanUrl(value: string | undefined): string | null {
  const v = value?.trim();
  if (!v) return null;
  try {
    const url = new URL(v);
    if (url.protocol !== "https:") return null;
    /* A bare host (e.g. https://apps.apple.com) is a placeholder, not a
       listing. */
    if (url.pathname.replace(/\/+$/, "") === "") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function cleanEmail(value: string | undefined): string | null {
  const v = value?.trim();
  return v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : null;
}

export const IOS_APP_URL: string | null = cleanUrl(process.env.NEXT_PUBLIC_IOS_APP_URL);

export type IosAppAvailability = "app_store" | "testflight" | "invite_only";

/** How people get the app right now: a public App Store listing, a public
    TestFlight link, or (neither configured) a TestFlight invite by email. */
export const IOS_APP_AVAILABILITY: IosAppAvailability = !IOS_APP_URL
  ? "invite_only"
  : new URL(IOS_APP_URL).hostname === "testflight.apple.com"
    ? "testflight"
    : "app_store";

export const CONTACT_EMAIL: string | null = cleanEmail(
  process.env.NEXT_PUBLIC_CONTACT_EMAIL,
);

/** mailto: link to the Noni inbox, or null when no inbox is configured. */
export function contactMailto(subject: string): string | null {
  if (!CONTACT_EMAIL) return null;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

/* Where a company books a call with the founders (a Calendly or Cal.com
   link in NEXT_PUBLIC_BOOKING_URL). Leave it empty and "Book a call" opens
   the request form instead, which emails the founders. */
export const BOOKING_URL: string | null = cleanUrl(process.env.NEXT_PUBLIC_BOOKING_URL);

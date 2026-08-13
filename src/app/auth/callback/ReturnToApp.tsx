"use client";

import { useEffect } from "react";

/* The iOS app's auth session is watching for the noni:// scheme, so bounce
   immediately with the auth params intact; the app exchanges the PKCE code.
   Keep a manual link in case the browser blocks the automatic redirect. */
export function ReturnToApp({ query }: { query: string }) {
  const appUrl = `noni://auth/callback${query ? `?${query}` : ""}`;

  useEffect(() => {
    window.location.replace(appUrl);
  }, [appUrl]);

  return (
    <div className="grid min-h-screen place-items-center bg-white">
      <a href={appUrl} className="text-[15px] font-bold text-ink underline">
        Tap to return to Noni
      </a>
    </div>
  );
}

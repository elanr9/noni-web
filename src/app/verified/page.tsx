"use client";

import { useEffect } from "react";

/* Where Stripe's ID check sends a creator when it is done: straight back into
   the Noni app (the app's legal setup opened this in a sign-in style browser
   and closes it when it sees the noni:// address). */
const APP_URL = "noni://legal";

export default function VerifiedPage() {
  useEffect(() => {
    window.location.replace(APP_URL);
  }, []);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 text-center">
      <h1 className="display text-3xl font-semibold text-ink">Back to Noni</h1>
      <a href={APP_URL} className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-white">
        Open Noni
      </a>
    </main>
  );
}

"use server";

/* Emails a one-time sign-in link (email-sign-in edge function). Companies
   sign in this way; creators use Google. It always reports sent, so the
   form never tells anyone whether an address has an account. */
export async function sendSignInLink(email: string, next: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const clean = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return { ok: false, error: "Enter a valid email." };
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/email-sign-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    },
    body: JSON.stringify({ email: clean, next }),
  }).catch(() => null);
  if (!res || res.status >= 500) return { ok: false, error: "That did not send. Try again." };
  return { ok: true };
}

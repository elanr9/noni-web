/* A creator who has not signed in yet answers the apply chat as a guest.
   The id lives in an httpOnly cookie set by /apply/chat. */
export const GUEST_COOKIE = "noni_guest";

export function isGuestId(v: string | undefined | null): v is string {
  return !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

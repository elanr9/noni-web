/* Display formatting shared by the Posts and Team surfaces, matching the
   prototype's aFmtK and aMoney helpers in AdminAnalytics.jsx. */

export function fmtK(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return Math.round(n / 1e3) + "k";
  return String(Math.round(n));
}

export function money(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

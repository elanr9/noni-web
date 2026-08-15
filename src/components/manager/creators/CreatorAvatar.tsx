"use client";

/* Avatar with the creator's photo when one exists, falling back to the
   kit Avatar initial style. Photos come pre-signed from the server. */
export function CreatorAvatar({
  name,
  url,
  size = 34,
}: {
  name: string;
  url: string | null;
  size?: number;
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- signed URLs are short-lived and off-origin
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-pill object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center bg-blue-100 font-extrabold text-blue-700 rounded-pill"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {initial}
    </span>
  );
}

"use client";

export function Avatar({ name, size = 34 }: { name?: string | null; size?: number }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center bg-blue-100 font-extrabold text-blue-700 rounded-pill"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {initial}
    </span>
  );
}

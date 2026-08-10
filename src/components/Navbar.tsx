"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Audience = "creators" | "businesses";

type NavbarProps = {
  audience?: Audience;
  onAudienceChange?: (audience: Audience) => void;
};

export function Navbar({ audience = "creators", onAudienceChange }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (next: Audience) => {
    if (onAudienceChange) {
      onAudienceChange(next);
      return;
    }
    window.location.href = "/";
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-line bg-white" : "bg-white"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 md:h-[72px] md:px-8">
        <Link
          href="/"
          className="display flex shrink-0 items-center gap-1.5 text-[24px] font-semibold text-ink md:gap-2 md:text-[28px]"
        >
          <img
            src="/brand/marlin-blue.svg"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 md:h-[30px] md:w-[30px]"
          />
          noni
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 md:gap-2.5">
          <button
            type="button"
            onClick={() => go("creators")}
            className={`rounded-full px-3.5 py-2 text-[13px] font-semibold transition md:px-5 md:py-2.5 md:text-[14px] ${
              audience === "creators"
                ? "bg-ink text-white"
                : "border border-line bg-white text-ink hover:border-ink/20"
            }`}
          >
            Creators
          </button>
          <button
            type="button"
            onClick={() => go("businesses")}
            className={`rounded-full px-3.5 py-2 text-[13px] font-semibold transition md:px-5 md:py-2.5 md:text-[14px] ${
              audience === "businesses"
                ? "bg-ink text-white"
                : "border border-line bg-white text-ink hover:border-ink/20"
            }`}
          >
            Businesses
          </button>
          <Link
            href="/login"
            className="rounded-full bg-ink px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-ink-soft md:px-5 md:py-2.5 md:text-[14px]"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}

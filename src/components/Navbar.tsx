"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
            src="/brand/noni-logo.svg"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 md:h-[30px] md:w-[30px]"
          />
          noni
        </Link>

        <Link
          href="/login"
          className="rounded-full bg-ink px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-ink-soft md:px-5 md:py-2.5 md:text-[14px]"
        >
          Login
        </Link>
      </div>
    </header>
  );
}

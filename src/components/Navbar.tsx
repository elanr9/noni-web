"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const APP_STORE =
  process.env.NEXT_PUBLIC_APP_STORE_URL ?? "https://apps.apple.com";

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
            src="/brand/marlin-blue.svg"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 md:h-[30px] md:w-[30px]"
          />
          noni
        </Link>

        <nav className="hidden items-center gap-8 text-[15px] font-medium text-ink-soft md:flex">
          <a href="#how" className="transition hover:text-ink">
            How it works
          </a>
          <a href="#creators" className="transition hover:text-ink">
            Creators
          </a>
          <a href="#brands" className="transition hover:text-ink">
            Businesses
          </a>
          <Link href="/admin" className="transition hover:text-ink">
            Admin
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 md:gap-2.5">
          <Link
            href="/login"
            className="rounded-full px-3 py-2 text-[13px] font-semibold text-ink transition hover:bg-black/5 md:px-5 md:py-2.5 md:text-[14px]"
          >
            Login
          </Link>
          <a
            href={APP_STORE}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-ink px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(15,23,32,0.18)] transition hover:bg-ink-soft md:px-5 md:py-2.5 md:text-[14px]"
          >
            <span className="md:hidden">Get app</span>
            <span className="hidden md:inline">Download the app</span>
          </a>
        </div>
      </div>
    </header>
  );
}

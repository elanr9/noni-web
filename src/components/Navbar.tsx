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
        scrolled ? "glass shadow-[0_8px_30px_rgba(15,23,32,0.06)]" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-[72px] md:px-8">
        <Link
          href="/"
          className="display flex items-center gap-2 text-[28px] font-semibold text-ink"
        >
          <img
            src="/brand/marlin-blue.svg"
            alt=""
            width={30}
            height={30}
            className="h-[30px] w-[30px]"
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
            Brands
          </a>
          <Link href="/admin" className="transition hover:text-ink">
            Admin
          </Link>
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="rounded-full px-4 py-2.5 text-[14px] font-semibold text-ink transition hover:bg-black/5 md:px-5"
          >
            Login
          </Link>
          <a
            href={APP_STORE}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-ink px-4 py-2.5 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(15,23,32,0.18)] transition hover:bg-ink-soft md:px-5"
          >
            Download the app
          </a>
        </div>
      </div>
    </header>
  );
}

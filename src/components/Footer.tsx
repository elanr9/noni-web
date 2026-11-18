import Link from "next/link";

import { ContactLink } from "./ContactLink";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="display flex items-center gap-2.5 text-2xl font-semibold text-ink">
          <img
            src="/brand/noni-logo.svg"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7"
          />
          noni
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-ink-soft">
          <li>
            <Link href="/#for-businesses" className="hover:text-ink">
              For Businesses
            </Link>
          </li>
          <li>
            <Link href="/#for-creators" className="hover:text-ink">
              For Creators
            </Link>
          </li>
          <li>
            <Link href="/#features" className="hover:text-ink">
              Features
            </Link>
          </li>
          <li>
            <Link href="/login" className="hover:text-ink">
              Login
            </Link>
          </li>
          <li>
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
          </li>
          <li>
            <Link href="/terms" className="hover:text-ink">
              Terms
            </Link>
          </li>
          <li>
            <Link href="/pricing" className="hover:text-ink">
              Pricing
            </Link>
          </li>
          <li>
            <ContactLink className="cursor-pointer hover:text-ink">Contact</ContactLink>
          </li>
        </ul>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-5 text-sm text-muted md:px-8">
          © {new Date().getFullYear()} Noni. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

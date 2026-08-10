import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10 md:px-8 md:py-14">
        <div>
          <div className="display flex items-center gap-2.5 text-3xl font-semibold text-ink">
            <img
              src="/brand/marlin-blue.svg"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8"
            />
            noni
          </div>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted">
            Noni turns trends into queued posts, creators make them, businesses approve
            once, and everything after that runs itself.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Product
          </div>
          <ul className="mt-4 space-y-2.5 text-[15px] text-ink-soft">
            <li>
              <a href="#how" className="hover:text-ink">
                How it works
              </a>
            </li>
            <li>
              <Link href="/login" className="hover:text-ink">
                Login
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-ink">
                Admin
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Legal
          </div>
          <ul className="mt-4 space-y-2.5 text-[15px] text-ink-soft">
            <li>
              <Link href="/privacy" className="hover:text-ink">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-ink">
                Terms of Service
              </Link>
            </li>
            <li>
              <a href="mailto:founders@fieldvisionai.com" className="hover:text-ink">
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-8">
          <span>© {new Date().getFullYear()} FieldVision AI. All rights reserved.</span>
          <span className="hidden sm:inline">
            Built for creators and the businesses that run them.
          </span>
        </div>
      </div>
    </footer>
  );
}

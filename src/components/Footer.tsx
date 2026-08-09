import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <div className="display text-3xl font-semibold text-ink">Noni</div>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted">
            The creator OS for brands that ship content every week without drowning in
            group chats.
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
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-8">
          <span>© {new Date().getFullYear()} FieldVision AI. All rights reserved.</span>
          <span>Built for creators and the brands that run them.</span>
        </div>
      </div>
    </footer>
  );
}

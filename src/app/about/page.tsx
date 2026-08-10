import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Noni",
  description:
    "The purpose of the Noni app is to help brands run creator content programs with automatic queues, recording, approval, and posting.",
  applicationName: "Noni",
  openGraph: {
    title: "Noni",
    siteName: "Noni",
    description:
      "The purpose of the Noni app is to help brands run creator content programs with automatic queues, recording, approval, and posting.",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-deep">
          About
        </p>
        <h1 id="app-name" className="display mt-3 text-5xl font-semibold text-ink">
          Noni
        </h1>
        <p className="mt-6 text-[17px] leading-relaxed text-ink-soft">
          The purpose of the Noni app is to help brands run creator content programs. Noni
          fills creator queues from trends, lets creators record video and photo posts in the
          mobile app, lets admins approve submissions once on the web, then edits, posts, and
          tracks the work automatically.
        </p>
        <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">
          Noni is the product name for this application. Brands use Noni admin on the web.
          Creators use the Noni mobile app.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 text-[15px] font-semibold">
          <Link href="/" className="text-accent-deep">
            Home
          </Link>
          <Link href="/privacy" className="text-accent-deep">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-accent-deep">
            Terms of Service
          </Link>
          <Link href="/login" className="text-accent-deep">
            Login
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

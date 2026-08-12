import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Noni",
  description: "Automated UGC Content Submissions.",
  applicationName: "Noni",
  openGraph: {
    title: "Noni",
    siteName: "Noni",
    description: "Automated UGC Content Submissions.",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <h1 id="app-name" className="display text-5xl font-semibold text-ink">
          Noni
        </h1>
        <p className="mt-6 text-[17px] leading-relaxed text-ink-soft">
          Automated UGC Content Submissions.
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

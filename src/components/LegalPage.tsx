import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <article className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <Link href="/" className="text-sm font-semibold text-accent-deep">
          ← Back to Noni
        </Link>
        <h1 className="display mt-6 text-4xl font-semibold text-ink md:text-5xl">
          {title}
        </h1>
        <div className="prose-legal mt-10 space-y-4 text-[15px] leading-relaxed text-ink-soft">
          {children}
        </div>
      </article>
      <Footer />
    </div>
  );
}

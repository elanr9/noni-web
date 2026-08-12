"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WaitlistModal } from "@/components/WaitlistModal";

export default function HomePage() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <Navbar />

      <main className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-24 pt-16 text-center md:px-8 md:pb-32 md:pt-24">
        <h1 className="display text-[48px] font-semibold leading-[0.95] text-ink md:text-[76px]">
          noni app
        </h1>
        <p className="display mt-4 max-w-[22ch] text-[26px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink-soft md:max-w-none md:text-[42px]">
          Automated UGC Content Submissions
        </p>
        <button
          type="button"
          onClick={() => setWaitlistOpen(true)}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-accent-deep"
        >
          Join waitlist
          <ArrowRight className="h-4 w-4" />
        </button>
      </main>

      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />

      <Footer />
    </div>
  );
}

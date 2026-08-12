"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroPhone } from "@/components/HeroPhone";
import { WaitlistModal } from "@/components/WaitlistModal";

export default function HomePage() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <Navbar />

      <main className="overflow-hidden">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center px-4 py-12 text-center lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-10 lg:py-16 lg:text-left">
          <div className="flex w-full max-w-xl flex-col items-center lg:items-start">
            <h1 className="display text-[40px] font-semibold leading-[0.95] text-ink md:text-[56px]">
              noni app
            </h1>
            <p className="display mt-3 max-w-[22ch] text-[22px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink-soft md:max-w-none md:text-[32px]">
              Automated UGC Content Submissions
            </p>
            <p className="mt-2.5 text-[14px] font-medium text-muted md:text-[15px]">
              Coming soon to the App Store!
            </p>
            <button
              type="button"
              onClick={() => setWaitlistOpen(true)}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-[14px] font-bold text-white transition hover:bg-accent-deep"
            >
              Join waitlist
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-10 shrink-0 lg:mt-0 lg:mb-[-48px]">
            <HeroPhone />
          </div>
        </div>
      </main>

      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />

      <Footer />
    </div>
  );
}

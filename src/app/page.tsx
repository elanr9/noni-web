"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WaitlistModal } from "@/components/WaitlistModal";

export default function HomePage() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <Navbar />

      <main className="overflow-hidden">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center px-4 py-16 text-center lg:flex-row lg:items-center lg:gap-16 lg:px-10 lg:py-24 lg:text-left">
          <div className="flex w-full flex-col items-center lg:w-[55%] lg:items-start">
            <h1 className="display text-[48px] font-semibold leading-[0.95] text-ink md:text-[76px]">
              noni app
            </h1>
            <p className="display mt-4 max-w-[22ch] text-[26px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink-soft md:max-w-none md:text-[42px]">
              Automated UGC Content Submissions
            </p>
            <p className="mt-3 text-[15px] font-medium text-muted md:text-[17px]">
              Coming soon to the App Store!
            </p>
            <button
              type="button"
              onClick={() => setWaitlistOpen(true)}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-accent-deep"
            >
              Join waitlist
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-12 w-[320px] shrink-0 lg:mt-0 lg:mb-[-80px] lg:w-[45%] lg:max-w-[400px]">
            <Image
              src="/brand/hero-phone.png"
              alt="Noni app submissions screen"
              width={402}
              height={874}
              priority
              className="mx-auto h-auto w-full object-contain"
            />
          </div>
        </div>
      </main>

      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />

      <Footer />
    </div>
  );
}

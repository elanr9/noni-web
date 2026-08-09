"use client";

import { motion } from "framer-motion";

export function PhoneMock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1], delay: 0.15 }}
      className="relative mx-auto w-[280px] md:w-[320px]"
    >
      <div className="phone-glow absolute inset-6 rounded-[40px] bg-accent/20 blur-2xl" />
      <div className="relative overflow-hidden rounded-[42px] border border-white/70 bg-ink phone-glow">
        <div className="absolute left-1/2 top-3 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-black" />
        <div className="bg-gradient-to-b from-[#1a2330] to-[#0b0f14] px-5 pb-6 pt-12 text-white">
          <div className="text-[13px] font-medium text-white/55">Today</div>
          <div className="display mt-1 text-[28px] font-semibold leading-none">
            3 posts ready
          </div>
          <div className="mt-5 space-y-3">
            {[
              { title: "Locker room mic drop", meta: "Video · 0:18", tone: "Record" },
              { title: "Campus day carousel", meta: "Photos · 5 slides", tone: "Review" },
              { title: "Nil deal tip", meta: "Video · 0:22", tone: "Approved" },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[15px] font-semibold">{item.title}</div>
                    <div className="mt-1 text-[12px] text-white/50">{item.meta}</div>
                  </div>
                  <span className="rounded-full bg-accent/20 px-2.5 py-1 text-[11px] font-semibold text-[#9ad8ff]">
                    {item.tone}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-accent px-4 py-3.5 text-center text-[15px] font-bold text-white">
            Open next task
          </div>
        </div>
      </div>
    </motion.div>
  );
}

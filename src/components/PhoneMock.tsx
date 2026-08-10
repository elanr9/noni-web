"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const PHONE_ASPECT = 1170 / 2532;

type PhoneMockProps = {
  src?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  delay?: number;
};

export function PhoneMock({
  src = "/brand/creator-home-hero.png",
  alt = "Noni creator app home screen",
  className,
  priority = true,
  delay = 0.15,
}: PhoneMockProps) {
  const rootClass = [
    "relative mx-auto w-[280px] md:w-[340px]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1], delay }}
      className={rootClass}
    >
      <div className="phone-glow absolute inset-6 rounded-[44px] bg-accent/20 blur-2xl" />
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{
          duration: 4.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative overflow-hidden rounded-[44px] border border-white/70 bg-black phone-glow"
      >
        <div
          className="relative w-full"
          style={{ aspectRatio: PHONE_ASPECT }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            className="object-cover object-top"
            sizes="(max-width: 768px) 280px, 340px"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

type DualPhoneMockProps = {
  className?: string;
  primaryDelay?: number;
  secondaryDelay?: number;
};

export function DualPhoneMock({
  className,
  primaryDelay = 0.15,
  secondaryDelay = 0.3,
}: DualPhoneMockProps) {
  const rootClass = ["relative mx-auto", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <div className="relative flex items-end justify-center gap-3 md:gap-5">
        <PhoneMock
          src="/brand/creator-home-hero.png"
          alt="Noni creator app home screen"
          priority
          delay={primaryDelay}
          className="relative z-10 w-[260px] md:w-[320px]"
        />
        <PhoneMock
          src="/brand/admin-review-hero.png"
          alt="Noni admin review screen"
          priority={false}
          delay={secondaryDelay}
          className="relative z-0 w-[240px] -translate-y-2 md:w-[300px] md:-translate-y-4"
        />
      </div>
    </div>
  );
}

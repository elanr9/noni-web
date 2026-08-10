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
  float?: boolean;
};

export function PhoneMock({
  src = "/brand/creator-home-hero.png",
  alt = "Noni creator app home screen",
  className,
  priority = true,
  delay = 0.15,
  float = false,
}: PhoneMockProps) {
  const rootClass = [
    "relative mx-auto w-[min(72vw,260px)] md:w-[340px]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 0.61, 0.36, 1], delay }}
      className={rootClass}
    >
      <motion.div
        animate={float ? { y: [0, -6, 0] } : undefined}
        transition={
          float
            ? {
                duration: 5.2,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : undefined
        }
        className="relative overflow-hidden rounded-[36px] border border-line bg-black md:rounded-[44px]"
      >
        <div className="relative w-full" style={{ aspectRatio: PHONE_ASPECT }}>
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            className="object-cover object-top"
            sizes="(max-width: 768px) 72vw, 340px"
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
  const rootClass = ["relative mx-auto w-full max-w-[340px] md:max-w-none", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      <div className="relative flex items-end justify-center">
        <PhoneMock
          src="/brand/creator-home-hero.png"
          alt="Noni creator app home screen"
          priority
          delay={primaryDelay}
          float={false}
          className="relative z-10 w-[48%] max-w-[168px] md:w-[320px] md:max-w-none"
        />
        <PhoneMock
          src="/brand/admin-review-hero.png"
          alt="Noni admin review screen"
          priority={false}
          delay={secondaryDelay}
          float={false}
          className="relative z-0 -ml-[18%] w-[44%] max-w-[154px] -translate-y-1 md:-ml-0 md:w-[300px] md:max-w-none md:translate-y-[-16px] md:ml-5"
        />
      </div>
    </div>
  );
}

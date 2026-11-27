"use client";

import { Check } from "lucide-react";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

/* The reward for finishing something: a card springs into the middle of the
   screen, its check pops, and confetti is thrown from behind it. Any client
   code calls celebrate("Stripe connected!"); CelebrationHost (mounted once in
   the root layout) shows them one at a time. */

const EVENT = "noni:celebrate";
const SHOWN_MS = 2600;
const COLORS = ["#1BA6EE", "#1F8F5F", "#F5B83D", "#F0679B", "#7C6BF2", "#4FBAF2"];

export function celebrate(title: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: title }));
}

/** Confetti thrown outward from the middle of the card, then falling. */
function Confetti() {
  const count = 44;
  return (
    <span aria-hidden className="pointer-events-none absolute left-1/2 top-[42%] h-0 w-0">
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (i % 2 ? 0.21 : 0);
        const far = 150 + ((i * 53) % 150);
        const strip = i % 3 !== 0;
        return (
          <span
            key={i}
            className="absolute"
            style={
              {
                left: -4,
                top: -4,
                width: strip ? 7 : 8,
                height: strip ? 12 : 8,
                borderRadius: strip ? 2 : 999,
                backgroundColor: COLORS[i % COLORS.length],
                "--dx": `${Math.round(Math.cos(angle) * far)}px`,
                "--dy": `${Math.round(Math.sin(angle) * far * 0.8 - 40)}px`,
                "--spin": `${(i % 2 ? 1 : -1) * (240 + ((i * 37) % 300))}deg`,
                animation: `om-confetti ${1100 + (i % 5) * 140}ms var(--ease-om) ${(i % 6) * 22}ms both`,
              } as CSSProperties
            }
          />
        );
      })}
    </span>
  );
}

function CelebrationCard({ title, onDone }: { title: string; onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const out = setTimeout(() => setLeaving(true), SHOWN_MS);
    const done = setTimeout(onDone, SHOWN_MS + 220);
    return () => {
      clearTimeout(out);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div
      role="status"
      onClick={onDone}
      className={`fixed inset-0 z-[150] flex items-center justify-center px-6 transition-opacity duration-200 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative">
        <Confetti />
        <div className="relative flex flex-col items-center gap-4 border border-line bg-white px-11 pb-8 pt-9 shadow-raised rounded-[28px] [animation:om-celebrate_560ms_var(--ease-om-spring)_both]">
          <span className="relative inline-flex h-[72px] w-[72px] items-center justify-center bg-green rounded-pill [animation:om-check_520ms_var(--ease-om-spring)_120ms_both]">
            <Check size={36} strokeWidth={3.2} className="relative text-white" />
          </span>
          <span className="max-w-[420px] text-center text-[22px] font-bold leading-tight tracking-[-0.4px] text-ink [animation:om-rise_320ms_var(--ease-om)_200ms_both]">
            {title}
          </span>
        </div>
      </div>
    </div>
  );
}

export function CelebrationHost() {
  const [queue, setQueue] = useState<{ id: number; title: string }[]>([]);

  useEffect(() => {
    let next = 0;
    const onCelebrate = (e: Event) => {
      const title = (e as CustomEvent<string>).detail;
      if (!title) return;
      setQueue((q) => [...q, { id: next++, title }]);
    };
    window.addEventListener(EVENT, onCelebrate);
    return () => window.removeEventListener(EVENT, onCelebrate);
  }, []);

  const dismiss = useCallback(() => setQueue((q) => q.slice(1)), []);
  const current = queue[0];
  if (!current) return null;
  /* Portal to document.body: page containers animate with a transform, which
     would otherwise trap position:fixed. */
  return createPortal(
    <CelebrationCard key={current.id} title={current.title} onDone={dismiss} />,
    document.body,
  );
}

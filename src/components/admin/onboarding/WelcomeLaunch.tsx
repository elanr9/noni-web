import type { CSSProperties } from "react";

/* The welcome screen's opening, a real launch: the Noni rocket pops in near
   the bottom left corner, rumbles on the pad for a beat, then lifts off slow
   and keeps speeding up until it is gone past the top right. As it leaves, a
   little confetti drifts down from the top. CSS only, GPU transforms, so it
   runs from the first paint. Hidden for people who ask for reduced motion. */

/** The whole launch, pop in to gone. */
const FLY_MS = 3200;
/** When the rocket is off screen and the confetti starts. */
const GONE_MS = 2950;
const ROCKET = 128;
const CONFETTI = ["#3B82F6", "#60A5FA", "#22C55E", "#FBBF24", "#F472B6", "#A78BFA"];
const PIECES = 34;

/* Fixed spread, so the server and the browser draw the same thing. */
const piece = (i: number) => {
  const r = (n: number) => {
    const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
    return Math.round((x - Math.floor(x)) * 1000) / 1000;
  };
  return {
    left: 2 + r(1) * 96,
    delay: GONE_MS + r(2) * 500,
    fall: 1700 + r(3) * 1100,
    sway: (r(4) - 0.5) * 120,
    spin: (r(5) > 0.5 ? 1 : -1) * (360 + r(6) * 360),
    w: 6 + Math.round(r(7) * 4),
    round: r(8) > 0.7,
    color: CONFETTI[i % CONFETTI.length],
  };
};

export function WelcomeLaunch() {
  return (
    <div aria-hidden className="welcome-launch pointer-events-none fixed inset-0 z-20 overflow-hidden">
      <style>{`
        @keyframes welcome-rocket {
          0% { transform: translate3d(7vw, calc(100vh - 300px), 0) scale(0.5); opacity: 0;
               animation-timing-function: cubic-bezier(.2,.9,.3,1.35); }
          9% { transform: translate3d(7vw, calc(100vh - 300px), 0) scale(1); opacity: 1; }
          /* On the pad, then lift off: slow at first, faster and faster. */
          30% { transform: translate3d(7vw, calc(100vh - 300px), 0) scale(1);
                animation-timing-function: cubic-bezier(.42,0,.78,.5); }
          100% { transform: translate3d(calc(100vw + 160px), -360px, 0) scale(1.08); opacity: 1; }
        }
        @keyframes welcome-rumble {
          0%, 100% { transform: translate3d(0, 0, 0); }
          25% { transform: translate3d(-1.5px, 1px, 0); }
          75% { transform: translate3d(1.5px, -1px, 0); }
        }
        @keyframes welcome-puff {
          0% { transform: scale(0.3); opacity: 0; }
          30% { opacity: 0.7; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes welcome-confetti {
          0% { transform: translate3d(0, -24px, 0) rotate(0deg); opacity: 0; }
          8% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate3d(var(--sway), 104vh, 0) rotate(var(--spin)); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) { .welcome-launch { display: none; } }
      `}</style>

      <span
        className="absolute left-0 top-0 block will-change-transform"
        style={{ animation: `welcome-rocket ${FLY_MS}ms linear both` }}
      >
        <span
          className="relative block"
          style={{ animation: "welcome-rumble 80ms linear 280ms 8" }}
        >
          {/* Exhaust puffs off the tail, puffing the whole way. */}
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="absolute rounded-full bg-blue-200"
              style={{
                width: 26 - i * 5,
                height: 26 - i * 5,
                left: -4 - i * 24,
                top: ROCKET - 22 + i * 24,
                animation: `welcome-puff 520ms ease-out ${300 + i * 110}ms infinite`,
              }}
            />
          ))}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/noni-logo.svg" alt="" width={ROCKET} height={ROCKET} className="relative block" />
        </span>
      </span>

      {Array.from({ length: PIECES }, (_, i) => {
        const p = piece(i);
        return (
          <span
            key={i}
            className="absolute top-0 block will-change-transform"
            style={
              {
                left: `${p.left}%`,
                width: p.w,
                height: p.round ? p.w : p.w * 1.6,
                borderRadius: p.round ? "999px" : "2px",
                backgroundColor: p.color,
                "--sway": `${p.sway}px`,
                "--spin": `${p.spin}deg`,
                animation: `welcome-confetti ${p.fall}ms cubic-bezier(.25,.6,.45,1) ${p.delay}ms both`,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

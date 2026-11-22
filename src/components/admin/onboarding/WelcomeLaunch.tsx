import type { CSSProperties } from "react";

/* The welcome screen's opening: the Noni rocket comes in from just past the
   bottom left corner already flying, and sweeps up and away past the top
   right on one smooth curve, speeding up the whole way. Across and up run
   as two separate eases (up eases in harder), which bends the path into a
   rising curve; the nose turns with it. As it leaves, a little confetti
   drifts down from the top. CSS only, GPU transforms, from the first paint.
   Hidden for people who ask for reduced motion. */

/** The whole flight, corner to corner. */
const FLY_MS = 2400;
/** When the rocket is off screen and the confetti starts. */
const GONE_MS = 2150;
const ROCKET = 84;
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
        @keyframes welcome-across {
          from { transform: translate3d(-${ROCKET + 40}px, 0, 0); }
          to { transform: translate3d(calc(100vw + 40px), 0, 0); }
        }
        @keyframes welcome-up {
          from { transform: translate3d(0, calc(100vh - 6px), 0); }
          to { transform: translate3d(0, -30vh, 0); }
        }
        @keyframes welcome-turn {
          from { transform: rotate(24deg); }
          to { transform: rotate(-12deg); }
        }
        @keyframes welcome-confetti {
          0% { transform: translate3d(0, -24px, 0) rotate(0deg); opacity: 0; }
          8% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate3d(var(--sway), 104vh, 0) rotate(var(--spin)); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) { .welcome-launch { display: none; } }
      `}</style>

      {/* Across (eases in gently), up (eases in harder), and the nose turning
          from flat to steep: together, a rising, accelerating curve. */}
      <span
        className="absolute left-0 top-0 block will-change-transform"
        style={{ animation: `welcome-across ${FLY_MS}ms cubic-bezier(.38,.1,.7,.62) both` }}
      >
        <span
          className="block will-change-transform"
          style={{ animation: `welcome-up ${FLY_MS}ms cubic-bezier(.5,.14,.8,.46) both` }}
        >
          <span
            className="relative block will-change-transform"
            style={{ animation: `welcome-turn ${FLY_MS}ms cubic-bezier(.5,0,.8,.4) both` }}
          >
            {/* A short trail of puffs off the tail. */}
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="absolute rounded-full bg-blue-200"
                style={{
                  width: 14 - i * 3,
                  height: 14 - i * 3,
                  left: -2 - i * 15,
                  top: ROCKET - 12 + i * 15,
                  opacity: 0.8 - i * 0.22,
                }}
              />
            ))}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/noni-logo.svg" alt="" width={ROCKET} height={ROCKET} className="relative block" />
          </span>
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

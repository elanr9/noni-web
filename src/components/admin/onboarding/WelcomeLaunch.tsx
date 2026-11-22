import type { CSSProperties } from "react";

/* The welcome screen's opening: the Noni rocket launches once, in one
   straight smooth line from off the bottom left corner to past the top right
   one, and as it leaves a little confetti drifts down from the top. CSS only,
   GPU transforms, so it runs from the first paint without waiting on
   anything. Hidden for people who ask for reduced motion. */

const FLY_MS = 1300;
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
    delay: FLY_MS - 150 + r(2) * 500,
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
          from { transform: translate3d(-160px, calc(100vh + 40px), 0); }
          to { transform: translate3d(calc(100vw + 60px), -220px, 0); }
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
        style={{ animation: `welcome-rocket ${FLY_MS}ms cubic-bezier(.35,0,.65,1) both` }}
      >
        {/* A short fading trail of puffs behind the tail. */}
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute rounded-full bg-blue-300"
            style={{
              width: 12 - i * 3,
              height: 12 - i * 3,
              left: -6 - i * 18,
              top: 64 + i * 18,
              opacity: 0.55 - i * 0.15,
            }}
          />
        ))}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/noni-logo.svg" alt="" width={72} height={72} className="block" />
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

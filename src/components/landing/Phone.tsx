import Image from "next/image";

/* A real Noni screen in an iPhone: a dark metal edge with side buttons, a
   black bezel, and a screen with the status bar (9:41, the Dynamic Island,
   signal and battery) above the screenshot and the home bar over it.
   Everything is sized in percentages and container units so the phone keeps
   its shape at any size. By default the width is set on `className`; with
   `fitHeight` the phone takes its parent's height and works out its own
   width, so a row of phones always fits the screen. */

/** The screenshots are 780x1688; the status bar adds 92 on top. */
const SCREEN_W = 780;
const SHOT_H = 1688;
const BAR_H = 92;
/** Outer width / height: the screen plus the bezel and edge around it. */
const FRAME_ASPECT = 0.4515;

function StatusBar() {
  return (
    <div
      className="relative flex w-full shrink-0 items-center justify-between bg-[#f2f3f5] px-[8.5%] text-ink"
      style={{ aspectRatio: `${SCREEN_W} / ${BAR_H}` }}
    >
      <span className="text-[4.4cqw] font-semibold tracking-[-0.02em]">9:41</span>
      {/* Dynamic Island */}
      <span className="absolute left-1/2 top-[22%] h-[64%] w-[30%] -translate-x-1/2 rounded-full bg-black" />
      <span className="flex items-center gap-[1.4cqw]">
        <svg viewBox="0 0 18 12" className="h-[2.9cqw] w-auto" aria-hidden>
          <rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor" />
          <rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor" />
          <rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" />
        </svg>
        <svg viewBox="0 0 16 12" className="h-[2.9cqw] w-auto" aria-hidden>
          <path d="M8 2.2c2.4 0 4.6.9 6.2 2.4l1.2-1.3C13.4 1.4 10.8.4 8 .4S2.6 1.4.6 3.3l1.2 1.3C3.4 3.1 5.6 2.2 8 2.2Z" fill="currentColor" />
          <path d="M8 5.6c1.4 0 2.7.5 3.7 1.4l1.2-1.3C11.6 4.5 9.9 3.8 8 3.8S4.4 4.5 3.1 5.7L4.3 7c1-.9 2.3-1.4 3.7-1.4Z" fill="currentColor" />
          <path d="M8 9c.6 0 1.1.2 1.5.6L8 11.2 6.5 9.6C6.9 9.2 7.4 9 8 9Z" fill="currentColor" />
        </svg>
        <svg viewBox="0 0 27 12" className="h-[2.9cqw] w-auto" aria-hidden>
          <rect x="0.5" y="0.5" width="23" height="11" rx="3.2" fill="none" stroke="currentColor" strokeOpacity="0.4" />
          <rect x="2" y="2" width="20" height="8" rx="2" fill="currentColor" />
          <path d="M25 4v4c.8-.3 1.3-1.1 1.3-2S25.8 4.3 25 4Z" fill="currentColor" fillOpacity="0.45" />
        </svg>
      </span>
    </div>
  );
}

function Body({
  src,
  alt,
  priority,
  sizes,
  fill,
}: {
  src: string;
  alt: string;
  priority: boolean;
  sizes: string;
  fill: boolean;
}) {
  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden rounded-[12%/5.6%] bg-[#f2f3f5]"
      style={{ containerType: "inline-size" }}
    >
      <StatusBar />
      {fill ? (
        <div className="relative min-h-0 flex-1">
          <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover object-top" />
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={SCREEN_W}
          height={SHOT_H}
          priority={priority}
          sizes={sizes}
          className="block h-auto w-full"
        />
      )}
      {/* Home bar */}
      <span className="pointer-events-none absolute bottom-[0.9%] left-1/2 h-[0.55%] w-[34%] -translate-x-1/2 rounded-full bg-black/80" />
    </div>
  );
}

/** The metal edge, side buttons and black bezel around the screen. */
function Frame({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`relative shrink-0 rounded-[15%/7%] bg-[#2b2d31] p-[1.1%] shadow-[0_30px_60px_-22px_rgba(15,23,32,0.45),0_10px_24px_-10px_rgba(15,23,32,0.25),inset_0_0_0_1px_rgba(255,255,255,0.14)] ${className}`}
      style={style}
    >
      {/* Side buttons: action and volume on the left, power on the right. */}
      <span className="absolute -left-[1.3%] top-[17%] h-[4%] w-[1.3%] rounded-l-[3px] bg-[#2b2d31]" />
      <span className="absolute -left-[1.3%] top-[24%] h-[7.5%] w-[1.3%] rounded-l-[3px] bg-[#2b2d31]" />
      <span className="absolute -left-[1.3%] top-[33%] h-[7.5%] w-[1.3%] rounded-l-[3px] bg-[#2b2d31]" />
      <span className="absolute -right-[1.3%] top-[27%] h-[11%] w-[1.3%] rounded-r-[3px] bg-[#2b2d31]" />
      <div className="h-full w-full rounded-[14%/6.5%] bg-black p-[2.3%]">{children}</div>
    </div>
  );
}

export function Phone({
  src,
  alt,
  className = "",
  priority = false,
  fitHeight = false,
  sizes = "(min-width: 1024px) 300px, 60vw",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fitHeight?: boolean;
  sizes?: string;
}) {
  if (fitHeight) {
    return (
      <Frame className={`h-full max-w-full ${className}`} style={{ aspectRatio: FRAME_ASPECT }}>
        <Body src={src} alt={alt} priority={priority} sizes={sizes} fill />
      </Frame>
    );
  }
  return (
    <Frame className={className}>
      <Body src={src} alt={alt} priority={priority} sizes={sizes} fill={false} />
    </Frame>
  );
}

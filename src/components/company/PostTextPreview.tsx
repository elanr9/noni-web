import localFont from "next/font/local";

import { OVERLAY_TEXT_SPEC, overlayBoxFill, overlayTextContrast } from "@/lib/overlay-text";

/* The same TikTok Sans instance the app and the render draw with. */
const tiktokSans = localFont({
  src: "../../app/fonts/TikTokSans-Bubble.ttf",
  weight: "600",
  display: "swap",
  preload: false,
});

/** On-screen text as a post draws it: the company color as a tinted bubble
    with deep letters, or the classic white outlined caption with no theme. */
export function PostTextPreview({
  text,
  color,
  fontSize,
}: {
  text: string;
  /** The picked theme color, or null for the classic look. */
  color: string | null;
  fontSize: number;
}) {
  if (color === null) {
    const spec = OVERLAY_TEXT_SPEC.classic;
    return (
      <span
        className={tiktokSans.className}
        style={{
          fontSize,
          fontWeight: spec.fontWeight,
          lineHeight: spec.lineHeight,
          color: "#FFFFFF",
          textAlign: "center",
          /* Half of a centered stroke hides under the fill, so twice the
             outside width leaves the spec's stroke showing. */
          WebkitTextStroke: `${fontSize * spec.strokeRatio * 2}px #000000`,
          paintOrder: "stroke fill",
        }}
      >
        {text}
      </span>
    );
  }
  const spec = OVERLAY_TEXT_SPEC.bubble;
  return (
    <span
      className={tiktokSans.className}
      style={{
        fontSize,
        fontWeight: spec.fontWeight,
        lineHeight: spec.lineHeight + 2 * spec.padY,
        textAlign: "center",
      }}
    >
      <span
        style={{
          backgroundColor: overlayBoxFill(color),
          color: overlayTextContrast(color),
          padding: `${spec.padY}em ${spec.padX}em`,
          borderRadius: `${spec.radius}em`,
          boxDecorationBreak: "clone",
          WebkitBoxDecorationBreak: "clone",
        }}
      >
        {text}
      </span>
    </span>
  );
}

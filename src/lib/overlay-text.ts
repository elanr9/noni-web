/* How on-screen text is drawn on a post, for previews on the web. Mirrors
   OVERLAY_TEXT_SPEC, overlayBoxFill and overlayTextContrast in the app
   (noni/lib/overlay-boxes.ts) and the render (noni/supabase/functions/
   _shared/renderAdapter.ts). Change all three together. Every length is a
   multiple of the font size. */

export const OVERLAY_TEXT_SPEC = {
  /** Bare letters: white TikTok Sans with a black stroke outside the letter. */
  classic: { fontWeight: 600, lineHeight: 1.1, strokeRatio: 0.06 },
  /** Text with background: a tinted bubble per line with deep same hue letters. */
  bubble: {
    fontWeight: 600,
    lineHeight: 1.15,
    padX: 0.35,
    padY: 0.12,
    radius: 0.25,
    fill: { saturation: 0.84, lightness: 0.73 },
    ink: { saturation: 1, lightness: 0.28 },
    /** Bubble and letter colors measured off TikTok, keyed by the pick's hue. */
    pairs: [{ hue: 210, fill: "#80B6F4", ink: "#000590" }],
    pairHueTolerance: 25,
  },
} as const;

/** Below this the pick is a grey and keeps its own tone. */
const NEUTRAL_SATURATION = 0.12;

function toHsl(hex: string): { h: number; s: number; l: number } | null {
  const raw = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return null;
  const r = parseInt(raw.slice(0, 2), 16) / 255;
  const g = parseInt(raw.slice(2, 4), 16) / 255;
  const b = parseInt(raw.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: (((h * 60) % 360) + 360) % 360, s, l };
}

function fromHsl(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const sector = Math.floor(h / 60) % 6;
  const rgb: [number, number, number][] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ];
  const [r, g, b] = rgb[sector] ?? [0, 0, 0];
  const byte = (n: number) =>
    Math.max(0, Math.min(255, Math.round((n + m) * 255)))
      .toString(16)
      .padStart(2, "0");
  return `#${byte(r)}${byte(g)}${byte(b)}`;
}

function measuredPair(hue: number): { fill: string; ink: string } | null {
  const { pairs, pairHueTolerance } = OVERLAY_TEXT_SPEC.bubble;
  const distance = (a: number, b: number) => {
    const d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
  };
  return pairs.find((p) => distance(p.hue, hue) <= pairHueTolerance) ?? null;
}

/** The bubble a picked color becomes on a post: the hue lifted to a light tint. */
export function overlayBoxFill(pick: string): string {
  const hsl = toHsl(pick);
  if (hsl === null) return pick;
  if (hsl.s < NEUTRAL_SATURATION) return hsl.l >= 0.5 ? "#FFFFFF" : "#000000";
  const pair = measuredPair(hsl.h);
  if (pair) return pair.fill;
  const { saturation, lightness } = OVERLAY_TEXT_SPEC.bubble.fill;
  return fromHsl(hsl.h, Math.max(hsl.s, saturation), lightness);
}

/** The letters on that bubble: the same hue driven deep and fully saturated. */
export function overlayTextContrast(pick: string): string {
  const hsl = toHsl(pick);
  if (hsl === null) return "#0F1720";
  if (hsl.s < NEUTRAL_SATURATION) return hsl.l >= 0.5 ? "#000000" : "#FFFFFF";
  const pair = measuredPair(hsl.h);
  if (pair) return pair.ink;
  const { saturation, lightness } = OVERLAY_TEXT_SPEC.bubble.ink;
  return fromHsl(hsl.h, saturation, lightness);
}

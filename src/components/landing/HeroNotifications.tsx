"use client";

/* eslint-disable @next/next/no-img-element -- a small fixed icon inside each card. */
import { useEffect, useRef, useState, type CSSProperties } from "react";

/* The notifications around the landing headline, the way the Inkbound
   landing does it: the stage opens empty, cards land one at a time a second
   or so apart until four are up, then every few seconds the oldest one pops
   out and the next one lands somewhere else. Each spot is measured from the
   hero, so a card sits only to the left or right of the headline, the
   subtitle or the buttons, never above or below them, and never stacks on
   another card. Phones get the same notifications one
   at a time under the buttons. Everything Noni does, for both sides, with
   the whole line always showing. */

export const HERO_NOTES: string[] = [
  "Video approved! Just posted to TikTok and Instagram",
  "Your post is edited and ready",
  "Your views and sales both went up this week!",
  "Jake sent a new video for review",
  "New brief ready to film",
  "Your post just hit 10k views",
  "3 new sign ups from Trav's post",
  "You got paid $45 for 2 posts",
  "Noni wrote 4 new briefs from your brand",
  "Hoku started filming your brief",
  "Your post brought in $320 in sales",
  "All 6 creators paid this week",
  "5 creators applied to your campaign",
  "Captions added and cut to your best takes",
  "Your top post brought in $1.4k in sales",
  "Posted on time for all 3 creators",
];

const ICON = "/brand/app-icon.png";

/** Card box and the clearances it keeps; the width matches .hn-card below, the height is a two line card. */
const CARD_W = 280;
const CARD_H = 84;
const EDGE_PX = 16;
const GAP_PX = 24;
const DRIFT_PX = 40;
const BAND_PX = 96;
const SLOT_COUNT = 4;

/** Delay before the first card, then a new card every EVERY_MS (the opening four, then each swap), and the exit. */
const FIRST_MS = 600;
const EVERY_MS = 2000;
const OUT_MS = 300;
/** Phones show one card at a time, so each stays up long enough to read. */
const DOCK_HOLD_MS = 3000;

/** A spot a card can sit in, beside the hero content, with its top-left in hero pixels. */
type Zone = { side: "l" | "r"; top: number; left: number; span: number };
type Slot = { note: number | null; zone: number; top: number; left: number; out: boolean; key: number };
type Box = { top: number; bottom: number; left: number; right: number };

/** The rendered lines of a text block, as boxes relative to the hero. */
function textLines(el: Element, origin: DOMRect): Box[] {
  const range = document.createRange();
  range.selectNodeContents(el);
  const lines: Box[] = [];
  for (const r of Array.from(range.getClientRects())) {
    if (r.width === 0 || r.height === 0) continue;
    const box = { top: r.top - origin.top, bottom: r.bottom - origin.top, left: r.left - origin.left, right: r.right - origin.left };
    const line = lines.find((l) => Math.abs((l.top + l.bottom) / 2 - (box.top + box.bottom) / 2) < r.height / 2);
    if (line) {
      line.left = Math.min(line.left, box.left);
      line.right = Math.max(line.right, box.right);
      line.top = Math.min(line.top, box.top);
      line.bottom = Math.max(line.bottom, box.bottom);
    } else lines.push(box);
  }
  return lines;
}

/**
 * Every spot where a whole card fits in the white space beside the hero
 * content: next to each headline and subtitle line, and in bands down the
 * buttons and the creator link. Text is marked data-hero-text, other blocks
 * data-hero-block.
 */
function measureZones(hero: HTMLElement): Zone[] {
  const origin = hero.getBoundingClientRect();
  const width = origin.width;
  const box = (el: Element): Box => {
    const r = el.getBoundingClientRect();
    return { top: r.top - origin.top, bottom: r.bottom - origin.top, left: r.left - origin.left, right: r.right - origin.left };
  };
  const lines = Array.from(hero.querySelectorAll("[data-hero-text]")).flatMap((el) => textLines(el, origin));
  const blocks = Array.from(hero.querySelectorAll("[data-hero-block]")).map(box);
  const obstacles = [...lines, ...blocks];

  const tops: number[] = lines.map((l) => (l.top + l.bottom) / 2 - CARD_H / 2);
  for (const b of blocks) {
    const bands = Math.max(1, Math.floor((b.bottom - b.top) / BAND_PX));
    const bandH = (b.bottom - b.top) / bands;
    for (let i = 0; i < bands; i++) tops.push(b.top + i * bandH + (bandH - CARD_H) / 2);
  }

  const contentTop = Math.min(...obstacles.map((o) => o.top));
  const contentBottom = Math.max(...obstacles.map((o) => o.bottom));
  const zones: Zone[] = [];
  for (const raw of tops) {
    const top = Math.round(raw);
    if (top < EDGE_PX || top + CARD_H > origin.height - EDGE_PX) continue;
    // Only beside the content: never above the headline or below the last line.
    if (top < contentTop - CARD_H / 2 || top + CARD_H > contentBottom + CARD_H / 2) continue;
    const hit = obstacles.filter((o) => o.bottom > top - EDGE_PX && o.top < top + CARD_H + EDGE_PX);
    if (hit.length === 0) continue;
    const gutterL = Math.min(...hit.map((o) => o.left));
    const gutterR = Math.min(...hit.map((o) => width - o.right));
    if (gutterL >= CARD_W + EDGE_PX + GAP_PX) {
      zones.push({ side: "l", top, left: Math.round(gutterL - GAP_PX - CARD_W), span: gutterL - EDGE_PX - GAP_PX - CARD_W });
    }
    if (gutterR >= CARD_W + EDGE_PX + GAP_PX) {
      zones.push({ side: "r", top, left: Math.round(width - gutterR + GAP_PX), span: gutterR - EDGE_PX - GAP_PX - CARD_W });
    }
  }
  return zones;
}

/** A shuffled deck of notes after the opener, reshuffled when it runs out, never repeating one still on screen. */
function makeDealer() {
  let deck: number[] = [];
  const recent: number[] = [];
  return (first: boolean): number => {
    let note: number;
    if (first) note = 0;
    else {
      if (deck.length === 0) {
        deck = HERO_NOTES.map((_, i) => i).slice(1);
        for (let i = deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        deck = [...deck.filter((i) => !recent.includes(i)), ...deck.filter((i) => recent.includes(i))];
      }
      note = deck.shift() as number;
    }
    recent.push(note);
    if (recent.length > SLOT_COUNT) recent.shift();
    return note;
  };
}

/** Wide screens: up to four cards in the white space around the headline. Place inside the hero section. */
export function HeroPings() {
  const ref = useRef<HTMLUListElement>(null);
  const [slots, setSlots] = useState<Slot[]>(() =>
    Array.from({ length: SLOT_COUNT }, (_, i) => ({ note: null, zone: -1, top: 0, left: 0, out: false, key: i })),
  );

  useEffect(() => {
    const hero = ref.current?.parentElement;
    if (!hero || !window.matchMedia("(min-width: 1024px)").matches) return;
    let zones = measureZones(hero);
    const ro = new ResizeObserver(() => {
      zones = measureZones(hero);
    });
    ro.observe(hero);

    const place = (zone: Zone): Pick<Slot, "top" | "left"> => {
      const drift = Math.min(zone.span, Math.round(Math.random() * DRIFT_PX));
      return { top: zone.top, left: zone.side === "l" ? zone.left - drift : zone.left + drift };
    };
    const pickZone = (taken: number[]): number => {
      const free = zones
        .map((_, i) => i)
        .filter((i) => !taken.includes(i))
        // Never directly above or below another card on the same side.
        .filter((i) =>
          taken.every(
            (t) => t < 0 || t >= zones.length || zones[t].side !== zones[i].side || Math.abs(zones[t].top - zones[i].top) >= CARD_H + EDGE_PX,
          ),
        );
      return free.length > 0 ? free[Math.floor(Math.random() * free.length)] : -1;
    };
    const deal = makeDealer();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const still = window.setTimeout(() => {
        const taken: number[] = [];
        setSlots((prev) =>
          prev.map((s, i) => {
            const zone = pickZone(taken);
            if (zone < 0) return s;
            taken.push(zone);
            return { ...s, note: deal(i === 0), zone, ...place(zones[zone]) };
          }),
        );
      }, 0);
      return () => {
        window.clearTimeout(still);
        ro.disconnect();
      };
    }

    let slot = 0;
    let key = SLOT_COUNT;
    let vacated = -1;
    let opened = false;
    let timer: number | undefined;

    const land = (target: number) => {
      const note = deal(!opened);
      opened = true;
      const freshKey = key++;
      setSlots((prev) => {
        const zone = pickZone([...prev.map((s) => s.zone), vacated]);
        if (zone < 0) return prev.map((s, i) => (i === target ? { ...s, note: null, zone: -1, out: false } : s));
        return prev.map((s, i) => (i === target ? { note, zone, ...place(zones[zone]), out: false, key: freshKey } : s));
      });
    };
    const rotate = () => {
      const target = slot;
      slot = (slot + 1) % SLOT_COUNT;
      setSlots((prev) => {
        vacated = prev[target].zone;
        return prev.map((s, i) => (i === target ? { ...s, out: true } : s));
      });
      timer = window.setTimeout(() => {
        land(target);
        timer = window.setTimeout(rotate, EVERY_MS - OUT_MS);
      }, OUT_MS);
    };
    const open = (i: number) => {
      land(i);
      timer = i + 1 < SLOT_COUNT ? window.setTimeout(() => open(i + 1), EVERY_MS) : window.setTimeout(rotate, EVERY_MS - OUT_MS);
    };
    timer = window.setTimeout(() => {
      // Measure again once the headline has finished rising into place.
      zones = measureZones(hero);
      open(0);
    }, FIRST_MS);
    return () => {
      window.clearTimeout(timer);
      ro.disconnect();
    };
  }, []);

  return (
    <ul className="hn-stage" aria-hidden ref={ref}>
      {slots.map((s) =>
        s.note === null ? null : <NoteCard key={s.key} text={HERO_NOTES[s.note]} out={s.out} style={{ top: s.top, left: s.left }} />,
      )}
    </ul>
  );
}

/** Phones and tablets: the same notifications one at a time under the buttons: in, hold, out, next. */
export function HeroPingDock() {
  const [slot, setSlot] = useState<{ note: number; out: boolean; key: number } | null>(null);

  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    const deal = makeDealer();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const still = window.setTimeout(() => setSlot({ note: deal(true), out: false, key: 0 }), 0);
      return () => window.clearTimeout(still);
    }
    let key = 0;
    let timer: number | undefined;
    const next = () => {
      setSlot((s) => (s ? { ...s, out: true } : s));
      timer = window.setTimeout(() => {
        setSlot({ note: deal(false), out: false, key: ++key });
        timer = window.setTimeout(next, DOCK_HOLD_MS);
      }, OUT_MS);
    };
    timer = window.setTimeout(() => {
      setSlot({ note: deal(true), out: false, key: 0 });
      timer = window.setTimeout(next, DOCK_HOLD_MS);
    }, FIRST_MS + 400);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <ul className="hn-dock" aria-hidden>
      {slot ? <NoteCard key={slot.key} text={HERO_NOTES[slot.note]} out={slot.out} /> : null}
    </ul>
  );
}

function NoteCard({ text, out, style }: { text: string; out: boolean; style?: CSSProperties }) {
  return (
    <li className={`hn-card${out ? " is-out" : ""}`} style={style}>
      <img src={ICON} alt="" />
      <span>
        <b>{text}</b>
        <small>Noni · Just now</small>
      </span>
      <i />
    </li>
  );
}

/** Card look and the pop in, pop out and live dot pulse. */
export function HeroNoteStyles() {
  return (
    <style>{`
      .hn-stage { list-style: none; margin: 0; padding: 0; position: absolute; inset: 0; z-index: 2; pointer-events: none; display: none; }
      @media (min-width: 1024px) { .hn-stage { display: block; } }
      .hn-dock { list-style: none; margin: 0; padding: 0; display: flex; justify-content: center; min-height: ${CARD_H}px; }
      @media (min-width: 1024px) { .hn-dock { display: none; } }
      .hn-stage .hn-card { position: absolute; }
      .hn-card {
        width: ${CARD_W}px; min-height: 66px; display: flex; align-items: center; gap: 11px; padding: 11px 13px;
        border-radius: 16px; background: #fff; text-align: left;
        box-shadow: 0 0 0 1px rgba(15, 23, 41, 0.08), 0 10px 28px rgba(15, 23, 41, 0.09);
        animation: hn-in 0.45s cubic-bezier(0.22, 1.2, 0.36, 1) both; will-change: transform, opacity;
      }
      .hn-card.is-out { animation: hn-out 0.28s cubic-bezier(0.4, 0, 1, 1) forwards; }
      .hn-card img { flex: none; width: 38px; height: 38px; border-radius: 10px; }
      .hn-card > span { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
      .hn-card b { font-size: 13.5px; font-weight: 700; line-height: 1.3; color: #0f1720; }
      .hn-card small { font-size: 12px; font-weight: 500; color: #8a91a4; }
      .hn-card > i { flex: none; width: 9px; height: 9px; border-radius: 50%; background: #1f9d55; box-shadow: 0 0 0 4px #d8f3e1; animation: hn-pulse 2.2s ease-out infinite; }
      @keyframes hn-in { from { opacity: 0; transform: translateY(18px) scale(0.92); } to { opacity: 1; transform: none; } }
      @keyframes hn-out { to { opacity: 0; transform: translateY(-14px) scale(0.96); } }
      @keyframes hn-pulse { 0% { box-shadow: 0 0 0 4px #d8f3e1; } 70%, 100% { box-shadow: 0 0 0 9px rgba(31, 157, 85, 0); } }
      @media (prefers-reduced-motion: reduce) { .hn-card, .hn-card.is-out, .hn-card > i { animation: none; } }
    `}</style>
  );
}

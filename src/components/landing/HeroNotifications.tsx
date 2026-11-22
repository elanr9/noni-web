import Image from "next/image";
import type { CSSProperties } from "react";

/* The little notifications floating around the landing headline, the
   moments Noni sends a company all day: a post to approve, a post taking
   off, sign-ups coming in, a creator paid. Each slides in, then drifts
   gently. On wide screens they sit around the headline; on small ones two
   stack under the buttons. CSS only. */

export type HeroNote = {
  img: string;
  who: string;
  what: string;
  where: string;
  tag?: string;
};

export const HERO_NOTES: HeroNote[] = [
  { img: "/brand/post-jake2.png", who: "Jake", what: "New post ready for review", where: "TikTok", tag: "Reel" },
  { img: "/brand/post-sebastian.png", who: "Elan", what: "Your post just hit 10k views", where: "Instagram", tag: "10k" },
  { img: "/brand/post-fabri.png", who: "Trav", what: "Brought in 3 new sign-ups", where: "TikTok", tag: "+3" },
  { img: "/brand/post-tona.png", who: "Alex", what: "Got paid $45 for 2 posts", where: "Payout", tag: "Paid" },
  { img: "/brand/post-frame.png", who: "Hoku", what: "Started filming your new brief", where: "Brief", tag: "Due Fri" },
];

export function NoteCard({ note, delay = 0, drift = 0, className = "" }: { note: HeroNote; delay?: number; drift?: number; className?: string }) {
  return (
    <div
      className={`hero-note flex w-[272px] items-center gap-3 rounded-[16px] border border-line bg-white py-2.5 pl-2.5 pr-3.5 text-left shadow-[0_10px_30px_-14px_rgba(15,23,42,0.25)] ${className}`}
      style={{ "--d": `${delay}ms`, "--drift": `${drift}ms` } as CSSProperties}
    >
      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[10px] bg-slate-200">
        <Image src={note.img} alt="" fill sizes="44px" className="object-cover" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-bold leading-[1.3] text-ink">{note.who}</span>
        <span className="block truncate text-[13px] font-medium leading-[1.35] text-ink-soft">{note.what}</span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[11.5px] font-medium text-slate-400">
          <span className="truncate">{note.where}</span>
          {note.tag ? (
            <span className="shrink-0 rounded-[5px] bg-[#eef2f6] px-1.5 py-px text-[10.5px] font-bold text-ink-soft">{note.tag}</span>
          ) : null}
          <span className="shrink-0">Just now</span>
        </span>
      </span>
      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#22c55e] shadow-[0_0_0_3px_rgba(34,197,94,0.18)]" />
    </div>
  );
}

/** Keyframes for the cards: in, then a slow float. */
export function HeroNoteStyles() {
  return (
    <style>{`
      @keyframes hero-note-in { from { opacity: 0; transform: translate3d(0, 14px, 0) scale(.96); } to { opacity: 1; transform: none; } }
      @keyframes hero-note-float { 0%, 100% { translate: 0 0; } 50% { translate: 0 -6px; } }
      .hero-note {
        animation: hero-note-in 600ms cubic-bezier(.22,.61,.36,1) var(--d) both,
                   hero-note-float 6s ease-in-out calc(var(--d) + 600ms + var(--drift)) infinite;
      }
      @media (prefers-reduced-motion: reduce) { .hero-note { animation: none; } }
    `}</style>
  );
}

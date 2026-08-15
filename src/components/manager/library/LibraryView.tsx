"use client";

/* The /manager Library tab, porting the mobile Library screen
   (noni/app/(admin)/(tabs)/library.tsx): Posts / References / Ideas tabs
   over library_items plus live posts, the idea composer with Video and
   Slideshow format chips (blue-500 fill, white text when selected, the
   chip is display-only exactly like mobile: the insert carries no format),
   thumbnails when present, usage counts, and per-tab empty states. */
import { Images, Link2, Play, Sparkles, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import { Card, PageHead, Pill, Tabs } from "@/components/kit";
import { captureLibraryItem } from "@/app/manager/library/actions";
import type { LibraryCard, ManagerLibrary } from "@/lib/manager/library";

const TABS = ["Posts", "References", "Ideas"] as const;
type Tab = (typeof TABS)[number];

type IdeaFormat = "video" | "photo_carousel";

const FORMAT_CHIPS: Array<{ format: IdeaFormat; icon: LucideIcon; label: string }> = [
  { format: "video", icon: Play, label: "Video" },
  { format: "photo_carousel", icon: Images, label: "Slideshow" },
];

const EMPTY: Record<Tab, { icon: LucideIcon; title: string; body: string }> = {
  Posts: {
    icon: TrendingUp,
    title: "No posts yet",
    body: "Posts land here the day they go live, sorted by performance.",
  },
  References: {
    icon: Link2,
    title: "No references yet",
    body: "Paste a TikTok or Instagram link and it saves with a thumbnail.",
  },
  Ideas: {
    icon: Sparkles,
    title: "No ideas saved yet",
    body: "Write one line above. AI cleans it into a draft.",
  },
};

/** A single-line paste that is one http(s) URL routes to a reference. */
function isCaptureUrl(raw: string): boolean {
  const line = raw.trim();
  return /^https?:\/\/\S+$/i.test(line) && !line.includes("\n");
}

function FormatChip({
  icon: Icon,
  label,
  selected,
  onSelect,
}: {
  icon: LucideIcon;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`inline-flex cursor-pointer items-center gap-[5px] border-none px-[11px] py-[7px] text-[12px] font-bold transition-[background-color,color,transform] duration-[160ms] ease-om rounded-pill ${
        selected ? "scale-[1.04] bg-blue-500 text-white" : "bg-fill-quiet text-slate-500"
      }`}
    >
      <Icon size={12} />
      {label}
    </button>
  );
}

function IdeaComposer({
  onSaved,
}: {
  onSaved: (message: string, kind: "idea" | "reference") => void;
}) {
  const [value, setValue] = useState("");
  const [format, setFormat] = useState<IdeaFormat>("video");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const bulkCount = !isCaptureUrl(value) && lines.length >= 2 ? lines.length : 0;
  const hasText = value.trim().length > 0;

  function save() {
    const raw = value;
    if (!hasText || pending) return;
    setValue("");
    setError(null);
    startTransition(async () => {
      const result = await captureLibraryItem(raw);
      if (!result.ok) {
        setValue(raw);
        setError(result.error);
        return;
      }
      if (result.reference) onSaved("Reference saved", "reference");
      else if (result.ideas === 1) onSaved("Idea saved", "idea");
      else onSaved(`${result.ideas} ideas saved`, "idea");
    });
  }

  return (
    <div className="mb-4">
      <div
        className={`rounded-[14px] border-2 bg-white p-3 transition-colors duration-[160ms] ease-om ${
          hasText ? "border-blue-500" : "border-line-strong"
        }`}
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              save();
            }
          }}
          placeholder="Type a post idea"
          rows={value.includes("\n") ? 3 : 1}
          className="block w-full resize-none border-none bg-transparent p-0 text-[14px] font-normal leading-normal text-ink outline-none placeholder:text-slate-400"
        />
        <div className="mt-2.5 flex items-center gap-1.5">
          {FORMAT_CHIPS.map((chip) => (
            <FormatChip
              key={chip.format}
              icon={chip.icon}
              label={chip.label}
              selected={format === chip.format}
              onSelect={() => setFormat(chip.format)}
            />
          ))}
          <span className="flex-1" />
          <Pill size="sm" disabled={!hasText || pending} onClick={save}>
            Save
          </Pill>
        </div>
      </div>
      {bulkCount > 0 ? (
        <p className="mb-0 mt-1.5 text-[12px] font-bold text-blue-700">
          {bulkCount} ideas will be saved
        </p>
      ) : null}
      {error !== null ? (
        <p className="mb-0 mt-1.5 text-[12px] font-bold text-danger">{error}</p>
      ) : null}
    </div>
  );
}

function LibraryCardRow({ card }: { card: LibraryCard }) {
  const showThumb = card.kind === "reference" || card.kind === "our_post";
  const Icon = card.format === "Carousel" ? Images : Play;
  const open = () => {
    if (card.url) window.open(card.url, "_blank", "noopener,noreferrer");
  };
  return (
    <div
      role={card.url ? "button" : undefined}
      onClick={card.url ? open : undefined}
      className={`flex items-center gap-[13px] rounded-[14px] border border-line bg-white p-3.5 shadow-card ${
        card.url
          ? "cursor-pointer transition-colors duration-[160ms] ease-om hover:bg-fill-quiet"
          : ""
      }`}
    >
      {showThumb ? (
        card.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.thumbnailUrl}
            alt=""
            className="h-14 w-[42px] shrink-0 rounded-[10px] object-cover"
          />
        ) : (
          <span className="inline-flex h-14 w-[42px] shrink-0 items-center justify-center bg-blue-100 rounded-[10px]">
            <Icon size={15} className="text-blue-700" />
          </span>
        )
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-bold leading-snug text-ink [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
          {card.title}
        </span>
        {card.meta ? (
          <span className="mt-0.5 block truncate text-[12px] font-semibold text-slate-400">
            {card.meta}
          </span>
        ) : null}
      </span>
    </div>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  const { icon: Icon, title, body } = EMPTY[tab];
  return (
    <Card pad={22} className="py-12 text-center">
      <span className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center bg-fill-quiet rounded-pill">
        <Icon size={18} className="text-slate-400" />
      </span>
      <p className="m-0 text-[15px] font-bold text-ink">{title}</p>
      <p className="mx-auto mb-0 mt-1 max-w-[340px] text-[13px] font-semibold text-slate-400">
        {body}
      </p>
    </Card>
  );
}

export function LibraryView({ library }: { library: ManagerLibrary }) {
  const [tab, setTab] = useState<Tab>("Posts");
  const [note, setNote] = useState<string | null>(null);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showNote(message: string, kind: "idea" | "reference") {
    if (noteTimer.current) clearTimeout(noteTimer.current);
    setNote(message);
    noteTimer.current = setTimeout(() => setNote(null), 2500);
    /* A pasted URL lands on References; jump there so the save is visible. */
    if (kind === "reference") setTab("References");
  }

  const cards: Record<Tab, LibraryCard[]> = {
    Posts: library.posts,
    References: library.references,
    Ideas: library.ideas,
  };
  const list = cards[tab];

  return (
    <div>
      <PageHead
        title="Library"
        sub="Post ideas, saved references and everything your creators have published."
      />
      <Tabs
        tabs={TABS}
        active={tab}
        onSelect={setTab}
        right={
          note !== null ? (
            <span className="text-[12px] font-bold text-green">{note}</span>
          ) : null
        }
      />
      {tab === "Ideas" ? <IdeaComposer onSaved={showNote} /> : null}
      {list.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {list.map((card) => (
            <LibraryCardRow key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}

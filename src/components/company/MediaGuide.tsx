import { Plus } from "lucide-react";

import { PostTextPreview } from "@/components/company/PostTextPreview";
import { Pill } from "@/components/kit";

/* What an empty Media library shows instead of a blank drop box: what to
   add, how, and where it ends up. Three numbered steps on the left and, on
   the right, a phone showing a screenshot sitting inside a creator's video,
   so "add screenshots" means something the first time someone reads it. */

const STEPS: Record<"screenshot" | "recording", Array<{ title: string; hint: string }>> = {
  screenshot: [
    { title: "Open your product", hint: "The real app or site, signed in" },
    { title: "Screenshot your 3 best screens", hint: "iPhone: side button + volume up. Mac: ⌘ Shift 4" },
    { title: "Drop them here", hint: "Then name each one" },
  ],
  recording: [
    { title: "Open your product", hint: "The real app or site, signed in" },
    { title: "Record one thing it does", hint: "iPhone: Screen Recording. Mac: ⌘ Shift 5. Under a minute" },
    { title: "Drop it here", hint: "Then name it" },
  ],
};

export function MediaGuide({
  kind,
  themeColor,
  onAdd,
}: {
  kind: "screenshot" | "recording";
  /** The company's theme color, for the caption on the example. */
  themeColor: string | null;
  onAdd: () => void;
}) {
  const isShot = kind === "screenshot";
  return (
    <div className="flex flex-col items-center gap-x-12 gap-y-8 px-4 py-4 md:flex-row md:px-8">
      <div className="min-w-0 flex-1">
        <h2 className="display m-0 text-[30px] font-bold leading-[1.1] tracking-[-0.8px] text-ink">
          Show us your product
        </h2>
        <p className="mb-0 mt-2 text-[15px] font-semibold text-slate-500">
          Creators put {isShot ? "these screenshots" : "this recording"} in their videos.
        </p>
        <ol className="m-0 mt-6 flex list-none flex-col gap-4 p-0">
          {STEPS[kind].map((step, i) => (
            <li key={step.title} className="flex items-start gap-3.5">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center bg-blue-100 text-[14px] font-extrabold text-blue-700 rounded-pill">
                {i + 1}
              </span>
              <span className="min-w-0 pt-[3px]">
                <span className="block text-[16px] font-bold leading-[1.3] text-ink">
                  {step.title}
                </span>
                <span className="mt-0.5 block text-[13px] font-semibold text-slate-400">
                  {step.hint}
                </span>
              </span>
            </li>
          ))}
        </ol>
        <Pill icon={Plus} onClick={onAdd} className="mt-7">
          {isShot ? "Add screenshots" : "Add a recording"}
        </Pill>
      </div>

      {/* Where it ends up: a creator's video with the product screen in it. */}
      <div
        aria-hidden
        className="relative flex w-[190px] shrink-0 flex-col items-center justify-center gap-3 overflow-hidden bg-ink-900 px-3 rounded-[26px]"
        style={{ aspectRatio: "9 / 16" }}
      >
        <div className="flex max-w-full justify-center text-center">
          <PostTextPreview text="This app is crazy" color={themeColor} fontSize={15} />
        </div>
        <div className="flex w-[78%] flex-col gap-1.5 border-2 border-dashed border-white/50 bg-white/10 p-2.5 rounded-[14px]">
          <span className="h-2 w-1/2 bg-white/60 rounded-pill" />
          <span className="h-10 w-full bg-white/25 rounded-[8px]" />
          <span className="h-2 w-3/4 bg-white/40 rounded-pill" />
          <span className="h-2 w-2/3 bg-white/40 rounded-pill" />
          <span className="mt-1 text-center text-[11px] font-bold text-white">
            {isShot ? "Your screenshot" : "Your recording"}
          </span>
        </div>
        <span className="absolute bottom-3 left-3 text-[11px] font-bold text-white/80">
          @creator
        </span>
      </div>
    </div>
  );
}

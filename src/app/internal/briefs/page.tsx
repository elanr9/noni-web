import { ManagerShell } from "@/components/manager/ManagerShell";
import { newClip, type Brief, type BriefType } from "@/lib/manager/brief-library";

import { BriefsPreviewClient } from "./BriefsPreviewClient";

/* Dev preview of the manager Briefs library with sample briefs
   (?view=empty|full&open=<id>). 404 in production. Upload brief runs on
   canned posts; the other actions need a session. */

const TITLES: [string, BriefType][] = [
  ["I wrote my whole essay in 10 minutes", "Talking Head"],
  ["POV: finals week and you found this app", "Long Text"],
  ["5 study apps I cannot live without", "Slideshow"],
  ["Reacting to my professor's feedback", "Greenscreen"],
  ["Why I stopped pulling all nighters", "Talking Head"],
  ["The essay hack nobody tells freshmen", "Talking Head"],
  ["My GPA before and after", "Slideshow"],
  ["Things that just make sense in college", "Long Text"],
];

function sample(i: number): Brief {
  const [title, type] = TITLES[i % TITLES.length];
  const clips = [
    newClip("I used to spend six hours on one essay.", { onScreen: "6 hours per essay" }),
    newClip("Then my roommate showed me Inkbound.", { onScreen: "Then I found this" }),
    newClip("It outlines, drafts and cites in my own voice.", { onScreen: "Drafts in your voice" }),
    newClip("Link in bio if you have finals coming up.", { onScreen: "Try it free", cta: true }),
  ];
  return {
    id: `b${i}`,
    type,
    kind: "Guided",
    title,
    notes: "",
    link: "",
    ts: Date.now() - i * 86_400_000,
    audio: null,
    clips,
    g: null,
    lt: type === "Long Text" ? { title, onScreen: "when you finish the essay at 9pm instead of 4am", notes: "One take, eyes on the lens.", doc: null } : null,
    from: null,
    caption: "finals szn is easier now",
    tags: ["studytok", "college"],
    uses: (i * 3) % 7,
  };
}

export default async function BriefsPreview({ searchParams }: { searchParams: Promise<{ view?: string; open?: string }> }) {
  const sp = await searchParams;
  const briefs: Brief[] =
    sp.view === "empty"
      ? []
      : [
          ...Array.from({ length: 14 }, (_, i) => sample(i)),
          { ...sample(0), id: "o1", kind: "Outline", title: "Day in my life with Inkbound", notes: "Show the app in the first three seconds. Keep it under 30 seconds.", clips: null, link: "https://www.tiktok.com/@example/video/1" },
        ];
  return (
    <ManagerShell companyName="Inkbound AI" name="Preview" people={[]} reviewCount={0}>
      <BriefsPreviewClient initial={briefs} initialOpen={sp.open ?? null} />
    </ManagerShell>
  );
}

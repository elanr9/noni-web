import { AdminShell } from "@/components/admin/AdminShell";
import { MediaLibraryView } from "@/components/company/MediaLibraryView";
import type { MediaLibraryItem } from "@/lib/media-library";
import { MOCK_DATASET } from "@/lib/admin/mock-data";

const TINTS = ["#1ba6ee", "#7c3aed", "#22c55e", "#f97316", "#e11d48", "#0f1720"];

function shot(i: number): MediaLibraryItem {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="400" height="500" fill="${TINTS[i % TINTS.length]}"/></svg>`;
  const url = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  return {
    id: `shot-${i}`,
    kind: "screenshot",
    title: `Screen ${i + 1}`,
    description: i % 3 === 0 ? "The highlight editor with a clip selected." : null,
    path: `mock/${i}.png`,
    thumbPath: null,
    url,
    previewUrl: url,
    durationMs: null,
    width: 400,
    height: 500,
    createdAt: new Date(0).toISOString(),
  };
}

/* Dev preview of the Media library (run with ADMIN_QA_MOCK=1). 404 in
   production through the /internal layout. ?n= sets how many screenshots. */
export default async function MediaPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const n = Number((await searchParams).n ?? 40);
  return (
    <AdminShell
      companyName={MOCK_DATASET.company.name}
      name="Riley Chen"
      people={[]}
      setupRemaining={2}
      setupComplete={false}
    >
      <MediaLibraryView
        companyId={MOCK_DATASET.company.id}
        items={Array.from({ length: n }, (_, i) => shot(i))}
        themeColor="#1BA6EE"
        themeFromSite
      />
    </AdminShell>
  );
}

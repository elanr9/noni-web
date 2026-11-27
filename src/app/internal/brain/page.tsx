import { peekBrainIngest, peekBrainSnapshot } from "@/app/admin/brain/knowledge-actions";
import { AdminShell } from "@/components/admin/AdminShell";
import { BrainHome } from "@/components/admin/brain/BrainHome";
import { MOCK_DATASET } from "@/lib/admin/mock-data";

/* Dev preview of the Company Brain page on the mock brain (run with
   ADMIN_QA_MOCK=1). 404 in production through the /internal layout.
   ?empty=1 shows it before Noni has read anything. The full brain the Noni
   team uses previews at /internal/brain/full. */
export default async function BrainPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const empty = (await searchParams).empty === "1";
  const [snapshot, ingest] = await Promise.all([peekBrainSnapshot(), peekBrainIngest()]);
  return (
    <AdminShell
      companyName={MOCK_DATASET.company.name}
      name="Riley Chen"
      people={[]}
      setupRemaining={2}
      setupComplete={false}
    >
      <BrainHome
        companyName={MOCK_DATASET.company.name}
        logoPath={MOCK_DATASET.company.logoPath}
        website="fieldvision.ai"
        snapshot={empty ? null : snapshot}
        ingest={empty ? { ok: false, error: "" } : ingest}
        staff
      />
    </AdminShell>
  );
}

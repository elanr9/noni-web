import { listBrainFacts, peekBrainIngest } from "@/app/admin/brain/knowledge-actions";
import { AdminShell } from "@/components/admin/AdminShell";
import { BrainView } from "@/components/admin/brain/BrainView";
import { MOCK_DATASET } from "@/lib/admin/mock-data";

/* Dev preview of the Company Brain page on the mock brain (run with
   ADMIN_QA_MOCK=1). 404 in production through the /internal layout.
   ?down=1 shows the page as it is when the brain functions do not answer. */
export default async function BrainPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const down = (await searchParams).down === "1";
  const unavailable = { ok: false as const, error: "The brain is not available yet." };
  const [knowledge, ingest] = down
    ? [unavailable, unavailable]
    : await Promise.all([listBrainFacts(), peekBrainIngest()]);

  return (
    <AdminShell
      companyName={MOCK_DATASET.company.name}
      name="Riley Chen"
      people={[]}
      setupRemaining={2}
      setupComplete={false}
    >
      <BrainView
        docs={MOCK_DATASET.brainDocs}
        accounts={MOCK_DATASET.inspirationAccounts}
        features={MOCK_DATASET.features}
        templates={MOCK_DATASET.briefTemplates}
        logoPath={MOCK_DATASET.company.logoPath}
        website="fieldvision.ai"
        research={null}
        learning={null}
        knowledge={knowledge}
        ingest={ingest}
      />
    </AdminShell>
  );
}

"use client";

import { SnapshotReview } from "@/components/admin/brain/SnapshotReview";

/* Dev preview of the end-of-onboarding summary on mock data (run with
   ADMIN_QA_MOCK=1). 404 in production through the /internal layout. */
export default function SnapshotPreviewPage() {
  return (
    <div className="flex min-h-screen justify-center bg-ground px-4 pb-16 pt-12 font-ops">
      <div className="w-[640px] max-w-full">
        <SnapshotReview scanning={false} pending={false} onDone={() => {}} />
      </div>
    </div>
  );
}

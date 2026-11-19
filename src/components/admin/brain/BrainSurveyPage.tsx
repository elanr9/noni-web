"use client";

import { useRouter } from "next/navigation";

import type { BrainResult } from "@/app/admin/brain/knowledge-actions";
import { BrainSurvey } from "@/components/admin/brain/BrainSurvey";
import { PageHead, Pill } from "@/components/kit";
import type { FactsList, SurveyState } from "@/lib/admin/brain-model";

export function BrainSurveyPage({
  survey,
  facts,
}: {
  survey: BrainResult<SurveyState>;
  facts: BrainResult<FactsList>;
}) {
  const router = useRouter();
  const back = () => router.push("/admin/brain");
  return (
    <div>
      <PageHead title="Founder questions" onBack={back} />
      <div className="mx-auto w-[560px] max-w-full">
        <BrainSurvey
          initialSurvey={survey}
          initialFacts={facts}
          renderDone={() => (
            <Pill onClick={back} className="w-full" style={{ padding: "15px 22px", fontSize: 15 }}>
              Open Company Brain
            </Pill>
          )}
          fallback={
            <Pill variant="quiet" onClick={back}>
              Back to Company Brain
            </Pill>
          }
        />
      </div>
    </div>
  );
}

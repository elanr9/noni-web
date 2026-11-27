import { notFound, redirect } from "next/navigation";

import { getSessionProfile } from "@/lib/auth";
import { getSignedAgreement } from "@/lib/agreements";

import { AgreementDoc } from "@/components/agreement/AgreementDoc";

export const dynamic = "force-dynamic";
export const metadata = { title: "Signed agreement", robots: { index: false } };

/* Opens for the creator who signed, the company's managers and Noni ops. */
export default async function AgreementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await getSessionProfile();
  if (!userId) redirect(`/login?next=/agreements/${id}`);
  const a = await getSignedAgreement(id);
  if (!a) notFound();
  return <AgreementDoc a={a} />;
}

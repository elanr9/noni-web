import { StartFlow, type StartStep } from "@/components/start/StartFlow";

/* Dev preview of the first run fork (/start) at any step: ?step=choose|plans|call|paid.
   404 in production through the /internal layout. Buttons call real actions; look only. */
export default async function StartPreviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const step = (["choose", "plans", "call", "paid"] as const).find((s) => s === sp.step) ?? "choose";
  return (
    <StartFlow
      companyId="preview"
      companyName="Inkbound"
      firstName="Elan"
      email="you@company.com"
      themeColor={typeof sp.color === "string" ? `#${sp.color}` : null}
      bookingUrl={sp.booking === "1" ? "https://cal.com/noni" : null}
      initialStep={step as StartStep}
    />
  );
}

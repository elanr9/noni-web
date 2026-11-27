import { TaxView } from "@/components/ops/tax/TaxView";
import type { TaxRow } from "@/lib/ops/tax";

/* Dev preview of /ops/tax with sample rows. 404 in production through the
   /internal layout. */
const NAMES = ["Maya Chen", "Jordan Alvarez", "Priya Nair", "Tom Becker", "Lena Fischer", "Sam Okafor", "Ava Rossi", "Noah Kim", "Zoe Martin"];
const ROWS: TaxRow[] = NAMES.map((name, i) => {
  const paidCents = [684000, 412050, 265000, 201000, 188000, 96000, 54000, 23000, 9000][i];
  const country = i === 4 ? "DE" : i === 7 ? null : "US";
  return {
    creatorId: `c-${i}`,
    name,
    email: `${name.split(" ")[0].toLowerCase()}@example.com`,
    country,
    paidCents,
    payouts: 30 - i * 3,
    form: i === 2 ? "missing" : i === 4 ? "check" : "w9",
    needs1099: country !== "DE" && paidCents >= 200000,
  };
});

export default function TaxPreview() {
  return (
    <div className="mx-auto max-w-[1100px] p-8">
      <TaxView year={2026} current thresholdCents={200000} rows={ROWS} />
    </div>
  );
}

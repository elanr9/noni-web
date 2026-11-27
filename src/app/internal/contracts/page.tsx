import { ContractsView } from "@/components/admin/contracts/ContractsView";
import type { ContractRow } from "@/lib/admin/contracts";

/* Dev preview of /admin/contracts with sample rows. 404 in production
   through the /internal layout. */
const NAMES = ["Maya Chen", "Jordan Alvarez", "Priya Nair", "Tom Becker", "Lena Fischer", "Sam Okafor", "Ava Rossi", "Noah Kim", "Zoe Martin", "Eli Park", "Ruth Cole"];
const ROWS: ContractRow[] = NAMES.map((creator, i) => ({
  id: `a-${i}`,
  creatorId: `c-${i}`,
  creator,
  campaign: "Tattoo ideas in seconds",
  state: i < 8 ? "signed" : i < 10 ? "waiting" : "ended",
  at: new Date(Date.UTC(2026, 10, 26 - i, 15)).toISOString(),
  startDate: null,
}));

export default function ContractsPreview() {
  return (
    <div className="mx-auto max-w-[1100px] p-8">
      <ContractsView rows={ROWS} />
    </div>
  );
}

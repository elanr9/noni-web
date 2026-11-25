import { redirect } from "next/navigation";

import { MarketView } from "@/components/manager/market/MarketView";
import { loadMarket } from "./actions";

export const dynamic = "force-dynamic";

/* Market: the company's campaign listing, who applied, who it invited and
   every creator on Noni. The layout gate already verified the manager. */
export default async function ManagerMarketPage() {
  const r = await loadMarket();
  if (!r.ok) redirect("/manager");
  return <MarketView initial={r.data} />;
}

import type { Metadata } from "next";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PricingView } from "@/components/PricingView";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Noni plans for companies running UGC creator programs. Every plan includes campaigns, briefs, approvals, analytics and creator payouts; plans differ only in creators per campaign.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-off-white">
      <Navbar />
      <PricingView />
      <Footer />
    </div>
  );
}

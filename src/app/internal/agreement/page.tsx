import { AgreementDoc } from "@/components/agreement/AgreementDoc";

/* Dev preview of /agreements/[id] with a sample signature. 404 in production
   through the /internal layout. */
export default function AgreementPreview() {
  return (
    <AgreementDoc
      a={{
        id: "5b0c2c1e-8a44-4c1b-9d0e-2f6f1f1f7a10",
        title: "Creator agreement",
        body: 'This agreement is between Inkbound ("the Company") and you ("the Creator"). It starts the day the Company accepts your application.\n\n1. The work. You make short videos and posts for the Company from the briefs it gives you in Noni, and post them on your own accounts. The target is 2 to 3 posts a day.\n\n2. Pay. You earn $10 for each video and $5 for each slideshow once it is live and has 500 views, plus $1 for every 1,000 views in the first 30 days, up to $300 in view pay per post.\n\n8. Tax forms. Noni pays you on the Company\'s behalf. You give Noni a W-9 before your first payout, or a W-8BEN if you are outside the United States. Noni sends you a 1099-NEC for each year your pay reaches the IRS reporting amount.',
        version: 2,
        sha256: "9f2b6c1d4e7a8b3c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4",
        signedName: "Maya Chen",
        signedAt: "2026-11-24T18:42:00Z",
        signedIp: "198.51.100.7",
        signedAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 19_1 like Mac OS X) Safari/605.1.15",
        companyName: "Inkbound",
        status: "accepted",
        acceptedAt: "2026-11-25T15:10:00Z",
        acceptedBy: "Elan Romo",
      }}
    />
  );
}

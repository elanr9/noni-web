import { AgreementDoc } from "@/components/agreement/AgreementDoc";

/* Dev preview of /agreements/[id] with a sample signature. 404 in production
   through the /internal layout. */
export default function AgreementPreview() {
  return (
    <AgreementDoc
      a={{
        id: "5b0c2c1e-8a44-4c1b-9d0e-2f6f1f1f7a10",
        title: "Creator agreement",
        body: "This Creator Agreement is made on November 26, 2026 between Inkbound AI (\"the Company\") and Maya Chen (\"the Creator\") for the campaign \"Tattoo ideas in seconds\". It starts the day the Creator signs.\n\n1. The work. The Creator makes short videos and posts for the Company from the briefs in Noni and posts them on the Creator's own accounts. The target is 2 to 3 posts a day. The first post is due within 3 days of signing.\n\n2. Pay. Noni tracks views and pays the Creator on the Company's behalf.\nVideo: $10 once it is live and has 500 views on TikTok or Instagram\nSlideshow: $5 once it is live and has 500 views on TikTok or Instagram\nViews: $1 for every 1,000 views, TikTok and Instagram combined, in the 30 days after posting, up to $300 a post\nPayout: every Sunday to the Creator's bank\nOnly posts approved in Noni are paid. Drafts and unpublished posts are not paid.\n\n4. Content rights. The Creator keeps ownership of the content. The Creator gives the Company a worldwide, royalty free licence with no end date to use, copy, edit and share the content made under this agreement. The Company may repost it on its own social accounts, website and app store pages, run it as paid ads, cut it together with other clips, and add captions, music or its logo.",
        version: 2,
        sha256: "9f2b6c1d4e7a8b3c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4",
        signedName: "Maya Chen",
        signedAt: "2026-11-24T18:42:00Z",
        signature: "M24 78 L30 60 L38 44 L44 62 L50 84 L58 58 L66 40 L72 66 L80 86 L92 70 L104 62 L112 74 L122 80 L134 66 L146 58 L156 72 L170 82 L186 64 L198 52 L206 70 L220 84 L240 72 L262 66 L286 74",
        signedIp: "198.51.100.7",
        signedAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 19_1 like Mac OS X) Safari/605.1.15",
        companyName: "Inkbound AI",
        status: "accepted",
        acceptedAt: "2026-11-25T15:10:00Z",
        acceptedBy: "Elan Romo",
      }}
    />
  );
}

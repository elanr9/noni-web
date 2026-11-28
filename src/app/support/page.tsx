import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <LegalPage title="Support">
      <p>
        Email{" "}
        <a className="font-semibold text-accent-deep" href="mailto:founders@usenoni.app">
          founders@usenoni.app
        </a>{" "}
        or text{" "}
        <a className="font-semibold text-accent-deep" href="sms:+15613995015">
          +1 561 399 5015
        </a>
        .
      </p>
      <h2 className="display pt-6 text-2xl font-semibold text-ink">Delete your account</h2>
      <p>In the app, open Settings and tap Delete account. Or email us from the address on your account.</p>
      <h2 className="display pt-6 text-2xl font-semibold text-ink">Report content</h2>
      <p>
        Long press a message, or tap the flag on a campaign or profile, then Report. You can also block the person or
        company there. Reports are reviewed within 24 hours.
      </p>
    </LegalPage>
  );
}

import type { Metadata } from "next";
import { Manrope, Syne } from "next/font/google";
import "./globals.css";

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Noni",
    template: "%s · Noni",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/brand/app-icon.svg",
  },
  applicationName: "Noni",
  description:
    "Noni automates UGC end to end. Creators get paid to post what Noni tells them. Businesses approve once, then edit, post, track, and pay run automatically.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.usenoni.app",
  ),
  openGraph: {
    title: "Noni",
    siteName: "Noni",
    description:
      "Noni automates UGC campaigns for creators and businesses: queued posts, in app creation, one approve, then auto post and pay.",
    type: "website",
  },
  appleWebApp: {
    title: "Noni",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}

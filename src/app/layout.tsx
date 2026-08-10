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
  applicationName: "Noni",
  description:
    "The purpose of the Noni app is to help brands run creator content programs. Noni assigns creator tasks, supports video and photo recording, admin approval, and automatic posting.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.usenoni.app",
  ),
  openGraph: {
    title: "Noni",
    siteName: "Noni",
    description:
      "The purpose of the Noni app is to help brands run creator content programs with queues, recording, approval, and automatic posting.",
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

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
    default: "Noni — Creator content that ships itself",
    template: "%s · Noni",
  },
  description:
    "Noni is a creator content application for brands. It assigns creator tasks, supports video and photo recording, admin approval, and automatic posting.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://noni-web.vercel.app",
  ),
  openGraph: {
    title: "Noni",
    description:
      "Noni is a creator content application for brands that fill queues, record, approve once, and ship posts automatically.",
    type: "website",
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

import type { Metadata } from "next";
import { Manrope, Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

/* Ops console (/ops) typeface. Loaded here so the variable is available on
   <html>; the ops shell opts in via the font-ops utility. */
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

/* Self-hosted because Google Fonts strips Syne's stylistic sets, leaving the
   ss04 double-storey g (globals.css .display) without glyphs to swap in. */
const display = localFont({
  src: "./fonts/syne-latin.woff2",
  variable: "--font-display",
  weight: "400 800",
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
  description: "Automated UGC Content Submissions.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.usenoni.app",
  ),
  openGraph: {
    title: "Noni",
    siteName: "Noni",
    description: "Automated UGC Content Submissions.",
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
    <html
      lang="en"
      className={`${body.variable} ${display.variable} ${poppins.variable} h-full`}
    >
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}

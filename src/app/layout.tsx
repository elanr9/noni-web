import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans, Poppins } from "next/font/google";
import "./globals.css";

import { CelebrationHost } from "@/components/motion/Celebration";
import { NavProgress } from "@/components/motion/NavProgress";

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

/* Headlines (globals.css .display): rounded and easy to read at any size. */
const display = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Noni: UGC Campaigns made easy",
    template: "%s · Noni",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/brand/app-icon.png",
  },
  applicationName: "Noni",
  description:
    "Everything you need to run UGC Campaigns, all in one place. Write briefs, film, edit with AI, post, track results and pay your creators.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.usenoni.app",
  ),
  openGraph: {
    title: "Noni",
    siteName: "Noni",
    description:
      "Everything you need to run UGC Campaigns, all in one place. Write briefs, film, edit with AI, post, track results and pay your creators.",
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
      <body className="min-h-full antialiased">
        <NavProgress />
        {children}
        <CelebrationHost />
      </body>
    </html>
  );
}

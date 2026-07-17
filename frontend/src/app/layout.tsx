import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { Analytics } from "@/components/analytics/Analytics";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Tolerate a malformed NEXT_PUBLIC_SITE_URL (e.g. "http://:5555" when
// SERVER_HOST is unset at build time) instead of crashing the build.
function safeSiteUrl(): URL {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://prototypebd.com");
  } catch {
    return new URL("https://prototypebd.com");
  }
}

export const metadata: Metadata = {
  metadataBase: safeSiteUrl(),
  title: {
    default: "PrototypeBD — 3D Printers, Laser Engravers & Filament",
    template: "%s | PrototypeBD",
  },
  description:
    "Bangladesh's premier shop for 3D printers, laser engravers, CNC machines, and premium filament. Fast delivery, expert support.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "PrototypeBD",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  // Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION to verify Search Console ownership.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Analytics />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}

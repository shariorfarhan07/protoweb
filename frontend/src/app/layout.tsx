import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CompareBar } from "@/components/comparison/CompareBar";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://prototypebd.com"
  ),
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
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Navbar />
        <main>{children}</main>
        <CompareBar />
        <Footer />
      </body>
    </html>
  );
}

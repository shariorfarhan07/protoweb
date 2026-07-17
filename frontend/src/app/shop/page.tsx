import type { Metadata } from "next";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop — 3D Printers, Laser Engravers & Filament",
  description:
    "Browse the full PrototypeBD catalogue — 3D printers, laser engravers, CNC machines, and premium filament. Filter by category, brand, price, and material.",
  alternates: { canonical: "/shop" },
  openGraph: {
    type: "website",
    title: "Shop — PrototypeBD",
    description:
      "Browse 3D printers, laser engravers, CNC machines, and premium filament at PrototypeBD Bangladesh.",
    url: "/shop",
  },
};

export default function ShopPage() {
  return <ShopClient />;
}

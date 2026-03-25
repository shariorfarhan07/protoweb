import type { Metadata } from "next";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductCard } from "@/components/shop/ProductCard";
import { getCategories, getFeaturedProducts } from "@/lib/api";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "PrototypeBD — 3D Printers, Laser Engravers & Filament in Bangladesh",
  description:
    "Bangladesh's premier shop for 3D printers, laser engravers, CNC machines, and premium filament. Shop now with fast delivery.",
};

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
  ]);

  return (
    <>
      <HeroCarousel />
      <CategoryGrid categories={categories} />

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="px-12 pb-20">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="font-semibold uppercase text-gray-500"
              style={{ fontSize: 11, letterSpacing: 4 }}
            >
              Featured Products
            </h2>
          </div>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
          >
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

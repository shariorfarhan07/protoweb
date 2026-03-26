import type { Metadata } from "next";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import ReviewsCarousel from "@/components/home/ReviewsCarousel";
import { ProductCard } from "@/components/shop/ProductCard";
import { getCategories, getFeaturedProducts, getReviews } from "@/lib/api";
import type { CategorySchema, ProductList, ReviewOut } from "@/lib/api-types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prototypebd.com";

function ReviewsJsonLd({ reviews }: { reviews: ReviewOut[] }) {
  if (reviews.length === 0) return null;
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PrototypeBD",
    "url": SITE_URL,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": avgRating,
      "reviewCount": reviews.length,
      "bestRating": "5",
      "worstRating": "1",
    },
    "review": reviews.map((r) => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": r.reviewer_name,
        ...(r.reviewer_title ? { "jobTitle": r.reviewer_title } : {}),
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": r.rating,
        "bestRating": "5",
        "worstRating": "1",
      },
      "reviewBody": r.content,
      "datePublished": r.created_at.split("T")[0],
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export const revalidate = 60;

export const metadata: Metadata = {
  title: "PrototypeBD — 3D Printers, Laser Engravers & Filament in Bangladesh",
  description:
    "Bangladesh's premier shop for 3D printers, laser engravers, CNC machines, and premium filament. Shop now with fast delivery.",
};

export default async function HomePage() {
  let categories: CategorySchema[] = [];
  let featured: ProductList[] = [];
  let reviews: ReviewOut[] = [];

  try {
    [categories, featured] = await Promise.all([
      getCategories(),
      getFeaturedProducts(8),
    ]);
  } catch (error) {
    console.warn("Home page data fetch failed:", error);
  }

  try {
    reviews = await getReviews();
  } catch (error) {
    console.warn("Reviews fetch failed:", error);
  }

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

      {/* Customer Reviews Carousel */}
      <ReviewsCarousel reviews={reviews} />

      {/* JSON-LD structured data — injected into <body> (Next.js hoists script tags correctly) */}
      <ReviewsJsonLd reviews={reviews} />
    </>
  );
}

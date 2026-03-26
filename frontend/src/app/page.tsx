import type { Metadata } from "next";
import Link from "next/link";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import ReviewsCarousel from "@/components/home/ReviewsCarousel";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ProductCard } from "@/components/shop/ProductCard";
import { getCategories, getFeaturedProducts, getProducts, getReviews } from "@/lib/api";
import type { CategorySchema, ProductList, ReviewOut } from "@/lib/api-types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prototypebd.com";
const SECTION_LIMIT = 8;

function ReviewsJsonLd({ reviews }: { reviews: ReviewOut[] }) {
  if (reviews.length === 0) return null;
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PrototypeBD",
    url: SITE_URL,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avgRating,
      reviewCount: reviews.length,
      bestRating: "5",
      worstRating: "1",
    },
    review: reviews.map((r) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: r.reviewer_name,
        ...(r.reviewer_title ? { jobTitle: r.reviewer_title } : {}),
      },
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: "5", worstRating: "1" },
      reviewBody: r.content,
      datePublished: r.created_at.split("T")[0],
    })),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

function ProductSection({
  title,
  products,
  seeMoreHref,
}: {
  title: string;
  products: ProductList[];
  seeMoreHref: string;
}) {
  if (products.length === 0) return null;
  return (
    <section className="px-4 md:px-12 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h2
          className="font-semibold uppercase text-gray-500"
          style={{ fontSize: 11, letterSpacing: 4 }}
        >
          {title}
        </h2>
        <Link
          href={seeMoreHref}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors border border-gray-200 rounded-full px-4 py-1.5 hover:border-gray-400"
        >
          See more →
        </Link>
      </div>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
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
  let categoryProducts: { category: CategorySchema; products: ProductList[] }[] = [];

  try {
    [categories, featured] = await Promise.all([
      getCategories(),
      getFeaturedProducts(SECTION_LIMIT),
    ]);
  } catch (error) {
    console.warn("Home page data fetch failed:", error);
  }

  // Fetch 8 products per category in parallel
  if (categories.length > 0) {
    try {
      const results = await Promise.all(
        categories.map((cat) =>
          getProducts({ category: cat.slug, page: 1, page_size: SECTION_LIMIT })
            .then((r) => ({ category: cat, products: r.items }))
            .catch(() => ({ category: cat, products: [] }))
        )
      );
      categoryProducts = results.filter((r) => r.products.length > 0);
    } catch (error) {
      console.warn("Category products fetch failed:", error);
    }
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
      <ProductSection
        title="Featured Products"
        products={featured}
        seeMoreHref="/shop?featured=true"
      />

      {/* Per-category sections */}
      {categoryProducts.map(({ category, products }) => (
        <ProductSection
          key={category.id}
          title={category.name}
          products={products}
          seeMoreHref={`/category/${category.slug}`}
        />
      ))}

      {/* Customer Reviews */}
      <NewsletterSection />
      <ReviewsCarousel reviews={reviews} />
      <ReviewsJsonLd reviews={reviews} />
    </>
  );
}

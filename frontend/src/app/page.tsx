import type { Metadata } from "next";
import { HomeHero } from "@/components/home/HomeHero";
import { TrustBar } from "@/components/home/TrustBar";
import { FeaturedCategoryRow } from "@/components/home/FeaturedCategoryRow";
import { ServiceShowcase } from "@/components/home/ServiceShowcase";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import ReviewsCarousel from "@/components/home/ReviewsCarousel";
import { ContactCTASection } from "@/components/home/ContactCTASection";
import { RecentProjectsGallery } from "@/components/home/RecentProjectsGallery";
import { BlogHighlights } from "@/components/home/BlogHighlights";
import { getCategories, getFeaturedProducts, getProducts, getReviews, getCommunityProjects, getBlogPosts } from "@/lib/api";
import type { CategorySchema, ProductList, ReviewOut, CommunityProject, BlogPostList } from "@/lib/api-types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prototypebd.com";
const SECTION_LIMIT = 8;

function SiteJsonLd({ reviews }: { reviews: ReviewOut[] }) {
  const hasReviews = reviews.length > 0;
  const avgRating = hasReviews
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const organization = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "PrototypeBD",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      "Bangladesh's premier source for 3D printers, laser engravers, CNC machines, and premium filament.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "House 53, Road 05, Sector 01, Block E, Aftab Nagar",
      addressLocality: "Dhaka",
      postalCode: "1212",
      addressCountry: "BD",
    },
    telephone: ["+8801884502768", "+8801970553712"],
    email: "admin@prototypebd.com",
    sameAs: ["https://facebook.com/pbd2.0"],
    ...(hasReviews && avgRating
      ? {
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
        }
      : {}),
  };

  const website = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "PrototypeBD",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/shop?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const schema = { "@context": "https://schema.org", "@graph": [organization, website] };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PrototypeBD — 3D Printers, Laser Engravers & Filament in Bangladesh",
  description:
    "Bangladesh's premier shop for 3D printers, laser engravers, CNC machines, and premium filament. Shop now with fast delivery.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  let categories: CategorySchema[] = [];
  let featured: ProductList[] = [];
  let reviews: ReviewOut[] = [];
  let projects: CommunityProject[] = [];
  let blogPosts: BlogPostList[] = [];
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

  try {
    projects = await getCommunityProjects();
  } catch (error) {
    console.warn("Projects fetch failed:", error);
  }

  try {
    blogPosts = (await getBlogPosts({ page_size: 3 })).items;
  } catch (error) {
    console.warn("Blog posts fetch failed:", error);
  }

  return (
    <div className="pbd-home" style={{ paddingBottom: 64 }}>
      <HomeHero />

      <TrustBar />

      <FeaturedCategoryRow categories={categories} />

      <ServiceShowcase />

      {/* Per-category product carousels (FDM 3D Printer, Filament, Laser, …) */}
      {categoryProducts.map(({ category, products }) => (
        <ProductCarousel
          key={category.id}
          title={category.name}
          products={products}
          viewAllHref={`/category/${category.slug}`}
        />
      ))}

      {/* Popular / featured products */}
      <ProductCarousel
        id="popular"
        title="Popular Products"
        products={featured}
        viewAllHref="/shop?featured=true"
      />

      <BlogHighlights posts={blogPosts} />

      <RecentProjectsGallery projects={projects} />

      <ContactCTASection />
      <ReviewsCarousel reviews={reviews} />
      <SiteJsonLd reviews={reviews} />
    </div>
  );
}

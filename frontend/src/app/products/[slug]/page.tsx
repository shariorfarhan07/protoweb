import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProduct } from "@/lib/api";
import { ImageGallery } from "@/components/product/ImageGallery";
import { FilamentVariants } from "@/components/product/FilamentVariants";
import { AddToCart } from "@/components/product/AddToCart";
import { ProductDescription } from "@/components/product/ProductDescription";
import { CompareToggle } from "@/components/product/CompareToggle";
import { ProductDetailClient } from "./ProductDetailClient";

interface Props {
  params: { slug: string };
}

export const revalidate = 0; // always fetch fresh — admin changes appear immediately

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return {};

  return {
    title: product.meta_title ?? product.name,
    description:
      product.meta_desc ??
      product.short_desc ??
      `Buy ${product.name} in Bangladesh at PrototypeBD`,
    openGraph: {
      title: product.meta_title ?? product.name,
      description: product.meta_desc ?? product.short_desc ?? "",
      images: product.images.length
        ? [{ url: product.images[0].url, alt: product.name }]
        : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_desc ?? product.meta_desc,
    sku: product.sku,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand.name }
      : undefined,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "BDT",
      availability:
        product.stock_qty > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "PrototypeBD" },
    },
    image: product.images.map((img) => img.url),
    aggregateRating: undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-2 text-xs text-gray-400 mb-8"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span>›</span>
          <Link href="/shop" className="hover:text-gray-700">Shop</Link>
          {product.category && (
            <>
              <span>›</span>
              <Link
                href={`/category/${product.category.slug}`}
                className="hover:text-gray-700"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>›</span>
          <span className="text-gray-600">{product.name}</span>
        </nav>

        {/* Main content — client component handles variant state */}
        <ProductDetailClient product={product} />

        {/* Specifications table (for printers / CNC) */}
        {product.specifications &&
          Object.keys(product.specifications).length > 0 && (
            <section className="mt-16">
              <h2
                className="font-semibold uppercase text-xs mb-6"
                style={{ letterSpacing: 3, color: "var(--subtle)" }}
              >
                Specifications
              </h2>
              <div
                className="rounded-2xl overflow-hidden border"
                style={{ borderColor: "var(--border)" }}
              >
                {Object.entries(product.specifications).map(([key, val], i) => (
                  <div
                    key={key}
                    className="flex"
                    style={{
                      borderTop: i > 0 ? `1px solid var(--border)` : undefined,
                    }}
                  >
                    <dt
                      className="w-1/3 py-3.5 px-5 font-medium text-sm text-gray-500"
                      style={{ background: "rgba(0,0,0,0.02)" }}
                    >
                      {key}
                    </dt>
                    <dd className="py-3.5 px-5 text-sm flex-1">{val}</dd>
                  </div>
                ))}
              </div>
            </section>
          )}

        {/* Long description */}
        <ProductDescription html={product.long_desc} />
      </div>
    </>
  );
}

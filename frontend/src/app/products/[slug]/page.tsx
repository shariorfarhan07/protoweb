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
import { ProductComments } from "@/components/product/ProductComments";

interface Props {
  params: { slug: string };
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prototypebd.com";

export const revalidate = 0; // always fetch fresh — admin changes appear immediately

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) {
    return { title: "Product not found", robots: { index: false, follow: false } };
  }

  const canonical = `/products/${product.slug}`;
  const description =
    product.meta_desc ??
    product.short_desc ??
    `Buy ${product.name} in Bangladesh at PrototypeBD`;

  return {
    title: product.meta_title ?? product.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: product.meta_title ?? product.name,
      description,
      url: canonical,
      images: product.images.length
        ? product.images.map((img) => ({ url: img.url, alt: img.alt_text ?? product.name }))
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.meta_title ?? product.name,
      description,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  // Offers valid until end of next year (rolling) — Google recommends priceValidUntil.
  const priceValidUntil = new Date(new Date().getFullYear() + 1, 11, 31)
    .toISOString()
    .split("T")[0];
  const productUrl = `${SITE_URL}/products/${product.slug}`;

  // JSON-LD structured data — Product + Breadcrumb graph
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${productUrl}#product`,
        name: product.name,
        description: product.short_desc ?? product.meta_desc ?? undefined,
        ...(product.sku ? { sku: product.sku, mpn: product.sku } : {}),
        ...(product.brand
          ? { brand: { "@type": "Brand", name: product.brand.name } }
          : {}),
        ...(product.category
          ? { category: product.category.name }
          : {}),
        image: product.images.length
          ? product.images.map((img) => img.url)
          : undefined,
        offers: {
          "@type": "Offer",
          url: productUrl,
          price: product.price,
          priceCurrency: "BDT",
          priceValidUntil,
          itemCondition: "https://schema.org/NewCondition",
          availability:
            product.stock_qty > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          seller: { "@type": "Organization", name: "PrototypeBD" },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
          ...(product.category
            ? [
                {
                  "@type": "ListItem",
                  position: 3,
                  name: product.category.name,
                  item: `${SITE_URL}/category/${product.category.slug}`,
                },
                { "@type": "ListItem", position: 4, name: product.name, item: productUrl },
              ]
            : [{ "@type": "ListItem", position: 3, name: product.name, item: productUrl }]),
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-2 text-xs text-gray-400 mb-6 md:mb-8 flex-wrap"
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
                      className="w-2/5 md:w-1/3 py-3 md:py-3.5 px-4 md:px-5 font-medium text-sm text-gray-500"
                      style={{ background: "rgba(0,0,0,0.02)" }}
                    >
                      {key}
                    </dt>
                    <dd className="py-3 md:py-3.5 px-4 md:px-5 text-sm flex-1">{val}</dd>
                  </div>
                ))}
              </div>
            </section>
          )}

        {/* Long description */}
        <ProductDescription html={product.long_desc} />

        {/* Customer comments (moderated) */}
        <ProductComments slug={product.slug} />
      </div>
    </>
  );
}

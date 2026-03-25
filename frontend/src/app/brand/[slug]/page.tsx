import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBrand, getProducts } from "@/lib/api";
import { ProductCard } from "@/components/shop/ProductCard";

interface Props {
  params: { slug: string };
  searchParams: { page?: string };
}

export const revalidate = 120;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brand = await getBrand(params.slug);
  if (!brand) return {};
  return {
    title: `${brand.name} Products — PrototypeBD`,
    description: brand.description ?? `Shop ${brand.name} products at PrototypeBD Bangladesh`,
  };
}

export default async function BrandPage({ params, searchParams }: Props) {
  const [brand, result] = await Promise.all([
    getBrand(params.slug),
    getProducts({ brand: params.slug, page: Number(searchParams.page ?? 1) }),
  ]);

  if (!brand) notFound();

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span>›</span>
        <Link href="/shop" className="hover:text-gray-700">Shop</Link>
        <span>›</span>
        <span className="text-gray-600">{brand.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        {brand.logo_url && (
          <img src={brand.logo_url} alt={brand.name} className="h-12 object-contain" />
        )}
        <div>
          <h1 className="font-black text-3xl" style={{ letterSpacing: -1 }}>
            {brand.name}
          </h1>
          {brand.description && (
            <p className="text-gray-500 text-sm mt-1">{brand.description}</p>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-6">{result.total} products</p>

      {/* Grid */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
      >
        {result.items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategory, getProducts } from "@/lib/api";
import { ProductCard } from "@/components/shop/ProductCard";
import { Pagination } from "@/components/shop/Pagination";

interface Props {
  params: { slug: string };
  searchParams: { page?: string };
}

export const revalidate = 120;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await getCategory(params.slug);
  if (!cat) return {};
  return {
    title: `${cat.name} — PrototypeBD`,
    description: cat.description ?? `Shop ${cat.name} at PrototypeBD Bangladesh`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [cat, result] = await Promise.all([
    getCategory(params.slug),
    getProducts({ category: params.slug, page: Number(searchParams.page ?? 1) }),
  ]);

  if (!cat) notFound();

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span>›</span>
        <Link href="/shop" className="hover:text-gray-700">Shop</Link>
        <span>›</span>
        <span className="text-gray-600">{cat.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-black text-3xl mb-1" style={{ letterSpacing: -1 }}>
          {cat.name}
        </h1>
        {cat.description && (
          <p className="text-gray-500 text-sm">{cat.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">{result.total} products</p>
      </div>

      {/* Grid */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
      >
        {result.items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {result.total_pages > 1 && (
        <div className="mt-10 text-center text-sm text-gray-400">
          Page {result.page} of {result.total_pages}
        </div>
      )}
    </div>
  );
}

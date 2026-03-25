import type { ProductList } from "@/lib/api-types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: ProductList[];
  loading?: boolean;
}

export function ProductGrid({ products, loading = false }: ProductGridProps) {
  if (loading) {
    return (
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-card overflow-hidden" style={{ aspectRatio: "0.8" }}>
            <div className="skeleton w-full" style={{ aspectRatio: "1" }} />
            <div className="p-4 space-y-2">
              <div className="skeleton h-3 w-1/2 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-2/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-4xl mb-4">🔍</p>
        <p className="font-semibold text-lg mb-2">No products found</p>
        <p className="text-gray-400 text-sm">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

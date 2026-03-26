"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Pagination } from "@/components/shop/Pagination";
import { getBrands, getCategories, getProducts } from "@/lib/api";
import type { BrandSchema, CategorySchema, PaginatedResponse, ProductList } from "@/lib/api-types";

const PAGE_SIZE = 20;

interface Filters {
  category?: string;
  brand?: string;
  product_type?: string;
  min_price?: number;
  max_price?: number;
  material?: string;
  search?: string;
}

export default function ShopPage() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters>(() => {
    const init: Filters = {};
    // Read initial values from URL (e.g. ?search=query or ?product_type=printer)
    const s = searchParams.get("search");
    const pt = searchParams.get("product_type");
    const cat = searchParams.get("category");
    if (s) init.search = s;
    if (pt) init.product_type = pt;
    if (cat) init.category = cat;
    return init;
  });
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResponse<ProductList> | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategorySchema[]>([]);
  const [brands, setBrands] = useState<BrandSchema[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const activeFilterCount = Object.values(filters).filter((v) => v !== undefined && v !== "").length;

  useEffect(() => {
    Promise.all([getCategories(), getBrands()]).then(([cats, brnds]) => {
      setCategories(cats);
      setBrands(brnds);
    });
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts({ ...filters, page, page_size: PAGE_SIZE });
      setResult(data);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // Prevent body scroll when filter drawer is open on mobile
  useEffect(() => {
    document.body.style.overflow = filterOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [filterOpen]);

  function handleFilterChange(newFilters: Filters) {
    setFilters(newFilters);
    setPage(1);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="font-black text-2xl md:text-3xl mb-1" style={{ letterSpacing: -1 }}>
            {filters.search ? `Results for "${filters.search}"` : "Shop"}
          </h1>
          {result && (
            <p className="text-sm text-gray-400">{result.total} product{result.total !== 1 ? "s" : ""}</p>
          )}
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setFilterOpen(true)}
          className="md:hidden flex items-center gap-2 btn-pill-outline btn-pill"
          style={{ fontSize: 13, padding: "8px 16px" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="20" y2="12" />
            <line x1="12" y1="18" x2="20" y2="18" />
          </svg>
          Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
        </button>
      </div>

      {/* ── Mobile filter drawer ─────────────────────────────────────── */}
      {filterOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 md:hidden"
          onClick={() => setFilterOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        className="fixed inset-y-0 left-0 z-50 bg-white flex flex-col md:hidden transition-transform duration-300"
        style={{
          width: "min(320px, 90vw)",
          transform: filterOpen ? "translateX(0)" : "translateX(-100%)",
          boxShadow: filterOpen ? "8px 0 40px rgba(0,0,0,0.12)" : "none",
        }}
        aria-label="Filters"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <span className="font-bold text-base">Filters</span>
          <button onClick={() => setFilterOpen(false)} aria-label="Close filters" className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <FilterSidebar
            categories={categories}
            brands={brands}
            filters={filters}
            onChange={(f) => { handleFilterChange(f); }}
          />
        </div>
        <div className="px-5 py-4 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => setFilterOpen(false)}
            className="btn-pill w-full"
            style={{ fontSize: 13 }}
          >
            Show Results{result ? ` (${result.total})` : ""}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <FilterSidebar
            categories={categories}
            brands={brands}
            filters={filters}
            onChange={handleFilterChange}
          />
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          <ProductGrid products={result?.items ?? []} loading={loading} />
          {result && (
            <Pagination
              page={page}
              totalPages={result.total_pages}
              onPageChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

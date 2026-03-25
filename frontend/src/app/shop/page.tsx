"use client";

import { useCallback, useEffect, useState } from "react";
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
}

export default function ShopPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResponse<ProductList> | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategorySchema[]>([]);
  const [brands, setBrands] = useState<BrandSchema[]>([]);

  // Load static data once
  useEffect(() => {
    Promise.all([getCategories(), getBrands()]).then(([cats, brnds]) => {
      setCategories(cats);
      setBrands(brnds);
    });
  }, []);

  // Load products when filters/page change
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts({ ...filters, page, page_size: PAGE_SIZE });
      setResult(data);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function handleFilterChange(newFilters: Filters) {
    setFilters(newFilters);
    setPage(1);
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-black text-3xl mb-1" style={{ letterSpacing: -1 }}>
          Shop
        </h1>
        {result && (
          <p className="text-sm text-gray-400">
            {result.total} product{result.total !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0">
          <FilterSidebar
            categories={categories}
            brands={brands}
            filters={filters}
            onChange={handleFilterChange}
          />
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          <ProductGrid
            products={result?.items ?? []}
            loading={loading}
          />
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

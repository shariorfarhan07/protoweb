"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { adminListProducts, deleteProduct, getCategories } from "@/lib/api";
import type { CategorySchema, PaginatedResponse, ProductList } from "@/lib/api-types";
import { buildImageUrl } from "@/lib/utils";

const TH = "px-5 py-3 text-left font-medium uppercase tracking-widest whitespace-nowrap";
const TD = "px-5 py-3.5 align-middle";

const PRODUCT_TYPES = [
  { value: "printer",  label: "3D Printer" },
  { value: "filament", label: "Filament" },
  { value: "cnc",      label: "CNC / Laser" },
  { value: "printed",  label: "3D Printed" },
];

const inputStyle: React.CSSProperties = {
  border: "1px solid #e5e5e5",
  background: "#fff",
  color: "#111",
  fontSize: 13,
};

export default function AdminProductsPage() {
  const [data, setData]       = useState<PaginatedResponse<ProductList> | null>(null);
  const [categories, setCategories] = useState<CategorySchema[]>([]);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Filters
  const [search,      setSearch]      = useState("");
  const [productType, setProductType] = useState("");
  const [category,    setCategory]    = useState("");
  const [stockFilter, setStockFilter] = useState("");   // "" | "low" | "out"
  const [activeFilter, setActiveFilter] = useState(""); // "" | "true" | "false"
  const [featuredFilter, setFeaturedFilter] = useState(""); // "" | "true"

  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeSearch   = useRef("");

  // Load categories once
  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async (searchVal: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminListProducts({
        search: searchVal || undefined,
        product_type: productType || undefined,
        category: category || undefined,
        is_active: activeFilter === "" ? undefined : activeFilter === "true",
        is_featured: featuredFilter === "true" ? true : undefined,
        low_stock: stockFilter === "low" ? true : undefined,
        page,
        page_size: 20,
      });
      // client-side "out of stock" filter (backend doesn't have exact 0 filter)
      if (stockFilter === "out") {
        result.items = result.items.filter((p) => p.stock_qty === 0);
      }
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [productType, category, activeFilter, featuredFilter, stockFilter, page]);

  // Re-fetch when non-search filters or page change
  useEffect(() => {
    fetchProducts(activeSearch.current);
  }, [fetchProducts]);

  function handleSearchChange(val: string) {
    setSearch(val);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      activeSearch.current = val;
      setPage(1);
      fetchProducts(val);
    }, 350);
  }

  function handleFilterChange<T>(setter: (v: T) => void, val: T) {
    setter(val);
    setPage(1);
  }

  function clearFilters() {
    setSearch(""); setProductType(""); setCategory("");
    setStockFilter(""); setActiveFilter(""); setFeaturedFilter("");
    activeSearch.current = "";
    setPage(1);
  }

  const hasFilters = search || productType || category || stockFilter || activeFilter || featuredFilter;

  async function handleDelete(productId: number, name: string) {
    if (!confirm(`Deactivate "${name}"? It will be hidden from the store.`)) return;
    setDeletingId(productId);
    try {
      await deleteProduct(productId);
      setData((prev) =>
        prev ? { ...prev, items: prev.items.filter((p) => p.id !== productId), total: prev.total - 1 } : prev
      );
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "#111" }}>Products</h1>
          <p style={{ color: "#aaa", fontSize: 13 }} className="mt-1">
            {loading ? "Loading…" : `${data?.total ?? 0} product${data?.total !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="text-sm font-medium rounded-lg px-4 py-2 transition"
          style={{ background: "#111", color: "#fff" }}
        >
          + Add Product
        </Link>
      </div>

      {/* Search + Filters bar */}
      <div className="rounded-2xl p-4 mb-4 flex flex-wrap gap-3 items-end"
        style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#999" }}>Search</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#bbb" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Name or SKU…"
              className="w-full rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Product Type */}
        <div className="min-w-[140px]">
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#999" }}>Type</label>
          <select
            value={productType}
            onChange={(e) => handleFilterChange(setProductType, e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={inputStyle}
          >
            <option value="">All types</option>
            {PRODUCT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="min-w-[150px]">
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#999" }}>Category</label>
          <select
            value={category}
            onChange={(e) => handleFilterChange(setCategory, e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={inputStyle}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Stock */}
        <div className="min-w-[130px]">
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#999" }}>Stock</label>
          <select
            value={stockFilter}
            onChange={(e) => handleFilterChange(setStockFilter, e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={inputStyle}
          >
            <option value="">All stock</option>
            <option value="low">Low stock (≤5)</option>
            <option value="out">Out of stock</option>
          </select>
        </div>

        {/* Status */}
        <div className="min-w-[120px]">
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#999" }}>Status</label>
          <select
            value={activeFilter}
            onChange={(e) => handleFilterChange(setActiveFilter, e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={inputStyle}
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Featured toggle */}
        <div className="flex items-end pb-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm"
            style={{ color: featuredFilter ? "#111" : "#777" }}>
            <input
              type="checkbox"
              checked={featuredFilter === "true"}
              onChange={(e) => handleFilterChange(setFeaturedFilter, e.target.checked ? "true" : "")}
              className="rounded"
            />
            Featured only
          </label>
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-medium px-3 py-2 rounded-lg transition self-end"
            style={{ color: "#e5484d", background: "#fff1f1" }}
          >
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <div className="mb-5 rounded-xl px-4 py-3 text-sm"
          style={{ background: "#fff1f1", color: "#c92a2a", border: "1px solid #ffd6d6" }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <table className="w-full text-sm">
          <thead style={{ borderBottom: "1px solid #f0f0f0" }}>
            <tr>
              <th className={TH} style={{ fontSize: 10, color: "#bbb" }}>Product</th>
              <th className={TH} style={{ fontSize: 10, color: "#bbb" }}>Type</th>
              <th className={TH} style={{ fontSize: 10, color: "#bbb" }}>Category</th>
              <th className={TH + " text-right"} style={{ fontSize: 10, color: "#bbb" }}>Price</th>
              <th className={TH + " text-center"} style={{ fontSize: 10, color: "#bbb" }}>Stock</th>
              <th className={TH + " text-center"} style={{ fontSize: 10, color: "#bbb" }}>Status</th>
              <th className={TH + " text-center"} style={{ fontSize: 10, color: "#bbb" }}>Featured</th>
              <th className={TH} style={{ fontSize: 10, color: "#bbb" }} />
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f7f7f7" }}>
                {Array.from({ length: 8 }).map((_, j) => (
                  <td key={j} className={TD}>
                    <div className="h-3.5 rounded-full animate-pulse"
                      style={{ background: "#f0f0f0", width: j === 0 ? "140px" : "60px" }} />
                  </td>
                ))}
              </tr>
            ))}

            {!loading && data?.items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center text-sm" style={{ color: "#bbb" }}>
                  {hasFilters ? (
                    <>No products match your filters. <button onClick={clearFilters} style={{ color: "#111", textDecoration: "underline" }}>Clear filters</button></>
                  ) : (
                    <>No products found. <Link href="/admin/products/new" style={{ color: "#111", textDecoration: "underline" }}>Add the first one.</Link></>
                  )}
                </td>
              </tr>
            )}

            {!loading && data?.items.map((product) => (
              <tr
                key={product.id}
                className="transition-colors"
                style={{ borderBottom: "1px solid #f7f7f7" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fafaf8")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}
              >
                <td className={TD}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                      style={{ background: "#f5f5f5" }}
                    >
                      {product.primary_image && (
                        <Image
                          src={buildImageUrl(product.primary_image)}
                          alt={product.name}
                          width={40} height={40}
                          className="object-contain w-full h-full p-1"
                          unoptimized
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium line-clamp-1" style={{ color: "#111" }}>{product.name}</p>
                      <p style={{ fontSize: 12, color: "#bbb" }}>{product.brand?.name ?? "—"}</p>
                    </div>
                  </div>
                </td>

                <td className={TD + " capitalize"} style={{ color: "#777" }}>
                  {PRODUCT_TYPES.find(t => t.value === product.product_type)?.label ?? product.product_type}
                </td>

                <td className={TD} style={{ color: "#777" }}>{product.category?.name ?? "—"}</td>

                <td className={TD + " text-right font-semibold"} style={{ color: "#111" }}>
                  ৳{product.price.toLocaleString()}
                </td>

                <td className={TD + " text-center"}>
                  <span
                    className="font-semibold text-sm"
                    style={{ color: product.stock_qty === 0 ? "#e5484d" : product.stock_qty <= 5 ? "#f59e0b" : "#111" }}
                  >
                    {product.stock_qty}
                  </span>
                </td>

                <td className={TD + " text-center"}>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: product.stock_qty > 0 ? "#dcfce7" : "#f5f5f5",
                      color: product.stock_qty > 0 ? "#16a34a" : "#aaa",
                    }}
                  >
                    {product.stock_qty > 0 ? "In stock" : "Out"}
                  </span>
                </td>

                <td className={TD + " text-center"}>
                  {product.is_featured ? (
                    <span style={{ color: "#f59e0b", fontSize: 16 }}>★</span>
                  ) : (
                    <span style={{ color: "#e0e0e0", fontSize: 16 }}>★</span>
                  )}
                </td>

                <td className={TD}>
                  <div className="flex items-center gap-2 justify-end">
                    <Link
                      href={`/products/${product.slug}`}
                      target="_blank"
                      className="text-xs font-medium px-3 py-1.5 rounded-lg transition"
                      style={{ background: "#f5f5f5", color: "#555" }}
                      title="View in store"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg transition"
                      style={{ background: "#f5f5f5", color: "#333" }}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      disabled={deletingId === product.id}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-40"
                      style={{ background: "#fff1f1", color: "#c92a2a" }}
                    >
                      {deletingId === product.id ? "…" : "Remove"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination data={data} page={page} setPage={setPage} />
    </div>
  );
}

function Pagination({
  data, page, setPage,
}: {
  data: PaginatedResponse<unknown> | null;
  page: number;
  setPage: (fn: (p: number) => number) => void;
}) {
  if (!data || data.total_pages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-5">
      <p style={{ fontSize: 12, color: "#aaa" }}>
        Page {data.page} of {data.total_pages} · {data.total} results
      </p>
      <div className="flex gap-2">
        {(["Previous", "Next"] as const).map((label) => {
          const disabled = label === "Previous" ? page <= 1 : page >= data.total_pages;
          return (
            <button key={label}
              onClick={() => setPage((p) => label === "Previous" ? Math.max(1, p - 1) : Math.min(data.total_pages, p + 1))}
              disabled={disabled}
              className="text-xs rounded-lg px-3 py-1.5 transition font-medium disabled:opacity-30"
              style={{ border: "1px solid #e0e0e0", background: "#fff", color: "#333" }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

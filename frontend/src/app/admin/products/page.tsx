"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAdminInventory, deleteProduct } from "@/lib/api";
import type { PaginatedResponse, ProductList } from "@/lib/api-types";
import { buildImageUrl } from "@/lib/utils";

const TH = "px-5 py-3 text-left font-medium uppercase tracking-widest whitespace-nowrap";
const TD = "px-5 py-3.5 align-middle";

export default function AdminProductsPage() {
  const [data, setData] = useState<PaginatedResponse<ProductList> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminInventory({ page, page_size: 20 });
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  async function handleDelete(productId: number, name: string) {
    if (!confirm(`Deactivate "${name}"? It will be hidden from the store.`)) return;
    setDeletingId(productId);
    try {
      await deleteProduct(productId);
      setData((prev) =>
        prev ? { ...prev, items: prev.items.filter((p) => p.id !== productId) } : prev
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
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "#111" }}>Products</h1>
          <p style={{ color: "#aaa", fontSize: 13 }} className="mt-1">
            {data ? `${data.total} active products` : "Loading…"}
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

      {error && (
        <div className="mb-5 rounded-xl px-4 py-3 text-sm"
          style={{ background: "#fff1f1", color: "#c92a2a", border: "1px solid #ffd6d6" }}>
          {error}
        </div>
      )}

      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <table className="w-full text-sm">
          <thead style={{ borderBottom: "1px solid #f0f0f0" }}>
            <tr>
              <th className={TH} style={{ fontSize: 10, color: "#bbb" }}>Product</th>
              <th className={TH} style={{ fontSize: 10, color: "#bbb" }}>Type</th>
              <th className={TH} style={{ fontSize: 10, color: "#bbb" }}>Category</th>
              <th className={TH + " text-right"} style={{ fontSize: 10, color: "#bbb" }}>Price</th>
              <th className={TH + " text-center"} style={{ fontSize: 10, color: "#bbb" }}>Stock</th>
              <th className={TH + " text-center"} style={{ fontSize: 10, color: "#bbb" }}>Featured</th>
              <th className={TH} style={{ fontSize: 10, color: "#bbb" }} />
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f7f7f7" }}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className={TD}>
                    <div className="h-3.5 rounded-full animate-pulse"
                      style={{ background: "#f0f0f0", width: j === 0 ? "140px" : "60px" }} />
                  </td>
                ))}
              </tr>
            ))}

            {!loading && data?.items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-sm" style={{ color: "#bbb" }}>
                  No products found.{" "}
                  <Link href="/admin/products/new" style={{ color: "#111", textDecoration: "underline" }}>
                    Add the first one.
                  </Link>
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
                          width={40}
                          height={40}
                          className="object-contain w-full h-full p-1"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium line-clamp-1" style={{ color: "#111" }}>{product.name}</p>
                      <p style={{ fontSize: 12, color: "#bbb" }}>{product.brand?.name ?? "—"}</p>
                    </div>
                  </div>
                </td>
                <td className={TD + " capitalize"} style={{ color: "#777" }}>{product.product_type}</td>
                <td className={TD} style={{ color: "#777" }}>{product.category?.name ?? "—"}</td>
                <td className={TD + " text-right font-semibold"} style={{ color: "#111" }}>
                  ৳{product.price.toLocaleString()}
                </td>
                <td className={TD + " text-center"}>
                  <span
                    className="font-semibold text-sm"
                    style={{ color: product.stock_qty <= 5 ? "#e5484d" : "#111" }}
                  >
                    {product.stock_qty}
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
      <p style={{ fontSize: 12, color: "#aaa" }}>Page {data.page} of {data.total_pages}</p>
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

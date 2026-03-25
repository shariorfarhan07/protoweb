"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAdminInventory, deleteProduct } from "@/lib/api";
import type { PaginatedResponse, ProductList } from "@/lib/api-types";

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
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data ? `${data.total} active products` : "Loading…"}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 hover:bg-gray-700 transition"
        >
          + Add Product
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Price</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Stock</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Featured</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading && data?.items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  No products found.{" "}
                  <Link href="/admin/products/new" className="text-blue-600 hover:underline">
                    Add the first one.
                  </Link>
                </td>
              </tr>
            )}
            {!loading &&
              data?.items.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.primary_image ? (
                        <Image
                          src={product.primary_image}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded-md object-cover bg-gray-100 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-gray-100 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.brand?.name ?? "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-600">{product.product_type}</td>
                  <td className="px-4 py-3 text-gray-600">{product.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    ৳{product.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold text-sm ${product.stock_qty <= 5 ? "text-red-600" : "text-gray-900"}`}>
                      {product.stock_qty}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {product.is_featured ? (
                      <span className="text-amber-500 text-base">★</span>
                    ) : (
                      <span className="text-gray-300 text-base">☆</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-xs font-medium px-2.5 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deletingId === product.id}
                        className="text-xs font-medium px-2.5 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-40"
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

      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-gray-500">Page {data.page} of {data.total_pages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              disabled={page >= data.total_pages}
              className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

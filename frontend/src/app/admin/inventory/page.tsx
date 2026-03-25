"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { getAdminInventory, updateStock } from "@/lib/api";
import type { PaginatedResponse, ProductList } from "@/lib/api-types";

const LOW_STOCK = 5;

export default function AdminInventoryPage() {
  const [data, setData] = useState<PaginatedResponse<ProductList> | null>(null);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Map productId → editing stock value
  const [editingStock, setEditingStock] = useState<Record<number, number>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminInventory({
        low_stock_only: lowStockOnly || undefined,
        page,
        page_size: 20,
      });
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [lowStockOnly, page]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  async function handleSaveStock(productId: number) {
    const newQty = editingStock[productId];
    if (newQty === undefined) return;
    setSavingId(productId);
    try {
      const result = await updateStock(productId, newQty);
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((p) =>
                p.id === result.id ? { ...p, stock_qty: result.stock_qty } : p
              ),
            }
          : prev
      );
      setEditingStock((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Inventory</h1>
      <p className="text-sm text-gray-500 mb-6">
        {data ? `${data.total} products` : "Loading…"}
      </p>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-5">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => {
              setLowStockOnly(e.target.checked);
              setPage(1);
            }}
            className="rounded"
          />
          Show low stock only (≤{LOW_STOCK} units)
        </label>
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
              <th className="text-left px-4 py-3 font-semibold text-gray-600">SKU</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Price</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Stock</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Update Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading && data?.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No products found
                </td>
              </tr>
            )}
            {!loading &&
              data?.items.map((product) => {
                const productId = product.id;
                const isLow = product.stock_qty <= LOW_STOCK;
                const isEditing = productId in editingStock;
                return (
                  <tr key={productId} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.primary_image ? (
                          <Image
                            src={product.primary_image}
                            alt={product.name}
                            width={36}
                            height={36}
                            className="rounded-md object-cover bg-gray-100"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-md bg-gray-100" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {product.brand?.name ?? "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {product.sku ?? "—"}
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600">
                      {product.product_type}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      ৳{product.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`font-bold text-sm ${
                          isLow ? "text-red-600" : "text-gray-900"
                        }`}
                      >
                        {product.stock_qty}
                      </span>
                      {isLow && (
                        <span className="ml-1.5 text-xs text-red-500">Low</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={editingStock[productId] ?? product.stock_qty}
                          onChange={(e) =>
                            setEditingStock((prev) => ({
                              ...prev,
                              [productId]: parseInt(e.target.value, 10) || 0,
                            }))
                          }
                          className="w-20 rounded-md border border-gray-200 text-sm px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleSaveStock(productId)}
                          disabled={
                            savingId === productId ||
                            editingStock[productId] === undefined ||
                            editingStock[productId] === product.stock_qty
                          }
                          className="rounded-md bg-gray-900 text-white text-xs px-3 py-1.5 hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {savingId === productId ? "Saving…" : "Save"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-gray-500">
            Page {data.page} of {data.total_pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              disabled={page >= data.total_pages}
              className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

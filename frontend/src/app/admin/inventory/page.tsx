"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { getAdminInventory, updateStock } from "@/lib/api";
import type { PaginatedResponse, ProductList, ProductDetail } from "@/lib/api-types";
import { buildImageUrl } from "@/lib/utils";

const LOW_STOCK = 5;
const TH = "px-5 py-3 text-left font-medium uppercase tracking-widest whitespace-nowrap";
const TD = "px-5 py-3.5 align-middle";

export default function AdminInventoryPage() {
  const [data, setData] = useState<PaginatedResponse<ProductList> | null>(null);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<Record<number, number>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminInventory({ low_stock_only: lowStockOnly || undefined, page, page_size: 20 });
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [lowStockOnly, page]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  async function handleSaveStock(productId: number) {
    const newQty = editingStock[productId];
    if (newQty === undefined) return;
    setSavingId(productId);
    try {
      const result = await updateStock(productId, newQty);
      setData((prev) =>
        prev
          ? { ...prev, items: prev.items.map((p) => p.id === result.id ? { ...p, stock_qty: result.stock_qty } : p) }
          : prev
      );
      setEditingStock((prev) => { const next = { ...prev }; delete next[productId]; return next; });
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="p-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "#111" }}>Inventory</h1>
          <p style={{ color: "#aaa", fontSize: 13 }} className="mt-1">
            {data ? `${data.total} products` : "Loading…"}
          </p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none" style={{ fontSize: 13, color: "#555" }}>
          <span
            onClick={() => { setLowStockOnly((v) => !v); setPage(1); }}
            className="relative inline-flex items-center cursor-pointer"
          >
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => { setLowStockOnly(e.target.checked); setPage(1); }}
              className="sr-only peer"
            />
            <div
              className="w-9 h-5 rounded-full transition-colors peer-checked:bg-red-500"
              style={{ background: lowStockOnly ? undefined : "#e0e0e0" }}
            />
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
          </span>
          Low stock only
        </label>
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
              {["Product", "SKU", "Type", "Price", "Stock", "Update"].map((h, i) => (
                <th key={i} className={TH + (i === 3 ? " text-right" : i === 4 ? " text-center" : "")}
                  style={{ fontSize: 10, color: "#bbb" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f7f7f7" }}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} className={TD}>
                    <div className="h-3.5 rounded-full animate-pulse" style={{ background: "#f0f0f0", width: j === 0 ? "140px" : "60px" }} />
                  </td>
                ))}
              </tr>
            ))}

            {!loading && data?.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-sm" style={{ color: "#bbb" }}>
                  No products found
                </td>
              </tr>
            )}

            {!loading && data?.items.map((product) => {
              const id = product.id;
              const isLow = product.stock_qty <= LOW_STOCK;
              const isEditing = id in editingStock;

              return (
                <tr
                  key={id}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid #f7f7f7" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fafaf8")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}
                >
                  <td className={TD}>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                        style={{ background: "#f5f5f5" }}
                      >
                        {product.primary_image ? (
                          <Image
                            src={buildImageUrl(product.primary_image)}
                            alt={product.name}
                            width={36}
                            height={36}
                            className="object-contain w-full h-full p-1"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-medium line-clamp-1" style={{ color: "#111" }}>{product.name}</p>
                        <p style={{ fontSize: 12, color: "#bbb" }}>{product.brand?.name ?? "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className={TD}>
                    <span className="font-mono text-xs" style={{ color: "#aaa" }}>{(product as ProductDetail).sku ?? "—"}</span>
                  </td>
                  <td className={TD + " capitalize"} style={{ color: "#777" }}>{product.product_type}</td>
                  <td className={TD + " text-right font-semibold"} style={{ color: "#111" }}>
                    ৳{product.price.toLocaleString()}
                  </td>
                  <td className={TD + " text-center"}>
                    <span
                      className="font-semibold text-sm"
                      style={{ color: isLow ? "#e5484d" : "#111" }}
                    >
                      {product.stock_qty}
                    </span>
                    {isLow && (
                      <span
                        className="ml-1.5 text-xs rounded-full px-1.5 py-0.5"
                        style={{ background: "#fff1f1", color: "#e5484d", fontSize: 10 }}
                      >
                        Low
                      </span>
                    )}
                  </td>
                  <td className={TD}>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={editingStock[id] ?? product.stock_qty}
                        onChange={(e) => setEditingStock((prev) => ({ ...prev, [id]: parseInt(e.target.value, 10) || 0 }))}
                        className="w-20 text-sm text-center rounded-lg px-2 py-1.5 focus:outline-none transition"
                        style={{ border: "1px solid #e0e0e0", color: "#111" }}
                      />
                      <button
                        onClick={() => handleSaveStock(id)}
                        disabled={savingId === id || !isEditing || editingStock[id] === product.stock_qty}
                        className="text-xs font-medium rounded-lg px-3 py-1.5 transition disabled:opacity-30"
                        style={{ background: "#111", color: "#fff" }}
                      >
                        {savingId === id ? "…" : "Save"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLowStockProducts } from "@/lib/api";
import type { LowStockItem, LowStockStatus } from "@/lib/api-types";

const STATUS_STYLE: Record<LowStockStatus, { bg: string; color: string; label: string }> = {
  critical: { bg: "#fff1f1", color: "#c92a2a", label: "Critical" },
  low: { bg: "#fff8ed", color: "#c45b00", label: "Low" },
  normal: { bg: "#edfff5", color: "#1a7a45", label: "Normal" },
};

const TH = "px-4 py-2.5 text-left font-medium uppercase tracking-widest whitespace-nowrap";
const TD = "px-4 py-3 align-middle";

export function LowStockWidget() {
  const [items, setItems] = useState<LowStockItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLowStockProducts(50)
      .then(setItems)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold tracking-tight" style={{ color: "#111", fontSize: 15 }}>
            Low Stock Products
          </h3>
          <p style={{ fontSize: 12, color: "#aaa" }} className="mt-0.5">
            At or below reorder level
          </p>
        </div>
        {items && items.length > 0 && (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "#fff1f1", color: "#c92a2a" }}
          >
            {items.length} need{items.length === 1 ? "s" : ""} attention
          </span>
        )}
      </div>

      {error && (
        <p className="px-6 pb-6 text-sm" style={{ color: "#e5484d" }}>{error}</p>
      )}

      {items === null && !error && (
        <div className="px-6 pb-6 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-9 rounded-lg animate-pulse" style={{ background: "#f4f4f2" }} />
          ))}
        </div>
      )}

      {items && items.length === 0 && (
        <p className="px-6 pb-8 pt-2 text-sm" style={{ color: "#1a7a45" }}>
          ✓ All products are above their reorder level.
        </p>
      )}

      {items && items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ borderBottom: "1px solid #f0f0f0" }}>
              <tr>
                <th className={TH} style={{ fontSize: 10, color: "#bbb" }}>Product</th>
                <th className={TH} style={{ fontSize: 10, color: "#bbb" }}>SKU</th>
                <th className={TH + " text-center"} style={{ fontSize: 10, color: "#bbb" }}>Stock</th>
                <th className={TH + " text-center"} style={{ fontSize: 10, color: "#bbb" }}>Reorder</th>
                <th className={TH + " text-center"} style={{ fontSize: 10, color: "#bbb" }}>Status</th>
                <th className={TH} style={{ fontSize: 10, color: "#bbb" }} />
              </tr>
            </thead>
            <tbody>
              {items.map((p) => {
                const st = STATUS_STYLE[p.status];
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f7f7f7" }}>
                    <td className={TD}>
                      <span className="font-medium line-clamp-1" style={{ color: "#111" }}>{p.name}</span>
                    </td>
                    <td className={TD} style={{ color: "#999", fontSize: 12 }}>{p.sku || "—"}</td>
                    <td className={TD + " text-center font-semibold"}
                      style={{ color: p.stock_qty === 0 ? "#c92a2a" : "#111" }}>
                      {p.stock_qty}
                    </td>
                    <td className={TD + " text-center"} style={{ color: "#777" }}>{p.reorder_level}</td>
                    <td className={TD + " text-center"}>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                    <td className={TD + " text-right"}>
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg transition"
                        style={{ background: "#f5f5f5", color: "#333" }}
                      >
                        Restock
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

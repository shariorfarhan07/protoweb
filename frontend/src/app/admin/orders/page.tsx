"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminOrders, updateOrderStatus } from "@/lib/api";
import type { OrderOut, OrderStatus, PaginatedResponse } from "@/lib/api-types";
import { InvoiceModal } from "@/components/admin/InvoiceModal";

const ORDER_STATUSES: OrderStatus[] = [
  "pending", "confirmed", "processing", "shipped", "delivered", "cancelled",
];

const STATUS_STYLE: Record<OrderStatus, { bg: string; color: string }> = {
  pending:    { bg: "#fff8ed", color: "#c45b00" },
  confirmed:  { bg: "#edf6ff", color: "#0070c9" },
  processing: { bg: "#f0edff", color: "#6e40c9" },
  shipped:    { bg: "#f5eeff", color: "#8b3fcf" },
  delivered:  { bg: "#edfff5", color: "#1a7a45" },
  cancelled:  { bg: "#fff1f1", color: "#c92a2a" },
};

// Per-status row tint + colored left accent (and a slightly stronger hover tint).
const ROW_STYLE: Record<OrderStatus, { tint: string; accent: string; hover: string }> = {
  pending:    { tint: "#fffaf2", accent: "#f0a020", hover: "#fff3e0" },
  confirmed:  { tint: "#f5f9ff", accent: "#0070c9", hover: "#e8f3ff" },
  processing: { tint: "#f8f6ff", accent: "#6e40c9", hover: "#efeaff" },
  shipped:    { tint: "#faf6ff", accent: "#8b3fcf", hover: "#f2e8ff" },
  delivered:  { tint: "#f3fff8", accent: "#1a7a45", hover: "#e6fbef" },
  cancelled:  { tint: "#fff6f6", accent: "#c92a2a", hover: "#ffecec" },
};
const ROW_FALLBACK = { tint: "#fff", accent: "#e0e0e0", hover: "#fafaf8" };

const TH = "px-5 py-3 text-left font-medium uppercase tracking-widest whitespace-nowrap";
const TD = "px-5 py-3.5 align-middle";

export default function AdminOrdersPage() {
  const [data, setData] = useState<PaginatedResponse<OrderOut> | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<OrderOut | null>(null);

  // Prefill the search from a ?search= deep link (e.g. dashboard "Pending Orders" actions).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("search");
    if (q) {
      setSearchInput(q);
      setSearch(q);
    }
  }, []);

  // Debounce the search box → reset to page 1 when the query changes.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminOrders({
        status: filterStatus || undefined,
        search: search || undefined,
        page,
        page_size: 20,
      });
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function handleStatusChange(orderId: number, newStatus: string) {
    setUpdatingId(orderId);
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setData((prev) =>
        prev ? { ...prev, items: prev.items.map((o) => (o.id === updated.id ? updated : o)) } : prev
      );
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="p-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "#111" }}>Orders</h1>
          <p style={{ color: "#aaa", fontSize: 13 }} className="mt-1">
            {data ? `${data.total} orders` : "Loading…"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <svg
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search order #, name or phone"
              className="text-sm rounded-lg pl-9 pr-8 py-2 focus:outline-none"
              style={{ border: "1px solid #e0e0e0", background: "#fff", color: "#333", width: 260 }}
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="text-sm rounded-lg px-3 py-2 transition focus:outline-none"
            style={{ border: "1px solid #e0e0e0", background: "#fff", color: "#333" }}
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl px-4 py-3 text-sm" style={{ background: "#fff1f1", color: "#c92a2a", border: "1px solid #ffd6d6" }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <table className="w-full text-sm">
          <thead style={{ borderBottom: "1px solid #f0f0f0" }}>
            <tr>
              <th className={TH} style={{ fontSize: 10, color: "#bbb" }}>Order #</th>
              <th className={TH} style={{ fontSize: 10, color: "#bbb" }}>Customer</th>
              <th className={TH} style={{ fontSize: 10, color: "#bbb" }}>Items</th>
              <th className={TH + " text-right"} style={{ fontSize: 10, color: "#bbb" }}>Total</th>
              <th className={TH} style={{ fontSize: 10, color: "#bbb" }}>Status</th>
              <th className={TH} style={{ fontSize: 10, color: "#bbb" }}>Date</th>
              <th className={TH} style={{ fontSize: 10, color: "#bbb" }}>Update</th>
              <th className={TH} style={{ fontSize: 10, color: "#bbb" }}>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f7f7f7" }}>
                {Array.from({ length: 8 }).map((_, j) => (
                  <td key={j} className={TD}>
                    <div className="h-3.5 rounded-full animate-pulse" style={{ background: "#f0f0f0", width: j === 1 ? "120px" : "60px" }} />
                  </td>
                ))}
              </tr>
            ))}

            {!loading && data?.items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center text-sm" style={{ color: "#bbb" }}>
                  No orders found
                </td>
              </tr>
            )}

            {!loading && data?.items.map((order) => {
              const addr = order.shipping_address;
              const s = order.status as OrderStatus;
              const row = ROW_STYLE[s] ?? ROW_FALLBACK;
              return (
                <tr
                  key={order.id}
                  className="transition-colors"
                  style={{
                    borderBottom: "1px solid #f1f1f1",
                    borderLeft: `3px solid ${row.accent}`,
                    background: row.tint,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = row.hover)}
                  onMouseLeave={e => (e.currentTarget.style.background = row.tint)}
                >
                  <td className={TD}>
                    <span className="font-mono text-xs font-medium" style={{ color: "#555" }}>
                      {order.order_number}
                    </span>
                  </td>
                  <td className={TD}>
                    <p className="font-medium" style={{ color: "#111" }}>{addr.first_name} {addr.last_name}</p>
                    <p style={{ fontSize: 12, color: "#bbb" }}>{addr.email}</p>
                  </td>
                  <td className={TD} style={{ color: "#777" }}>
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </td>
                  <td className={TD + " text-right font-semibold"} style={{ color: "#111" }}>
                    ৳{order.total_price.toLocaleString()}
                  </td>
                  <td className={TD}>
                    <span
                      className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
                      style={{
                        background: (STATUS_STYLE[s] ?? { bg: "#f5f5f5" }).bg,
                        color: (STATUS_STYLE[s] ?? { color: "#555" }).color,
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className={TD} style={{ fontSize: 12, color: "#aaa" }}>
                    {new Date(order.created_at).toLocaleDateString("en-BD")}
                  </td>
                  <td className={TD}>
                    <select
                      defaultValue={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-xs rounded-lg px-2 py-1.5 transition focus:outline-none disabled:opacity-40"
                      style={{ border: "1px solid #e0e0e0", background: "#fff", color: "#333" }}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td className={TD}>
                    <button
                      onClick={() => setInvoiceOrder(order)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg transition"
                      style={{ border: "1px solid #e0e0e0", background: "#fff", color: "#333" }}
                      title="View / print invoice"
                    >
                      Invoice
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination data={data} page={page} setPage={setPage} />

      {invoiceOrder && (
        <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
      )}
    </div>
  );
}

function Pagination({
  data,
  page,
  setPage,
}: {
  data: PaginatedResponse<unknown> | null;
  page: number;
  setPage: (fn: (p: number) => number) => void;
}) {
  if (!data || data.total_pages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-5">
      <p style={{ fontSize: 12, color: "#aaa" }}>
        Page {data.page} of {data.total_pages}
      </p>
      <div className="flex gap-2">
        {(["Previous", "Next"] as const).map((label) => {
          const disabled = label === "Previous" ? page <= 1 : page >= data.total_pages;
          return (
            <button
              key={label}
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

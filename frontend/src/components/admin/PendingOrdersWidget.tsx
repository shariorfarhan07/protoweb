"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPendingOrders } from "@/lib/api";
import type { PendingOrderItem } from "@/lib/api-types";

const STATUS_COLOR: Record<string, string> = {
  pending: "#c45b00",
  confirmed: "#0070c9",
  processing: "#6e40c9",
};

const TH = "px-4 py-2.5 text-left font-medium uppercase tracking-widest whitespace-nowrap";
const TD = "px-4 py-3 align-middle";

function taka(n: number): string {
  return `৳${n.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

export function PendingOrdersWidget() {
  const [items, setItems] = useState<PendingOrderItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPendingOrders()
      .then(setItems)
      .catch((e) => setError(e.message));
  }, []);

  const overdueCount = items?.filter((o) => o.is_overdue).length ?? 0;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold tracking-tight" style={{ color: "#111", fontSize: 15 }}>
            Pending Orders
          </h3>
          <p style={{ fontSize: 12, color: "#aaa" }} className="mt-0.5">
            Unfulfilled orders · oldest first
          </p>
        </div>
        {overdueCount > 0 && (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "#fff1f1", color: "#c92a2a" }}
          >
            {overdueCount} overdue
          </span>
        )}
      </div>

      {error && <p className="px-6 pb-6 text-sm" style={{ color: "#e5484d" }}>{error}</p>}

      {items === null && !error && (
        <div className="px-6 pb-6 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-9 rounded-lg animate-pulse" style={{ background: "#f4f4f2" }} />
          ))}
        </div>
      )}

      {items && items.length === 0 && (
        <p className="px-6 pb-8 pt-2 text-sm" style={{ color: "#1a7a45" }}>
          ✓ No unfulfilled orders. All caught up.
        </p>
      )}

      {items && items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ borderBottom: "1px solid #f0f0f0" }}>
              <tr>
                <th className={TH} style={{ fontSize: 10, color: "#bbb" }}>Order</th>
                <th className={TH} style={{ fontSize: 10, color: "#bbb" }}>Customer</th>
                <th className={TH} style={{ fontSize: 10, color: "#bbb" }}>Date</th>
                <th className={TH + " text-center"} style={{ fontSize: 10, color: "#bbb" }}>Pending</th>
                <th className={TH + " text-right"} style={{ fontSize: 10, color: "#bbb" }}>Value</th>
                <th className={TH + " text-center"} style={{ fontSize: 10, color: "#bbb" }}>Status</th>
                <th className={TH} style={{ fontSize: 10, color: "#bbb" }} />
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr
                  key={o.id}
                  style={{
                    borderBottom: "1px solid #f7f7f7",
                    background: o.is_overdue ? "#fff8f8" : undefined,
                    borderLeft: o.is_overdue ? "3px solid #e5484d" : "3px solid transparent",
                  }}
                >
                  <td className={TD + " font-medium"} style={{ color: "#111" }}>
                    #{o.id}
                    <span className="block" style={{ fontSize: 11, color: "#bbb" }}>{o.order_number}</span>
                  </td>
                  <td className={TD} style={{ color: "#444" }}>{o.customer_name}</td>
                  <td className={TD} style={{ color: "#999", fontSize: 12 }}>{o.order_date}</td>
                  <td className={TD + " text-center"}>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: o.is_overdue ? "#fff1f1" : "#f4f4f2",
                        color: o.is_overdue ? "#c92a2a" : "#777",
                      }}
                      title={o.is_overdue ? "Overdue" : undefined}
                    >
                      {o.pending_days}d{o.is_overdue ? " ⚠" : ""}
                    </span>
                  </td>
                  <td className={TD + " text-right font-semibold"} style={{ color: "#111" }}>
                    {taka(o.order_value)}
                  </td>
                  <td className={TD + " text-center capitalize"}>
                    <span style={{ color: STATUS_COLOR[o.status] ?? "#777", fontWeight: 600, fontSize: 12.5 }}>
                      {o.status}
                    </span>
                  </td>
                  <td className={TD + " text-right"}>
                    <Link
                      href={`/admin/orders?search=${encodeURIComponent(o.order_number)}`}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg transition"
                      style={{ background: "#111", color: "#fff" }}
                    >
                      Process
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

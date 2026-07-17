"use client";

import { useEffect } from "react";
import type { OrderOut, OrderStatus } from "@/lib/api-types";

/* Seller details — shown in the invoice header. */
const COMPANY = {
  name: "PrototypeBD",
  tagline: "3D Printers · Laser Engravers · Filament",
  address: "House 53, Road 05, Sector 01, Block E, Aftab Nagar, Dhaka 1212",
  phone: "+880 1884-502768",
  email: "admin@prototypebd.com",
  web: "prototypebd.com",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const PAYMENT_LABEL: Record<string, string> = {
  cod: "Cash on Delivery",
  card: "Card",
  bkash: "bKash",
  nagad: "Nagad",
  bank: "Bank Transfer",
};

function taka(n: number): string {
  return `৳${n.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function InvoiceModal({ order, onClose }: { order: OrderOut; onClose: () => void }) {
  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const addr = order.shipping_address;
  const itemsSubtotal = order.items.reduce((sum, it) => sum + it.subtotal, 0);
  // Any gap between line-item subtotals and the charged total is shipping/handling.
  const shipping = Math.round((order.total_price - itemsSubtotal) * 100) / 100;
  const customerName = [addr.first_name, addr.last_name].filter(Boolean).join(" ") || "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto invoice-overlay"
      style={{ background: "rgba(17,17,17,0.45)" }}
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toolbar — not printed */}
        <div className="no-print flex items-center justify-between mb-3 px-1">
          <button
            onClick={onClose}
            className="text-sm font-medium px-3 py-1.5 rounded-lg transition"
            style={{ background: "#fff", color: "#333" }}
          >
            ← Close
          </button>
          <button
            onClick={() => window.print()}
            className="text-sm font-semibold px-4 py-1.5 rounded-lg transition"
            style={{ background: "#111", color: "#fff" }}
          >
            Print / Save as PDF
          </button>
        </div>

        {/* Invoice paper */}
        <div
          id="invoice-print-area"
          className="rounded-2xl"
          style={{ background: "#fff", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", padding: "44px 48px", color: "#111" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between" style={{ borderBottom: "2px solid #111", paddingBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>{COMPANY.name}</h1>
              <p style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{COMPANY.tagline}</p>
              <p style={{ fontSize: 11.5, color: "#666", marginTop: 10, maxWidth: 260, lineHeight: 1.5 }}>
                {COMPANY.address}
              </p>
              <p style={{ fontSize: 11.5, color: "#666", marginTop: 4 }}>
                {COMPANY.phone} · {COMPANY.email}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.04em", color: "#111" }}>INVOICE</h2>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#444", marginTop: 6 }}>{order.order_number}</p>
              <p style={{ fontSize: 11.5, color: "#888", marginTop: 8 }}>Issued {fmtDate(order.created_at)}</p>
              <span
                className="inline-block mt-2"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 10px",
                  borderRadius: 999,
                  border: "1px solid #ddd",
                  color: "#444",
                }}
              >
                {STATUS_LABEL[order.status] ?? order.status}
              </span>
            </div>
          </div>

          {/* Bill to + payment */}
          <div className="flex justify-between" style={{ marginTop: 26, gap: 24 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "#aaa", textTransform: "uppercase" }}>
                Bill To
              </p>
              <p style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>{customerName}</p>
              <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6, marginTop: 2 }}>
                {addr.address}
                {addr.address ? <br /> : null}
                {[addr.city, addr.postal].filter(Boolean).join(" ")}
                <br />
                {addr.phone}
                {addr.email ? <><br />{addr.email}</> : null}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "#aaa", textTransform: "uppercase" }}>
                Payment
              </p>
              <p style={{ fontSize: 13, color: "#333", marginTop: 6 }}>
                {PAYMENT_LABEL[order.payment_method] ?? order.payment_method}
              </p>
              <p style={{ fontSize: 12, color: "#888", marginTop: 2, textTransform: "capitalize" }}>
                {order.payment_status}
              </p>
            </div>
          </div>

          {/* Line items */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 28 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
                <th style={{ textAlign: "left", fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 0 8px" }}>Item</th>
                <th style={{ textAlign: "center", fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 0 8px" }}>Qty</th>
                <th style={{ textAlign: "right", fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 0 8px" }}>Unit Price</th>
                <th style={{ textAlign: "right", fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 0 8px" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.id} style={{ borderBottom: "1px solid #f2f2f2" }}>
                  <td style={{ padding: "11px 0", fontSize: 13 }}>
                    <span style={{ fontWeight: 500 }}>{it.product_name}</span>
                    {it.product_sku && (
                      <span style={{ display: "block", fontSize: 11, color: "#aaa" }}>SKU: {it.product_sku}</span>
                    )}
                  </td>
                  <td style={{ padding: "11px 0", fontSize: 13, textAlign: "center", color: "#555" }}>{it.quantity}</td>
                  <td style={{ padding: "11px 0", fontSize: 13, textAlign: "right", color: "#555" }}>{taka(it.unit_price)}</td>
                  <td style={{ padding: "11px 0", fontSize: 13, textAlign: "right", fontWeight: 500 }}>{taka(it.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end" style={{ marginTop: 18 }}>
            <div style={{ width: 240 }}>
              <div className="flex justify-between" style={{ fontSize: 13, color: "#555", padding: "4px 0" }}>
                <span>Subtotal</span>
                <span>{taka(itemsSubtotal)}</span>
              </div>
              {shipping !== 0 && (
                <div className="flex justify-between" style={{ fontSize: 13, color: "#555", padding: "4px 0" }}>
                  <span>{shipping > 0 ? "Shipping / Handling" : "Discount"}</span>
                  <span>{taka(shipping)}</span>
                </div>
              )}
              <div
                className="flex justify-between"
                style={{ fontSize: 15, fontWeight: 700, padding: "10px 0 0", marginTop: 6, borderTop: "2px solid #111" }}
              >
                <span>Total</span>
                <span>{taka(order.total_price)}</span>
              </div>
            </div>
          </div>

          {/* Notes + footer */}
          {order.notes && (
            <div style={{ marginTop: 28 }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "#aaa", textTransform: "uppercase" }}>Notes</p>
              <p style={{ fontSize: 12, color: "#555", marginTop: 4, lineHeight: 1.6 }}>{order.notes}</p>
            </div>
          )}
          <div style={{ marginTop: 40, paddingTop: 16, borderTop: "1px solid #eee", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "#888" }}>Thank you for your order!</p>
            <p style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{COMPANY.web} · This is a computer-generated invoice.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

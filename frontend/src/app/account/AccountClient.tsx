"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { getMyOrders } from "@/lib/api";
import type { OrderOut, OrderStatus } from "@/lib/api-types";
import { formatPrice } from "@/lib/utils";

// ── Status presentation ──────────────────────────────────────────────────────

const STATUS_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

const STATUS_META: Record<
  OrderStatus,
  { label: string; color: string; bg: string }
> = {
  pending:    { label: "Pending",    color: "#92600a", bg: "#fef3c7" },
  confirmed:  { label: "Confirmed",  color: "#1e40af", bg: "#dbeafe" },
  processing: { label: "Processing", color: "#5b21b6", bg: "#ede9fe" },
  shipped:    { label: "Shipped",    color: "#0e7490", bg: "#cffafe" },
  delivered:  { label: "Delivered",  color: "#166534", bg: "#dcfce7" },
  cancelled:  { label: "Cancelled",  color: "#b91c1c", bg: "#fee2e2" },
};

const PAYMENT_META: Record<string, { label: string; color: string }> = {
  unpaid:   { label: "Unpaid",   color: "#92600a" },
  paid:     { label: "Paid",     color: "#166534" },
  refunded: { label: "Refunded", color: "#b91c1c" },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
      style={{ background: m.bg, color: m.color }}
    >
      {m.label}
    </span>
  );
}

function StatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div
        className="rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2"
        style={{ background: "#fee2e2", color: "#b91c1c" }}
      >
        <span>⛔</span> This order was cancelled.
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(status);

  return (
    <div className="flex items-center">
      {STATUS_FLOW.map((step, i) => {
        const done = i <= currentIndex;
        const m = STATUS_META[step];
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors"
                style={{
                  background: done ? m.color : "#e5e7eb",
                  color: done ? "#fff" : "#9ca3af",
                }}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-center"
                style={{ color: done ? m.color : "#9ca3af", letterSpacing: 0.5 }}
              >
                {m.label}
              </span>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div
                className="h-0.5 flex-1 mx-1 mb-4 rounded"
                style={{ background: i < currentIndex ? m.color : "#e5e7eb" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Order card ───────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function OrderCard({ order }: { order: OrderOut }) {
  const [open, setOpen] = useState(false);
  const itemCount = order.items.reduce((n, it) => n + it.quantity, 0);
  const pay = PAYMENT_META[order.payment_status] ?? {
    label: order.payment_status,
    color: "#666",
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #eceef1" }}>
      {/* Header row */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 py-4 flex flex-wrap items-center gap-x-4 gap-y-2"
        aria-expanded={open}
      >
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 font-mono" style={{ fontSize: 14 }}>
            {order.order_number}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {fmtDate(order.created_at)} · {itemCount} item{itemCount !== 1 ? "s" : ""}
          </p>
        </div>
        <StatusBadge status={order.status} />
        <div className="text-right">
          <p className="font-black text-gray-900" style={{ fontSize: 15 }}>
            {formatPrice(order.total_price)}
          </p>
        </div>
        <span
          className="text-gray-400 transition-transform shrink-0"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        >
          ▾
        </span>
      </button>

      {/* Detail */}
      {open && (
        <div className="px-5 pb-5 pt-1" style={{ borderTop: "1px solid #f1f2f4" }}>
          {/* Timeline */}
          <div className="py-5">
            <StatusTimeline status={order.status} />
          </div>

          {/* Items */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #f1f2f4" }}>
            {order.items.map((it, idx) => (
              <div
                key={it.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderTop: idx === 0 ? "none" : "1px solid #f6f7f8" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{it.product_name}</p>
                  <p className="text-xs text-gray-400">
                    {formatPrice(it.unit_price)} × {it.quantity}
                  </p>
                </div>
                <p className="text-sm font-bold text-gray-900 shrink-0">
                  {formatPrice(it.subtotal)}
                </p>
              </div>
            ))}
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1.5">
                Shipping to
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {[order.shipping_address.first_name, order.shipping_address.last_name]
                  .filter(Boolean)
                  .join(" ")}
                <br />
                {order.shipping_address.address}
                {order.shipping_address.city ? `, ${order.shipping_address.city}` : ""}
                {order.shipping_address.postal ? ` ${order.shipping_address.postal}` : ""}
                {order.shipping_address.phone ? (
                  <>
                    <br />
                    {order.shipping_address.phone}
                  </>
                ) : null}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1.5">
                Payment
              </p>
              <p className="text-sm text-gray-700">
                {order.payment_method === "cod"
                  ? "Cash on Delivery"
                  : order.payment_method.toUpperCase()}{" "}
                ·{" "}
                <span className="font-semibold" style={{ color: pay.color }}>
                  {pay.label}
                </span>
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Need to change or cancel this order?{" "}
            <Link href="/contact-us" className="font-semibold" style={{ color: "#f2890e" }}>
              Contact us
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AccountClient() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.accessToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<OrderOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !token) return;
    let active = true;
    setLoading(true);
    getMyOrders(1, 50)
      .then((res) => {
        if (active) setOrders(res.items);
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : "Failed to load orders.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [mounted, token]);

  // Avoid hydration mismatch from persisted auth state
  if (!mounted) {
    return <div style={{ minHeight: 320 }} />;
  }

  // Not signed in
  if (!token || !user) {
    return (
      <div className="text-center bg-white rounded-2xl p-10" style={{ border: "1px solid #eceef1" }}>
        <p className="text-5xl mb-4">🔒</p>
        <h2 className="font-bold text-lg text-gray-900 mb-2">Sign in to view your orders</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
          Track the status of your orders and review your purchase history.
        </p>
        <Link
          href="/login?next=/account"
          className="inline-flex items-center rounded-full px-6 py-3 text-sm font-bold text-white"
          style={{ background: "#1b1e23" }}
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Account header */}
      <div className="bg-white rounded-2xl p-6 mb-6 flex flex-wrap items-center gap-4" style={{ border: "1px solid #eceef1" }}>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black shrink-0"
          style={{ background: "linear-gradient(135deg,#fbab4d,#f2890e)", fontSize: 18 }}
        >
          {(user.first_name?.[0] ?? user.email[0] ?? "?").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900">
            {[user.first_name, user.last_name].filter(Boolean).join(" ") || "My account"}
          </p>
          <p className="text-sm text-gray-400 truncate">{user.email}</p>
        </div>
        <button
          onClick={() => clearAuth()}
          className="rounded-full px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          style={{ border: "1px solid #e4e6ea" }}
        >
          Sign out
        </button>
      </div>

      <h2 className="font-extrabold text-gray-900 mb-4" style={{ fontSize: 20, letterSpacing: -0.5 }}>
        My orders
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl h-20 animate-pulse"
              style={{ border: "1px solid #eceef1" }}
            />
          ))}
        </div>
      ) : error ? (
        <div
          className="rounded-xl border p-4 text-sm"
          style={{ borderColor: "#fca5a5", background: "#fef2f2", color: "#dc2626" }}
        >
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center bg-white rounded-2xl p-10" style={{ border: "1px solid #eceef1" }}>
          <p className="text-5xl mb-4">📦</p>
          <h3 className="font-bold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-sm text-gray-500 mb-6">When you place an order, it&apos;ll show up here.</p>
          <Link
            href="/shop"
            className="inline-flex items-center rounded-full px-6 py-3 text-sm font-bold text-white"
            style={{ background: "linear-gradient(90deg,#fbab4d,#f2890e)" }}
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}

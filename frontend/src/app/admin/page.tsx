"use client";

import { useEffect, useState } from "react";
import { getAdminStats } from "@/lib/api";
import type { AdminStatsOut } from "@/lib/api-types";
import { MetricsChart } from "@/components/admin/MetricsChart";
import { LowStockWidget } from "@/components/admin/LowStockWidget";
import { PendingOrdersWidget } from "@/components/admin/PendingOrdersWidget";

type Tone = "neutral" | "warning" | "danger";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  tone?: Tone;
  accent: string;
  icon: React.ReactNode;
}

function StatCard({ label, value, sub, tone = "neutral", accent, icon }: StatCardProps) {
  const toneColor = tone === "danger" ? "#e5484d" : tone === "warning" ? "#f76b15" : "#aaa";
  return (
    <div
      className="group rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200"
      style={{
        background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        border: "1px solid #f0f0ee",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 10px 28px rgba(17,17,17,0.10)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div className="flex items-start justify-between">
        <p className="uppercase tracking-widest font-semibold" style={{ fontSize: 10, color: "#aaa" }}>
          {label}
        </p>
        <span
          className="flex items-center justify-center rounded-xl shrink-0"
          style={{ width: 34, height: 34, background: `${accent}15`, color: accent }}
        >
          {icon}
        </span>
      </div>
      <p className="text-2xl sm:text-3xl font-semibold tracking-tight leading-none" style={{ color: "#111" }}>
        {value}
      </p>
      {sub && (
        <p className="flex items-center gap-1.5" style={{ fontSize: 11.5, color: toneColor }}>
          {tone !== "neutral" && (
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: toneColor }} />
          )}
          {sub}
        </p>
      )}
    </div>
  );
}

const ICONS = {
  orders: (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
      <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  clock: (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  revenue: (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
      <path d="M10 5.5C10 4.7 9 4 8 4S6 4.7 6 5.5 7 7 8 7s2 .7 2 1.5S9 10 8 10s-2-.7-2-1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8 3v1M8 10v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth="1.3" opacity=".4" />
    </svg>
  ),
  users: (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 13.5c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  alert: (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
      <path d="M8 2.2 14.2 13H1.8L8 2.2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 6.5v3M8 11.2v.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStatsOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString("en-BD", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight" style={{ color: "#111" }}>
            Dashboard
          </h1>
          <p style={{ color: "#aaa", fontSize: 13 }} className="mt-1">
            Store overview
          </p>
        </div>
        <span
          className="hidden sm:inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium"
          style={{ background: "#fff", border: "1px solid #ededeb", color: "#888" }}
        >
          {today}
        </span>
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[120px] rounded-2xl animate-pulse" style={{ background: "#efefed" }} />
          ))}
        </div>
      )}

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ background: "#fff1f1", color: "#e5484d", border: "1px solid #ffd6d6" }}
        >
          {error}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          <StatCard label="Total Orders" value={stats.total_orders.toLocaleString()} accent="#3b82f6" icon={ICONS.orders} />
          <StatCard
            label="Pending"
            value={stats.pending_orders.toLocaleString()}
            sub="Awaiting confirmation"
            tone={stats.pending_orders > 0 ? "warning" : "neutral"}
            accent="#f59e0b"
            icon={ICONS.clock}
          />
          <StatCard
            label="Revenue"
            value={`৳${stats.total_revenue.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`}
            sub="Excl. cancelled"
            accent="#16a34a"
            icon={ICONS.revenue}
          />
          <StatCard label="Users" value={stats.total_users.toLocaleString()} accent="#8b5cf6" icon={ICONS.users} />
          <StatCard
            label="Low Stock"
            value={stats.low_stock_count.toLocaleString()}
            sub="≤5 units remaining"
            tone={stats.low_stock_count > 0 ? "danger" : "neutral"}
            accent="#ef4444"
            icon={ICONS.alert}
          />
        </div>
      )}

      {/* Selectable monthly metric chart */}
      <div className="mt-5 sm:mt-6">
        <MetricsChart />
      </div>

      {/* Operational widgets */}
      <div className="mt-5 sm:mt-6 grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
        <LowStockWidget />
        <PendingOrdersWidget />
      </div>
    </div>
  );
}

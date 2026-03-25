"use client";

import { useEffect, useState } from "react";
import { getAdminStats } from "@/lib/api";
import type { AdminStatsOut } from "@/lib/api-types";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "default" | "warning" | "danger";
}

function StatCard({ label, value, sub, accent = "default" }: StatCardProps) {
  const accentClass =
    accent === "danger"
      ? "border-red-200 bg-red-50"
      : accent === "warning"
      ? "border-amber-200 bg-amber-50"
      : "border-gray-200 bg-white";

  return (
    <div className={`rounded-xl border p-5 ${accentClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
        {label}
      </p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-8">Overview of store activity</p>

      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total Orders" value={stats.total_orders} />
          <StatCard
            label="Pending Orders"
            value={stats.pending_orders}
            sub="Awaiting confirmation"
            accent={stats.pending_orders > 0 ? "warning" : "default"}
          />
          <StatCard
            label="Total Revenue"
            value={`৳${stats.total_revenue.toLocaleString("en-BD", {
              maximumFractionDigits: 0,
            })}`}
            sub="Excludes cancelled orders"
          />
          <StatCard label="Total Users" value={stats.total_users} />
          <StatCard
            label="Low Stock Products"
            value={stats.low_stock_count}
            sub="5 units or fewer"
            accent={stats.low_stock_count > 0 ? "danger" : "default"}
          />
        </div>
      )}
    </div>
  );
}

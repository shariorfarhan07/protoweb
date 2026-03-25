"use client";

import { useEffect, useState } from "react";
import { getAdminStats } from "@/lib/api";
import type { AdminStatsOut } from "@/lib/api-types";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "neutral" | "warning" | "danger";
}

function StatCard({ label, value, sub, tone = "neutral" }: StatCardProps) {
  const dot =
    tone === "danger" ? "#e5484d" : tone === "warning" ? "#f76b15" : "transparent";

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-1"
      style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        {tone !== "neutral" && (
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
        )}
        <p
          className="uppercase tracking-widest font-medium"
          style={{ fontSize: 10, color: "#aaa" }}
        >
          {label}
        </p>
      </div>
      <p className="text-3xl font-semibold tracking-tight" style={{ color: "#111" }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 12, color: "#aaa" }}>{sub}</p>}
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
    <div className="p-10 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "#111" }}>
          Dashboard
        </h1>
        <p style={{ color: "#aaa", fontSize: 13 }} className="mt-1">
          Store overview
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl animate-pulse"
              style={{ background: "#efefed" }}
            />
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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total Orders" value={stats.total_orders} />
          <StatCard
            label="Pending"
            value={stats.pending_orders}
            sub="Awaiting confirmation"
            tone={stats.pending_orders > 0 ? "warning" : "neutral"}
          />
          <StatCard
            label="Revenue"
            value={`৳${stats.total_revenue.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`}
            sub="Excl. cancelled"
          />
          <StatCard label="Users" value={stats.total_users} />
          <StatCard
            label="Low Stock"
            value={stats.low_stock_count}
            sub="≤5 units remaining"
            tone={stats.low_stock_count > 0 ? "danger" : "neutral"}
          />
        </div>
      )}
    </div>
  );
}

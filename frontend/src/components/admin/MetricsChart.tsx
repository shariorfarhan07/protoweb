"use client";

import { useEffect, useMemo, useState } from "react";
import { getDashboardMetrics } from "@/lib/api";
import type { DashboardMetricsOut, MetricPoint } from "@/lib/api-types";

type MetricKey = "revenue" | "profit" | "orders" | "avg_order_value" | "customers" | "units";

interface MetricDef {
  key: MetricKey;
  label: string;
  kind: "currency" | "count";
  color: string;
}

const METRICS: MetricDef[] = [
  { key: "revenue", label: "Revenue", kind: "currency", color: "#f2890e" },
  { key: "profit", label: "Gross Profit (est.)", kind: "currency", color: "#16a34a" },
  { key: "orders", label: "Orders", kind: "count", color: "#3b82f6" },
  { key: "avg_order_value", label: "Avg Order Value", kind: "currency", color: "#8b5cf6" },
  { key: "customers", label: "New Customers", kind: "count", color: "#0ea5e9" },
  { key: "units", label: "Inventory Movement", kind: "count", color: "#ef4444" },
];

const RANGES: { label: string; months: number }[] = [
  { label: "Current Month", months: 1 },
  { label: "Last 3 Months", months: 3 },
  { label: "Last 6 Months", months: 6 },
  { label: "Last 12 Months", months: 12 },
];

function fmt(value: number, kind: "currency" | "count"): string {
  if (kind === "currency") {
    if (Math.abs(value) >= 1000)
      return `৳${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
    return `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
  }
  return value.toLocaleString("en-BD");
}

function fmtFull(value: number, kind: "currency" | "count"): string {
  return kind === "currency"
    ? `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`
    : value.toLocaleString("en-BD");
}

function niceCeil(v: number): number {
  if (v <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const norm = v / mag;
  const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return step * mag;
}

/* ── Dependency-free SVG bar chart ─────────────────────────────────────── */
function BarChart({ points, def }: { points: MetricPoint[]; def: MetricDef }) {
  const W = 760;
  const H = 280;
  const padL = 56;
  const padR = 16;
  const padT = 16;
  const padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const values = points.map((p) => p[def.key] as number);
  const max = Math.max(...values, 1);
  const niceMax = niceCeil(max);
  const n = points.length;

  const slot = chartW / Math.max(n, 1);
  const barW = Math.min(64, slot * 0.62);
  const gridLines = 4;
  const labelEvery = n > 8 ? 2 : 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`${def.label} per month`}>
      {/* Y gridlines + labels */}
      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const val = (niceMax / gridLines) * (gridLines - i);
        const gy = padT + (chartH / gridLines) * i;
        return (
          <g key={i}>
            <line x1={padL} y1={gy} x2={W - padR} y2={gy} stroke="#eef0f2" strokeWidth="1" />
            <text x={padL - 8} y={gy + 4} textAnchor="end" fontSize="10" fill="#aaa">
              {fmt(val, def.kind)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {points.map((p, i) => {
        const v = p[def.key] as number;
        const h = (v / niceMax) * chartH;
        const cx = padL + slot * i + slot / 2;
        const bx = cx - barW / 2;
        const by = padT + chartH - h;
        return (
          <g key={p.period}>
            {h > 0 && (
              <rect x={bx} y={by} width={barW} height={h} rx={5} fill={def.color} opacity={0.9}>
                <title>{`${p.label}: ${fmtFull(v, def.kind)}`}</title>
              </rect>
            )}
            {i % labelEvery === 0 && (
              <text x={cx} y={H - 14} textAnchor="middle" fontSize="10" fill="#999">
                {p.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function MetricsChart() {
  const [metric, setMetric] = useState<MetricKey>("revenue");
  const [months, setMonths] = useState(12);
  const [data, setData] = useState<DashboardMetricsOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDashboardMetrics(months)
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setError(null);
        }
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [months]);

  const def = METRICS.find((m) => m.key === metric)!;

  const total = useMemo(() => {
    if (!data) return 0;
    if (metric === "avg_order_value") {
      const rev = data.points.reduce((s, p) => s + p.revenue, 0);
      const ord = data.points.reduce((s, p) => s + p.orders, 0);
      return ord ? rev / ord : 0;
    }
    return data.points.reduce((s, p) => s + (p[metric] as number), 0);
  }, [data, metric]);

  return (
    <div className="rounded-2xl p-6" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="font-semibold tracking-tight" style={{ color: "#111", fontSize: 15 }}>
            {def.label}
          </h3>
          <p style={{ fontSize: 12, color: "#aaa" }} className="mt-0.5">
            {metric === "avg_order_value" ? "Period average" : "Period total"}:{" "}
            <span style={{ color: "#444", fontWeight: 600 }}>{fmtFull(total, def.kind)}</span>
            {metric === "profit" && data
              ? ` · est. at ${Math.round(data.profit_margin * 100)}% margin`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as MetricKey)}
            className="rounded-lg px-3 py-1.5 text-sm"
            style={{ border: "1px solid #e5e5e5", background: "#fafafa", color: "#111" }}
            aria-label="Metric"
          >
            {METRICS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="rounded-lg px-3 py-1.5 text-sm"
            style={{ border: "1px solid #e5e5e5", background: "#fafafa", color: "#111" }}
            aria-label="Time range"
          >
            {RANGES.map((r) => (
              <option key={r.months} value={r.months}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#fff1f1", color: "#e5484d" }}>
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="h-64 rounded-xl animate-pulse" style={{ background: "#f4f4f2" }} />
      )}

      {data && (
        <div style={{ opacity: loading ? 0.55 : 1, transition: "opacity 0.2s" }}>
          <BarChart points={data.points} def={def} />
        </div>
      )}
    </div>
  );
}

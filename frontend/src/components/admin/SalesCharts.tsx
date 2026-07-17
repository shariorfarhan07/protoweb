"use client";

import type { SalesSummaryOut, SalesPoint, StatusCount } from "@/lib/api-types";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#6366f1",
  shipped: "#0ea5e9",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};

function taka(n: number): string {
  if (n >= 1000) return `৳${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `৳${n.toLocaleString("en-BD")}`;
}

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div className="mb-5">
        <h3 className="font-semibold tracking-tight" style={{ color: "#111", fontSize: 15 }}>{title}</h3>
        {sub && <p style={{ fontSize: 12, color: "#aaa" }} className="mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

/* ── Revenue area chart (dependency-free SVG) ──────────────────────────── */
function RevenueChart({ data }: { data: SalesPoint[] }) {
  const W = 760;
  const H = 260;
  const padL = 52;
  const padR = 16;
  const padT = 16;
  const padB = 34;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxRev = Math.max(...data.map((d) => d.revenue), 1);
  // Round the axis ceiling up to a "nice" number.
  const niceMax = niceCeil(maxRev);

  const n = data.length;
  const x = (i: number) => padL + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW);
  const y = (v: number) => padT + chartH - (v / niceMax) * chartH;

  const linePts = data.map((d, i) => `${x(i)},${y(d.revenue)}`).join(" ");
  const areaPath =
    `M ${x(0)},${padT + chartH} ` +
    data.map((d, i) => `L ${x(i)},${y(d.revenue)}`).join(" ") +
    ` L ${x(n - 1)},${padT + chartH} Z`;

  const gridLines = 4;
  const labelEvery = n > 8 ? 2 : 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Monthly revenue trend">
      <defs>
        <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2890e" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#f2890e" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y gridlines + labels */}
      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const val = (niceMax / gridLines) * (gridLines - i);
        const gy = padT + (chartH / gridLines) * i;
        return (
          <g key={i}>
            <line x1={padL} y1={gy} x2={W - padR} y2={gy} stroke="#eef0f2" strokeWidth="1" />
            <text x={padL - 8} y={gy + 4} textAnchor="end" fontSize="10" fill="#aaa">
              {taka(val)}
            </text>
          </g>
        );
      })}

      {/* Area + line */}
      <path d={areaPath} fill="url(#revFill)" />
      <polyline points={linePts} fill="none" stroke="#f2890e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {/* Dots + x labels */}
      {data.map((d, i) => (
        <g key={d.period}>
          <circle cx={x(i)} cy={y(d.revenue)} r={d.revenue > 0 ? 3.5 : 0} fill="#fff" stroke="#f2890e" strokeWidth="2">
            <title>{`${d.label}: ৳${d.revenue.toLocaleString("en-BD")} · ${d.orders} orders`}</title>
          </circle>
          {i % labelEvery === 0 && (
            <text x={x(i)} y={H - 12} textAnchor="middle" fontSize="10" fill="#999">
              {d.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

/* ── Orders by status (horizontal bars) ────────────────────────────────── */
function StatusBars({ data }: { data: StatusCount[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return <p style={{ fontSize: 13, color: "#aaa" }}>No orders yet.</p>;
  const sorted = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((d) => {
        const pct = Math.round((d.count / total) * 100);
        const color = STATUS_COLORS[d.status] ?? "#9ca3af";
        return (
          <div key={d.status}>
            <div className="flex items-center justify-between mb-1">
              <span className="capitalize" style={{ fontSize: 12.5, color: "#444", fontWeight: 600 }}>
                {d.status}
              </span>
              <span style={{ fontSize: 12, color: "#999" }}>
                {d.count} · {pct}%
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 100, background: "#f0f1f3", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", borderRadius: 100, background: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function niceCeil(v: number): number {
  if (v <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const norm = v / mag;
  const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return step * mag;
}

export function SalesCharts({ summary }: { summary: SalesSummaryOut }) {
  const peak = summary.monthly.reduce((m, d) => Math.max(m, d.revenue), 0);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
      <div className="lg:col-span-2">
        <Card
          title="Revenue — last 12 months"
          sub={peak > 0 ? `Peak month: ৳${peak.toLocaleString("en-BD")}` : "No sales recorded yet"}
        >
          <RevenueChart data={summary.monthly} />
        </Card>
      </div>
      <Card title="Orders by status" sub={`${summary.total_orders} total orders`}>
        <StatusBars data={summary.by_status} />
      </Card>
    </div>
  );
}

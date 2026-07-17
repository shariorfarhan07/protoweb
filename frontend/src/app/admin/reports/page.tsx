"use client";

import { useEffect, useState, useCallback } from "react";
import { getSalesReport } from "@/lib/api";
import type { SalesReportOut } from "@/lib/api-types";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function taka(n: number): string {
  return `৳${n.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

const QUICK = [
  { label: "Last 7 days", start: () => daysAgoISO(7) },
  { label: "Last 30 days", start: () => daysAgoISO(30) },
  { label: "Last 90 days", start: () => daysAgoISO(90) },
  { label: "Year to date", start: () => `${new Date().getFullYear()}-01-01` },
];

function downloadCSV(report: SalesReportOut) {
  const rows: string[] = [];
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

  rows.push(`Sales Report,${report.start} to ${report.end}`);
  rows.push("");
  rows.push("Summary");
  rows.push(`Total Revenue,${report.summary.total_revenue}`);
  rows.push(`Total Orders,${report.summary.total_orders}`);
  rows.push(`Units Sold,${report.summary.units_sold}`);
  rows.push(`Avg Order Value,${report.summary.avg_order_value}`);
  rows.push("");
  rows.push("Daily Breakdown");
  rows.push("Date,Orders,Revenue");
  report.daily.forEach((d) => rows.push(`${d.date},${d.orders},${d.revenue}`));
  rows.push("");
  rows.push("Orders by Status");
  rows.push("Status,Count,Revenue");
  report.by_status.forEach((s) => rows.push(`${esc(s.status)},${s.count},${s.revenue}`));
  rows.push("");
  rows.push("Top Products");
  rows.push("Product,Quantity,Revenue");
  report.top_products.forEach((p) =>
    rows.push(`${esc(p.product_name)},${p.quantity},${p.revenue}`)
  );

  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sales-report_${report.start}_to_${report.end}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <p className="uppercase tracking-widest font-medium" style={{ fontSize: 10, color: "#aaa" }}>{label}</p>
      <p className="text-2xl font-semibold tracking-tight mt-2" style={{ color: "#111" }}>{value}</p>
    </div>
  );
}

function Table({ title, head, rows }: { title: string; head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <h3 className="font-semibold tracking-tight mb-4" style={{ color: "#111", fontSize: 15 }}>{title}</h3>
      {rows.length === 0 ? (
        <p style={{ fontSize: 13, color: "#aaa" }}>No data in this range.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: "#999", textAlign: "left" }}>
                {head.map((h, i) => (
                  <th key={h} className="pb-2 font-medium" style={{ textAlign: i === 0 ? "left" : "right" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} style={{ borderTop: "1px solid #f0f0ee" }}>
                  {r.map((c, ci) => (
                    <td key={ci} className="py-2" style={{ textAlign: ci === 0 ? "left" : "right", color: ci === 0 ? "#333" : "#111", fontWeight: ci === 0 ? 500 : 600 }}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const [start, setStart] = useState(daysAgoISO(90));
  const [end, setEnd] = useState(todayISO());
  const [report, setReport] = useState<SalesReportOut | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (s: string, e: string) => {
    setLoading(true);
    setError(null);
    try {
      setReport(await getSalesReport(s, e));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate once on mount with the default range.
  useEffect(() => {
    generate(start, end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-10 max-w-6xl">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "#111" }}>Reports</h1>
          <p style={{ color: "#aaa", fontSize: 13 }} className="mt-1">Generate and export sales reports</p>
        </div>
        {report && (
          <div className="flex gap-2 admin-print-hide">
            <button
              onClick={() => downloadCSV(report)}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ background: "#111" }}
            >
              Download CSV
            </button>
            <button
              onClick={() => window.print()}
              className="rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ background: "#fff", border: "1px solid #ddd", color: "#111" }}
            >
              Print / PDF
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="rounded-2xl p-5 mb-6 admin-print-hide" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block mb-1 font-medium" style={{ fontSize: 11, color: "#888" }}>From</label>
            <input type="date" value={start} max={end} onChange={(e) => setStart(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "#ddd" }} />
          </div>
          <div>
            <label className="block mb-1 font-medium" style={{ fontSize: 11, color: "#888" }}>To</label>
            <input type="date" value={end} min={start} max={todayISO()} onChange={(e) => setEnd(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "#ddd" }} />
          </div>
          <button
            onClick={() => generate(start, end)}
            disabled={loading}
            className="rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(90deg,#fbab4d,#f2890e)" }}
          >
            {loading ? "Generating…" : "Generate"}
          </button>
          <div className="flex flex-wrap gap-1.5 ml-auto">
            {QUICK.map((q) => (
              <button
                key={q.label}
                onClick={() => {
                  const s = q.start();
                  const e = todayISO();
                  setStart(s); setEnd(e); generate(s, e);
                }}
                className="rounded-full px-3 py-1.5 text-xs font-medium"
                style={{ background: "#f0f1f3", color: "#555" }}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm mb-6" style={{ background: "#fff1f1", color: "#e5484d", border: "1px solid #ffd6d6" }}>
          {error}
        </div>
      )}

      {report && !loading && (
        <div className="space-y-5">
          <p style={{ fontSize: 12, color: "#999" }}>
            Report period: <b style={{ color: "#555" }}>{report.start}</b> → <b style={{ color: "#555" }}>{report.end}</b>
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard label="Revenue" value={taka(report.summary.total_revenue)} />
            <SummaryCard label="Orders" value={String(report.summary.total_orders)} />
            <SummaryCard label="Units Sold" value={String(report.summary.units_sold)} />
            <SummaryCard label="Avg Order Value" value={taka(report.summary.avg_order_value)} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Table
              title="Orders by status"
              head={["Status", "Orders", "Revenue"]}
              rows={report.by_status.map((s) => [s.status, s.count, taka(s.revenue)])}
            />
            <Table
              title="Top products"
              head={["Product", "Qty", "Revenue"]}
              rows={report.top_products.map((p) => [p.product_name, p.quantity, taka(p.revenue)])}
            />
          </div>

          <Table
            title="Daily breakdown"
            head={["Date", "Orders", "Revenue"]}
            rows={report.daily.map((d) => [d.date, d.orders, taka(d.revenue)])}
          />
        </div>
      )}
    </div>
  );
}

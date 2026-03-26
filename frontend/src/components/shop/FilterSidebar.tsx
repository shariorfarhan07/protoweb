"use client";

import { useState } from "react";
import type { BrandSchema, CategorySchema } from "@/lib/api-types";

interface Filters {
  category?: string;
  brand?: string;
  product_type?: string;
  min_price?: number;
  max_price?: number;
  material?: string;
}

interface FilterSidebarProps {
  categories: CategorySchema[];
  brands: BrandSchema[];
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const PRODUCT_TYPES = [
  { value: "printer",  label: "3D Printers", icon: "🖨️",  color: "#ddeeff", dot: "#4da6ff" },
  { value: "filament", label: "Filament",    icon: "🧵",  color: "#ffe8d6", dot: "#ff8c42" },
  { value: "cnc",      label: "CNC / Laser", icon: "⚡",  color: "#d6ffe8", dot: "#2ecc71" },
  { value: "printed",  label: "3D Printed",  icon: "🎨",  color: "#ead6ff", dot: "#a855f7" },
];

const MATERIALS = [
  { name: "PLA",  color: "#bfdbfe" },
  { name: "ABS",  color: "#fde68a" },
  { name: "PETG", color: "#bbf7d0" },
  { name: "TPU",  color: "#fecaca" },
  { name: "ASA",  color: "#e9d5ff" },
  { name: "SILK", color: "#fbcfe8" },
];

export function FilterSidebar({ categories, brands, filters, onChange }: FilterSidebarProps) {
  const [minPrice, setMinPrice] = useState(filters.min_price?.toString() ?? "");
  const [maxPrice, setMaxPrice] = useState(filters.max_price?.toString() ?? "");

  function update(partial: Partial<Filters>) {
    onChange({ ...filters, ...partial });
  }

  function applyPrice() {
    update({
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
    });
  }

  function clearAll() {
    setMinPrice("");
    setMaxPrice("");
    onChange({});
  }

  const hasFilters = Object.values(filters).some((v) => v !== undefined && v !== "");
  const activeCount = Object.values(filters).filter((v) => v !== undefined && v !== "").length;

  return (
    <aside aria-label="Product filters" className="space-y-2">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
          </svg>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Filters</span>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs font-bold"
              style={{ background: "#6366f1", fontSize: 10 }}>
              {activeCount}
            </span>
          )}
        </div>
        {hasFilters && (
          <button onClick={clearAll}
            className="text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors flex items-center gap-1">
            ✕ Clear
          </button>
        )}
      </div>

      {/* ── Product Type ─────────────────────────────────────────── */}
      <Section title="Product Type" accent="#6366f1">
        <div className="grid grid-cols-1 gap-2">
          {PRODUCT_TYPES.map((t) => {
            const active = filters.product_type === t.value;
            return (
              <button
                key={t.value}
                onClick={() => update({ product_type: active ? undefined : t.value })}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 border"
                style={{
                  background: active ? t.color : "#fff",
                  borderColor: active ? t.dot : "rgba(0,0,0,0.08)",
                  boxShadow: active ? `0 0 0 1px ${t.dot}` : "none",
                }}
              >
                <span className="text-base leading-none">{t.icon}</span>
                <span className="text-sm font-medium" style={{ color: active ? "#111" : "#555" }}>
                  {t.label}
                </span>
                {active && (
                  <span className="ml-auto w-4 h-4 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ background: t.dot, fontSize: 9 }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Category ─────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <Section title="Category" accent="#f59e0b">
          <div className="space-y-1">
            {categories.map((c) => {
              const active = filters.category === c.slug;
              return (
                <button
                  key={c.id}
                  onClick={() => update({ category: active ? undefined : c.slug })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-150"
                  style={{
                    background: active ? "#fffbeb" : "transparent",
                    color: active ? "#b45309" : "#555",
                  }}
                >
                  <span className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: active ? "#f59e0b" : "#ddd" }} />
                  <span className="text-sm font-medium flex-1">{c.name}</span>
                  {active && <span className="text-xs text-amber-500">✓</span>}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── Brand ────────────────────────────────────────────────── */}
      {brands.length > 0 && (
        <Section title="Brand" accent="#10b981">
          <div className="space-y-1">
            {brands.map((b) => {
              const active = filters.brand === b.slug;
              return (
                <button
                  key={b.id}
                  onClick={() => update({ brand: active ? undefined : b.slug })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-150"
                  style={{
                    background: active ? "#ecfdf5" : "transparent",
                    color: active ? "#065f46" : "#555",
                  }}
                >
                  <span className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: active ? "#10b981" : "#ddd" }} />
                  <span className="text-sm font-medium flex-1">{b.name}</span>
                  {active && <span className="text-xs text-emerald-500">✓</span>}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── Price Range ──────────────────────────────────────────── */}
      <Section title="Price Range (৳)" accent="#ef4444">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">৳</span>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full pl-7 pr-3 py-2 rounded-lg text-sm outline-none transition-colors"
                style={{ border: "1.5px solid rgba(0,0,0,0.1)", background: "#fafaf8" }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#ef4444"}
                onBlur={(e) => e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)"}
                aria-label="Minimum price"
              />
            </div>
            <span className="text-gray-300 font-bold">—</span>
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">৳</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full pl-7 pr-3 py-2 rounded-lg text-sm outline-none transition-colors"
                style={{ border: "1.5px solid rgba(0,0,0,0.1)", background: "#fafaf8" }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#ef4444"}
                onBlur={(e) => e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)"}
                aria-label="Maximum price"
              />
            </div>
          </div>
          <button
            onClick={applyPrice}
            className="w-full py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #ef4444, #f97316)", fontSize: 12 }}
          >
            Apply Price Filter
          </button>
        </div>
      </Section>

      {/* ── Material ─────────────────────────────────────────────── */}
      {(!filters.product_type || filters.product_type === "filament") && (
        <Section title="Material" accent="#8b5cf6">
          <div className="grid grid-cols-2 gap-2">
            {MATERIALS.map((m) => {
              const active = filters.material === m.name;
              return (
                <button
                  key={m.name}
                  onClick={() => update({ material: active ? undefined : m.name })}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 border"
                  style={{
                    background: active ? m.color : "#fff",
                    borderColor: active ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.08)",
                    color: active ? "#111" : "#666",
                    boxShadow: active ? "inset 0 0 0 1.5px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  <span className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: m.color, border: "1.5px solid rgba(0,0,0,0.12)" }} />
                  {m.name}
                </button>
              );
            })}
          </div>
        </Section>
      )}
    </aside>
  );
}

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-3"
        style={{ background: "#fafaf8", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: accent }} />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#444" }}>
          {title}
        </span>
      </div>
      {/* Section body */}
      <div className="p-3 bg-white">
        {children}
      </div>
    </div>
  );
}

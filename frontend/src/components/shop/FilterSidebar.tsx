"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  { value: "printer", label: "3D Printers" },
  { value: "filament", label: "Filament" },
  { value: "cnc", label: "CNC / Laser" },
  { value: "printed", label: "3D Printed" },
];

const MATERIALS = ["PLA", "ABS", "PETG", "TPU", "ASA", "SILK"];

export function FilterSidebar({
  categories,
  brands,
  filters,
  onChange,
}: FilterSidebarProps) {
  const [minPriceInput, setMinPriceInput] = useState(
    filters.min_price?.toString() ?? ""
  );
  const [maxPriceInput, setMaxPriceInput] = useState(
    filters.max_price?.toString() ?? ""
  );

  function update(partial: Partial<Filters>) {
    onChange({ ...filters, ...partial });
  }

  function applyPrice() {
    update({
      min_price: minPriceInput ? Number(minPriceInput) : undefined,
      max_price: maxPriceInput ? Number(maxPriceInput) : undefined,
    });
  }

  function clearAll() {
    setMinPriceInput("");
    setMaxPriceInput("");
    onChange({});
  }

  const hasFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== ""
  );

  return (
    <aside className="space-y-8" aria-label="Product filters">
      {/* Clear all */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="text-xs underline text-gray-400 hover:text-gray-700"
        >
          Clear all filters
        </button>
      )}

      {/* Product type */}
      <FilterSection title="Product Type">
        {PRODUCT_TYPES.map((t) => (
          <CheckRow
            key={t.value}
            label={t.label}
            checked={filters.product_type === t.value}
            onChange={(checked) =>
              update({ product_type: checked ? t.value : undefined })
            }
          />
        ))}
      </FilterSection>

      {/* Category */}
      <FilterSection title="Category">
        {categories.map((c) => (
          <CheckRow
            key={c.id}
            label={c.name}
            checked={filters.category === c.slug}
            onChange={(checked) =>
              update({ category: checked ? c.slug : undefined })
            }
          />
        ))}
      </FilterSection>

      {/* Brand */}
      <FilterSection title="Brand">
        {brands.map((b) => (
          <CheckRow
            key={b.id}
            label={b.name}
            checked={filters.brand === b.slug}
            onChange={(checked) =>
              update({ brand: checked ? b.slug : undefined })
            }
          />
        ))}
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Price (৳)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
            style={{ borderColor: "var(--border)" }}
            aria-label="Minimum price"
          />
          <span className="text-gray-400 text-xs">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
            style={{ borderColor: "var(--border)" }}
            aria-label="Maximum price"
          />
        </div>
        <button
          onClick={applyPrice}
          className="btn-pill w-full mt-2"
          style={{ fontSize: 12, padding: "8px" }}
        >
          Apply
        </button>
      </FilterSection>

      {/* Material (filament) */}
      {(!filters.product_type ||
        filters.product_type === "filament") && (
        <FilterSection title="Material">
          {MATERIALS.map((m) => (
            <CheckRow
              key={m}
              label={m}
              checked={filters.material === m}
              onChange={(checked) =>
                update({ material: checked ? m : undefined })
              }
            />
          ))}
        </FilterSection>
      )}
    </aside>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        className="font-semibold uppercase text-xs mb-3"
        style={{ letterSpacing: 2, color: "var(--subtle)" }}
      >
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 accent-gray-900"
      />
      <span
        className="text-sm transition-colors"
        style={{ color: checked ? "var(--fg)" : "var(--muted)" }}
      >
        {label}
      </span>
    </label>
  );
}

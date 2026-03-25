"use client";

import { useState } from "react";
import type { FilamentVariantSchema } from "@/lib/api-types";
import { formatPrice } from "@/lib/utils";

interface FilamentVariantsProps {
  variants: FilamentVariantSchema[];
  onVariantChange?: (variant: FilamentVariantSchema | null) => void;
}

export function FilamentVariants({ variants, onVariantChange }: FilamentVariantsProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const active = variants.find((v) => v.id === selectedId) ?? null;
  const grouped = groupByMaterial(variants.filter((v) => v.is_active));

  function select(variant: FilamentVariantSchema) {
    const newId = variant.id === selectedId ? null : variant.id;
    setSelectedId(newId);
    onVariantChange?.(newId ? variant : null);
  }

  if (!variants.length) return null;

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([material, vars]) => (
        <div key={material}>
          <p className="text-xs font-semibold uppercase mb-3" style={{ letterSpacing: 2, color: "var(--subtle)" }}>
            {material} — {vars.length} color{vars.length !== 1 ? "s" : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {vars.map((v) => (
              <button
                key={v.id}
                onClick={() => select(v)}
                aria-pressed={v.id === selectedId}
                aria-label={`${v.color_name ?? "Color"} ${v.material ?? ""}`}
                title={`${v.color_name ?? ""} — ${formatPrice(v.price_delta > 0 ? v.price_delta : 0)} ${v.stock_qty === 0 ? "(Out of stock)" : ""}`}
                className="relative group"
                style={{ opacity: v.stock_qty === 0 ? 0.4 : 1 }}
              >
                <span
                  className="flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all"
                  style={{
                    background: v.color_hex ?? "#999",
                    borderColor:
                      v.id === selectedId ? "var(--fg)" : "transparent",
                    boxShadow:
                      v.id === selectedId
                        ? "0 0 0 2px #fff, 0 0 0 4px var(--fg)"
                        : "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                >
                  {v.stock_qty === 0 && (
                    <span className="text-white text-xs font-bold">×</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Selected variant info */}
      {active && (
        <div
          className="rounded-xl p-4 text-sm"
          style={{ background: "rgba(0,0,0,0.04)" }}
        >
          <p className="font-semibold">
            {active.color_name} — {active.material}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Diameter: {active.diameter_mm ?? 1.75}mm ·{" "}
            {active.weight_grams ? `${active.weight_grams}g` : "1KG"} ·{" "}
            {active.stock_qty > 0
              ? `${active.stock_qty} in stock`
              : "Out of stock"}
          </p>
          {active.price_delta > 0 && (
            <p className="font-semibold mt-1">
              +{formatPrice(active.price_delta)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function groupByMaterial(
  variants: FilamentVariantSchema[]
): Record<string, FilamentVariantSchema[]> {
  return variants.reduce<Record<string, FilamentVariantSchema[]>>((acc, v) => {
    const key = v.material ?? "Other";
    (acc[key] ??= []).push(v);
    return acc;
  }, {});
}

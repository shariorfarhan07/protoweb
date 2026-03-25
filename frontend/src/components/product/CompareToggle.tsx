"use client";

import { useCompareStore } from "@/store/compare";

interface CompareToggleProps {
  productId: number;
}

export function CompareToggle({ productId }: CompareToggleProps) {
  const { has, toggle, isFull } = useCompareStore();
  const isAdded = has(productId);
  const full = isFull() && !isAdded;

  return (
    <button
      onClick={() => toggle(productId)}
      disabled={full}
      aria-pressed={isAdded}
      aria-label={isAdded ? "Remove from compare" : "Add to compare"}
      title={full ? "Max 4 products for comparison" : isAdded ? "Remove from compare" : "Compare"}
      className="flex items-center justify-center w-9 h-9 rounded-full border transition-all"
      style={{
        borderColor: isAdded ? "var(--fg)" : "var(--border)",
        background: isAdded ? "var(--fg)" : "transparent",
        color: isAdded ? "#fff" : "var(--muted)",
        opacity: full ? 0.4 : 1,
        cursor: full ? "not-allowed" : "pointer",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
      </svg>
    </button>
  );
}

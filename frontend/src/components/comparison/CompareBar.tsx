"use client";

import Link from "next/link";
import { useCompareStore } from "@/store/compare";

export function CompareBar() {
  const { ids, clear } = useCompareStore();

  if (ids.length < 2) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white border-t shadow-lg"
      style={{ borderColor: "var(--border)" }}
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-semibold">
        {ids.length} product{ids.length !== 1 ? "s" : ""} selected for comparison
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={clear}
          className="text-xs text-gray-400 hover:text-gray-700 underline"
        >
          Clear
        </button>
        <Link href="/compare" className="btn-pill" style={{ fontSize: 13, padding: "10px 24px" }}>
          Compare Now →
        </Link>
      </div>
    </div>
  );
}

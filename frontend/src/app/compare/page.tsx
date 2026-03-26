"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { compareProducts } from "@/lib/api";
import { useCompareStore } from "@/store/compare";
import { CompareTable } from "@/components/comparison/CompareTable";
import type { CompareResponse } from "@/lib/api-types";

export default function ComparePage() {
  const { ids, clear } = useCompareStore();
  const [data, setData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ids.length < 2) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    compareProducts(ids)
      .then(setData)
      .catch((e) => setError(e.message ?? "Comparison failed"))
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="font-black text-3xl mb-1" style={{ letterSpacing: -1 }}>
            Compare Products
          </h1>
          <p className="text-sm text-gray-400">
            Select up to 4 products from the shop to compare specifications.
          </p>
        </div>
        {ids.length > 0 && (
          <button onClick={clear} className="text-sm text-gray-400 hover:text-gray-700 underline">
            Clear all
          </button>
        )}
      </div>

      {ids.length < 2 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-5xl mb-4">📊</p>
          <p className="font-semibold text-lg mb-2">No products selected</p>
          <p className="text-gray-400 text-sm mb-6">
            Add at least 2 printers or CNC machines using the compare button on
            product cards.
          </p>
          <Link href="/shop?product_type=printer" className="btn-pill" style={{ fontSize: 13 }}>
            Browse 3D Printers
          </Link>
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-4">
          <div className="skeleton h-32 rounded-2xl" />
          <div className="skeleton h-12 rounded-xl" />
          <div className="skeleton h-12 rounded-xl" />
          <div className="skeleton h-12 rounded-xl" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-red-600 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && data && <CompareTable data={data} />}
    </div>
  );
}

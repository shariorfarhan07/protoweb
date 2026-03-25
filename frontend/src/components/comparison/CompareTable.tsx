"use client";

import Image from "next/image";
import Link from "next/link";
import type { CompareResponse } from "@/lib/api-types";
import { buildImageUrl, formatPrice } from "@/lib/utils";

interface CompareTableProps {
  data: CompareResponse;
}

export function CompareTable({ data }: CompareTableProps) {
  const { products, rows } = data;

  return (
    <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--border)" }}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b" style={{ borderColor: "var(--border)" }}>
            <th
              className="text-left px-6 py-4 text-xs font-semibold uppercase text-gray-400 w-48"
              style={{ letterSpacing: 2 }}
            >
              Specification
            </th>
            {products.map((p) => (
              <th key={p.id} className="px-6 py-4 text-center min-w-[200px]">
                <div className="flex flex-col items-center gap-2">
                  {p.image && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50">
                      <Image
                        src={buildImageUrl(p.image)}
                        alt={p.name}
                        fill
                        className="object-contain p-2"
                        sizes="80px"
                      />
                    </div>
                  )}
                  <Link
                    href={`/products/${p.slug}`}
                    className="font-semibold text-sm hover:underline text-center"
                  >
                    {p.name}
                  </Link>
                  <p className="font-black text-base">{formatPrice(p.price)}</p>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.attribute}
              className="border-b last:border-b-0"
              style={{
                borderColor: "var(--border)",
                background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.015)",
              }}
            >
              <td
                className="px-6 py-4 text-sm font-medium text-gray-500"
                style={{ background: "rgba(0,0,0,0.02)" }}
              >
                {row.attribute}
              </td>
              {products.map((p) => {
                const val = row.values[p.id] ?? "—";
                const isDash = val === "—";
                return (
                  <td
                    key={p.id}
                    className="px-6 py-4 text-sm text-center"
                    style={{ color: isDash ? "var(--lighter)" : "var(--fg)" }}
                  >
                    {val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

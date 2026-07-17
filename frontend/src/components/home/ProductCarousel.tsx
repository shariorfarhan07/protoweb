"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { ProductList } from "@/lib/api-types";
import { HomeProductCard } from "./HomeProductCard";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

interface Props {
  title: string;
  products: ProductList[];
  viewAllHref: string;
  id?: string;
}

export function ProductCarousel({ title, products, viewAllHref, id }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const [brand, setBrand] = useState<string>("all");

  // Derive brand filter pills from the products in this section.
  const brands = useMemo(() => {
    const seen = new Map<string, string>(); // slug -> name
    for (const p of products) {
      if (p.brand) seen.set(p.brand.slug, p.brand.name);
    }
    return Array.from(seen, ([slug, name]) => ({ slug, name }));
  }, [products]);

  const visible = useMemo(
    () => (brand === "all" ? products : products.filter((p) => p.brand?.slug === brand)),
    [products, brand]
  );

  if (products.length === 0) return null;

  function scroll(dir: number) {
    railRef.current?.scrollBy({ left: dir * 480, behavior: "smooth" });
  }

  return (
    <section id={id} className="pbd-wrap" style={{ marginTop: 60, scrollMarginTop: 90 }}>
      <div className="pbd-section-head">
        <h2 className="pbd-section-title">{title}</h2>
        <div className="pbd-head-tools">
          <Link href={viewAllHref} className="pbd-orange-btn">
            View All
          </Link>
          <button className="pbd-nav-arrow" onClick={() => scroll(-1)} aria-label="Scroll left">
            <ChevronLeftIcon size={16} />
          </button>
          <button className="pbd-nav-arrow" onClick={() => scroll(1)} aria-label="Scroll right">
            <ChevronRightIcon size={16} />
          </button>
        </div>
      </div>

      {brands.length > 1 && (
        <div className="pbd-pills">
          <button className="pbd-pill" data-active={brand === "all"} onClick={() => setBrand("all")}>
            All
          </button>
          {brands.map((b) => (
            <button
              key={b.slug}
              className="pbd-pill"
              data-active={brand === b.slug}
              onClick={() => setBrand(b.slug)}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      <div className="pbd-rail" ref={railRef}>
        {visible.map((p) => (
          <HomeProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import type { CategorySchema } from "@/lib/api-types";
import { buildImageUrl } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

export function FeaturedCategoryRow({ categories }: { categories: CategorySchema[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  if (categories.length === 0) return null;

  function scroll(dir: number) {
    railRef.current?.scrollBy({ left: dir * 360, behavior: "smooth" });
  }

  return (
    <section className="pbd-wrap" style={{ marginTop: 56 }}>
      <div className="pbd-section-head">
        <h2 className="pbd-section-title">Featured Categories</h2>
        <div className="pbd-head-tools">
          <Link href="/shop" className="pbd-orange-btn">
            View all Categories
          </Link>
          <button className="pbd-nav-arrow" onClick={() => scroll(-1)} aria-label="Scroll left">
            <ChevronLeftIcon size={16} />
          </button>
          <button className="pbd-nav-arrow" onClick={() => scroll(1)} aria-label="Scroll right">
            <ChevronRightIcon size={16} />
          </button>
        </div>
      </div>

      <div className="pbd-rail" ref={railRef}>
        {categories.map((cat) => (
          <Link key={cat.id} href={`/category/${cat.slug}`} className="pbd-cat-card">
            <span className="pbd-cat-thumb">
              {cat.image_url && (
                <Image
                  src={buildImageUrl(cat.image_url)}
                  alt={cat.name}
                  width={120}
                  height={120}
                  className="object-contain"
                  style={{ width: "80%", height: "80%" }}
                  loading="lazy"
                />
              )}
            </span>
            <span className="pbd-cat-name">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

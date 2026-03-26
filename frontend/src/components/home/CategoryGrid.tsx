import Link from "next/link";
import Image from "next/image";
import type { CategorySchema } from "@/lib/api-types";
import { buildImageUrl } from "@/lib/utils";

interface CategoryGridProps {
  categories: CategorySchema[];
}

const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #ddeeff, #b8d8f8)",
  "linear-gradient(135deg, #ffe8d6, #ffd0b0)",
  "linear-gradient(135deg, #d6ffe8, #b0f0cc)",
  "linear-gradient(135deg, #ead6ff, #d4b0f5)",
];

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="px-4 md:px-12 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2
          className="font-semibold uppercase text-gray-500"
          style={{ fontSize: 11, letterSpacing: 4 }}
        >
          Categories
        </h2>
        <Link
          href="/shop"
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
          style={{ fontSize: 12 }}
        >
          View all →
        </Link>
      </div>

      {/* Grid: 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {categories.map((cat, idx) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="group relative rounded-card overflow-hidden cursor-pointer"
            style={{
              aspectRatio: "1",
              background: cat.gradient_css ?? FALLBACK_GRADIENTS[idx % 4],
              boxShadow: "var(--shadow-sm)",
            }}
            aria-label={`Shop ${cat.name}`}
          >
            {/* Product image */}
            {cat.image_url && (
              <div className="absolute inset-0 flex items-center justify-center p-7">
                <Image
                  src={buildImageUrl(cat.image_url)}
                  alt={cat.name}
                  fill
                  className="object-contain p-7 transition-transform duration-400 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  loading="lazy"
                />
              </div>
            )}

            {/* Category label */}
            <div className="absolute bottom-5 left-0 right-0 flex justify-center">
              <span
                className="font-semibold text-gray-700 bg-white/70 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs uppercase tracking-widest"
                style={{ letterSpacing: 2 }}
              >
                {cat.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

import Link from "next/link";
import Image from "next/image";
import type { ProductList } from "@/lib/api-types";
import { buildImageUrl, formatDiscount, formatPrice, imageBg } from "@/lib/utils";
import { CompareToggle } from "@/components/product/CompareToggle";

interface ProductCardProps {
  product: ProductList;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount =
    product.compare_price && product.compare_price > product.price;
  const discountPct = hasDiscount
    ? formatDiscount(product.price, product.compare_price!)
    : 0;

  return (
    <article
      className="group relative bg-white rounded-card overflow-hidden flex flex-col"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block overflow-hidden"
        style={{
          aspectRatio: "1",
          background: imageBg(product.primary_image),
        }}
        tabIndex={-1}
      >
        <Image
          src={buildImageUrl(product.primary_image ?? "/placeholder.png")}
          alt={product.name}
          fill
          className="object-contain p-5 transition-transform duration-400 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              -{discountPct}%
            </span>
          )}
          {product.stock_qty === 0 && (
            <span className="bg-gray-400 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              Out of stock
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {product.category && (
          <p
            className="text-gray-400 uppercase"
            style={{ fontSize: 10, letterSpacing: 2, fontWeight: 600 }}
          >
            {product.category.name}
          </p>
        )}
        <Link
          href={`/products/${product.slug}`}
          className="font-semibold text-sm leading-tight hover:underline line-clamp-2"
        >
          {product.name}
        </Link>
        {product.brand && (
          <p className="text-xs text-gray-400">{product.brand.name}</p>
        )}

        {/* Price row */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          <span className="font-bold text-base">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.compare_price!)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-1">
          <Link
            href={`/products/${product.slug}`}
            className="btn-pill flex-1 text-center"
            style={{ fontSize: 12, padding: "8px 16px" }}
          >
            View
          </Link>
          {/* Compare toggle for printers/CNC */}
          {(product.product_type === "printer" ||
            product.product_type === "cnc") && (
            <CompareToggle productId={product.id} />
          )}
        </div>
      </div>
    </article>
  );
}

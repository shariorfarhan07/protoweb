"use client";

import Link from "next/link";
import Image from "next/image";
import type { ProductList } from "@/lib/api-types";
import { buildImageUrl, formatPrice, formatDiscount } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { ShoppingBagIcon } from "./icons";

const TYPE_LABELS: Record<string, string> = {
  printer: "3D Printer",
  laser: "Laser Engraver",
  cnc: "CNC Machine",
  filament: "Filament",
  scanner: "3D Scanner",
  accessory: "Accessory",
  part: "Spare Part",
};

function typeLabel(t: string): string {
  return TYPE_LABELS[t] ?? t.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function HomeProductCard({ product }: { product: ProductList }) {
  const addItem = useCartStore((s) => s.addItem);

  const hasDiscount = !!product.compare_price && product.compare_price > product.price;
  const discountPct = hasDiscount ? formatDiscount(product.price, product.compare_price!) : 0;

  // Up to four spec-style tags, mirroring the Figma card.
  const tags = [
    typeLabel(product.product_type),
    product.brand?.name,
    product.category?.name,
  ].filter(Boolean) as string[];

  function handleAdd() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.primary_image,
    });
  }

  return (
    <article className="pbd-pc">
      <Link href={`/products/${product.slug}`} className="pbd-pc-imgwrap">
        <span className="pbd-pc-badge">{hasDiscount ? `-${discountPct}%` : "PBD"}</span>
        <Image
          src={buildImageUrl(product.primary_image ?? "/placeholder.png")}
          alt={product.name}
          fill
          className="object-contain p-4"
          sizes="230px"
          loading="lazy"
        />
      </Link>

      <div className="pbd-pc-body">
        <div className="pbd-pc-tags">
          {tags.slice(0, 4).map((t, i) => (
            <span key={i} className="pbd-pc-tag">
              {t}
            </span>
          ))}
        </div>

        <Link href={`/products/${product.slug}`} className="pbd-pc-name">
          {product.name}
        </Link>

        <div className="pbd-pc-price">
          {formatPrice(product.price)}
          {hasDiscount && <s>{formatPrice(product.compare_price!)}</s>}
        </div>

        <div className="pbd-pc-actions">
          <Link href={`/products/${product.slug}`} className="pbd-pc-shop">
            Shop Now
          </Link>
          <button
            type="button"
            onClick={handleAdd}
            className="pbd-pc-cart"
            aria-label={`Add ${product.name} to cart`}
            disabled={product.stock_qty === 0}
            style={product.stock_qty === 0 ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
          >
            <ShoppingBagIcon size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

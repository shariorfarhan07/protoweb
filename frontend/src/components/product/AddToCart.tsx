"use client";

import { useState } from "react";
import type { FilamentVariantSchema, ProductDetail } from "@/lib/api-types";
import { useCartStore } from "@/store/cart";
import { buildImageUrl, formatPrice } from "@/lib/utils";

interface AddToCartProps {
  product: ProductDetail;
  selectedVariant?: FilamentVariantSchema | null;
}

export function AddToCart({ product, selectedVariant }: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const effectivePrice =
    product.price + (selectedVariant?.price_delta ?? 0);

  const inStock =
    selectedVariant != null
      ? selectedVariant.stock_qty > 0
      : product.stock_qty > 0;

  function handleAdd() {
    if (!inStock) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: effectivePrice,
        image: buildImageUrl(
          selectedVariant?.image_url ?? product.images[0]?.url ?? ""
        ),
        variantId: selectedVariant?.id,
        variantLabel: selectedVariant
          ? `${selectedVariant.color_name} / ${selectedVariant.material}`
          : undefined,
      });
    }
  }

  return (
    <div className="space-y-4">
      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-black" style={{ letterSpacing: -1 }}>
          {formatPrice(effectivePrice)}
        </span>
        {product.compare_price && product.compare_price > product.price && (
          <span className="text-lg text-gray-400 line-through">
            {formatPrice(product.compare_price)}
          </span>
        )}
      </div>

      {/* Stock status */}
      <p
        className="text-sm font-medium"
        style={{ color: inStock ? "#38a169" : "#e53e3e" }}
      >
        {inStock ? "In Stock" : "Out of Stock"}
      </p>

      {/* Quantity + Add */}
      <div className="flex items-center gap-3">
        {/* Qty stepper */}
        <div
          className="flex items-center rounded-pill border overflow-hidden"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="px-4 py-3 text-lg hover:bg-gray-100 transition-colors"
            disabled={quantity <= 1}
          >
            −
          </button>
          <span className="px-4 text-sm font-semibold min-w-[2rem] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
            className="px-4 py-3 text-lg hover:bg-gray-100 transition-colors"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAdd}
          disabled={!inStock}
          className="btn-pill flex-1"
          style={{
            fontSize: 14,
            padding: "14px 24px",
            opacity: inStock ? 1 : 0.5,
            cursor: inStock ? "pointer" : "not-allowed",
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

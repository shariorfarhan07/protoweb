"use client";

import { useState } from "react";
import type { FilamentVariantSchema, ProductDetail } from "@/lib/api-types";
import { useCartStore } from "@/store/cart";
import { buildImageUrl, formatPrice } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

interface AddToCartProps {
  product: ProductDetail;
  selectedVariant?: FilamentVariantSchema | null;
}

export function AddToCart({ product, selectedVariant }: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const regularPrice =
    selectedVariant?.variant_price != null
      ? selectedVariant.variant_price
      : product.price + (selectedVariant?.price_delta ?? 0);

  const inStock =
    selectedVariant != null
      ? selectedVariant.stock_qty > 0
      : product.stock_qty > 0;

  // Preorder is offered when the item is out of stock and the admin enabled it.
  const preorderAvailable = !inStock && product.preorder_enabled;
  // Preorder price (admin-set) overrides the regular price; falls back to it if unset.
  const preorderPrice =
    product.preorder_price != null ? product.preorder_price : regularPrice;

  const isPreorder = preorderAvailable;
  const effectivePrice = isPreorder ? preorderPrice : regularPrice;
  const canPurchase = inStock || preorderAvailable;

  function handleAdd() {
    if (!canPurchase) return;
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
        isPreorder,
      });
    }
    trackEvent("add_to_cart", {
      value: effectivePrice * quantity,
      currency: "BDT",
      items: [{ item_id: product.id, item_name: product.name, price: effectivePrice, quantity }],
    });
  }

  return (
    <div className="space-y-4">
      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-black" style={{ letterSpacing: -1 }}>
          {formatPrice(effectivePrice)}
        </span>
        {isPreorder
          ? regularPrice !== effectivePrice && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(regularPrice)}
              </span>
            )
          : product.compare_price && product.compare_price > product.price && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
        {isPreorder && (
          <span
            className="text-xs font-semibold rounded-full px-2.5 py-1"
            style={{ background: "#fff8ed", color: "#c45b00" }}
          >
            Preorder price
          </span>
        )}
      </div>

      {/* Stock status */}
      <p
        className="text-sm font-medium"
        style={{ color: inStock ? "#38a169" : preorderAvailable ? "#c45b00" : "#e53e3e" }}
      >
        {inStock
          ? "In Stock"
          : preorderAvailable
          ? "Out of stock — available to preorder"
          : "Out of Stock"}
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
          disabled={!canPurchase}
          className="btn-pill flex-1"
          style={{
            fontSize: 14,
            padding: "14px 24px",
            opacity: canPurchase ? 1 : 0.5,
            cursor: canPurchase ? "pointer" : "not-allowed",
            background: isPreorder ? "#c45b00" : undefined,
          }}
        >
          {isPreorder ? "Preorder Now" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

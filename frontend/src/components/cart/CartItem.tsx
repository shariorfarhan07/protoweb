"use client";

import Image from "next/image";
import Link from "next/link";
import type { CartItem as CartItemType } from "@/lib/api-types";
import { useCartStore } from "@/store/cart";
import { buildImageUrl, formatPrice } from "@/lib/utils";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCartStore();

  return (
    <div className="flex gap-4 py-4 border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
      {/* Image */}
      <Link href={`/products/${item.slug}`}>
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
          <Image
            src={buildImageUrl(item.image ?? "/placeholder.png")}
            alt={item.name}
            fill
            className="object-contain p-2"
            sizes="80px"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.slug}`} className="font-semibold text-sm hover:underline line-clamp-2">
          {item.name}
        </Link>
        {item.variantLabel && (
          <p className="text-xs text-gray-400 mt-0.5">{item.variantLabel}</p>
        )}
        <p className="font-bold text-sm mt-1">{formatPrice(item.price)}</p>

        {/* Qty + remove */}
        <div className="flex items-center gap-2 mt-2">
          <div
            className="flex items-center rounded-full border text-xs"
            style={{ borderColor: "var(--border)" }}
          >
            <button
              onClick={() =>
                updateQuantity(item.productId, item.quantity - 1, item.variantId)
              }
              className="px-2.5 py-1.5 hover:bg-gray-100 rounded-l-full"
              aria-label="Decrease"
            >
              −
            </button>
            <span className="px-3 font-semibold">{item.quantity}</span>
            <button
              onClick={() =>
                updateQuantity(item.productId, item.quantity + 1, item.variantId)
              }
              className="px-2.5 py-1.5 hover:bg-gray-100 rounded-r-full"
              aria-label="Increase"
            >
              +
            </button>
          </div>
          <button
            onClick={() => removeItem(item.productId, item.variantId)}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Remove item"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="flex-shrink-0 text-right">
        <p className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { CartItem } from "@/components/cart/CartItem";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, totalPrice } = useCartStore();

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <h1 className="font-black text-3xl mb-8" style={{ letterSpacing: -1 }}>
        Cart
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-5xl mb-4">🛒</p>
          <p className="font-semibold text-lg mb-2">Your cart is empty</p>
          <Link href="/shop" className="btn-pill mt-4" style={{ fontSize: 13 }}>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Items */}
          <div className="flex-1">
            {items.map((item) => (
              <CartItem key={`${item.productId}:${item.variantId ?? ""}`} item={item} />
            ))}
          </div>

          {/* Summary */}
          <div className="lg:w-80 flex-shrink-0">
            <div
              className="rounded-2xl p-6 border"
              style={{ borderColor: "var(--border)" }}
            >
              <h2 className="font-bold text-lg mb-6">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold">{formatPrice(totalPrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-gray-500">Calculated at checkout</span>
                </div>
              </div>
              <div
                className="border-t mt-4 pt-4 flex justify-between font-black text-lg"
                style={{ borderColor: "var(--border)" }}
              >
                <span>Total</span>
                <span>{formatPrice(totalPrice())}</span>
              </div>
              <Link
                href="/checkout"
                className="btn-pill w-full text-center block mt-6"
                style={{ fontSize: 14, padding: "14px" }}
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

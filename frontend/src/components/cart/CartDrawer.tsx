"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { CartItem } from "./CartItem";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { isOpen, closeCart, items, totalPrice, clearCart } = useCartStore();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className="fixed top-0 right-0 h-full z-50 bg-white flex flex-col transition-transform duration-300"
        style={{
          width: 420,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          boxShadow: isOpen ? "-8px 0 40px rgba(0,0,0,0.12)" : "none",
        }}
        aria-label="Shopping cart"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="font-black text-lg">Cart ({items.length})</h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="text-gray-400 hover:text-gray-700 transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <p className="text-4xl">🛒</p>
              <p className="font-semibold">Your cart is empty</p>
              <p className="text-sm text-gray-400">
                Add products from our shop to get started.
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="btn-pill mt-2"
                style={{ fontSize: 13 }}
              >
                Browse Shop
              </Link>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <CartItem key={`${item.productId}:${item.variantId ?? ""}`} item={item} />
              ))}
              <button
                onClick={clearCart}
                className="text-xs text-gray-400 hover:text-red-500 mt-4 underline"
              >
                Clear cart
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="px-6 py-6 border-t space-y-4"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex justify-between font-black text-lg">
              <span>Total</span>
              <span>{formatPrice(totalPrice())}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-pill w-full text-center block"
              style={{ fontSize: 14, padding: "14px" }}
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/cart"
              onClick={closeCart}
              className="btn-pill-outline btn-pill w-full text-center block"
              style={{ fontSize: 13, padding: "12px" }}
            >
              View Cart
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

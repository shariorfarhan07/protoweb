"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { CartItem } from "@/components/cart/CartItem";
import { formatPrice } from "@/lib/utils";
import { createOrder } from "@/lib/api";

interface FormState {
  fname: string;
  lname: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal: string;
}

const EMPTY_FORM: FormState = {
  fname: "", lname: "", email: "", phone: "", address: "", city: "", postal: "",
};

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0 && !submitted) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-10 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <p className="font-semibold text-lg mb-4">Your cart is empty</p>
        <Link href="/shop" className="btn-pill" style={{ fontSize: 13 }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-10 text-center">
        <p className="text-5xl mb-4">✅</p>
        <p className="font-black text-2xl mb-2">Order Placed!</p>
        {orderNumber && (
          <p
            className="text-sm font-mono inline-block px-3 py-1 rounded-lg mb-3"
            style={{ background: "var(--blue-light)" }}
          >
            {orderNumber}
          </p>
        )}
        <p className="text-gray-500 mb-6">
          Thank you for your order. We will contact you shortly.
        </p>
        <Link href="/" className="btn-pill" style={{ fontSize: 13 }}>
          Back to Home
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const order = await createOrder({
        shipping_address: {
          first_name: form.fname,
          last_name: form.lname,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          postal: form.postal,
        },
        payment_method: "cod",
        items: items.map((item) => ({
          product_id: item.productId,
          ...(item.variantId != null ? { variant_id: item.variantId } : {}),
          quantity: item.quantity,
        })),
      });
      clearCart();
      setOrderNumber(order.order_number);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to place order. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  function handleField(id: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [id]: value }));
  }

  const fields: Array<{
    id: keyof FormState;
    label: string;
    type?: string;
    span: number;
  }> = [
    { id: "fname", label: "First Name", span: 1 },
    { id: "lname", label: "Last Name", span: 1 },
    { id: "email", label: "Email", type: "email", span: 2 },
    { id: "phone", label: "Phone", type: "tel", span: 2 },
    { id: "address", label: "Address", span: 2 },
    { id: "city", label: "City", span: 1 },
    { id: "postal", label: "Postal Code", span: 1 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <h1 className="font-black text-3xl mb-8" style={{ letterSpacing: -1 }}>
        Checkout
      </h1>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Form */}
        <form className="flex-1 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div
              className="rounded-xl border p-4 text-sm"
              style={{ borderColor: "#fca5a5", background: "#fef2f2", color: "#dc2626" }}
            >
              {error}
            </div>
          )}

          <section>
            <h2 className="font-bold text-lg mb-4">Shipping Information</h2>
            <div className="grid grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f.id} style={{ gridColumn: `span ${f.span}` }}>
                  <label
                    htmlFor={f.id}
                    className="block text-xs font-semibold uppercase mb-1.5"
                    style={{ letterSpacing: 1, color: "var(--subtle)" }}
                  >
                    {f.label}
                  </label>
                  <input
                    id={f.id}
                    type={f.type ?? "text"}
                    required
                    value={form[f.id]}
                    onChange={(e) => handleField(f.id, e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-4">Payment</h2>
            <div
              className="rounded-xl border p-4 flex items-center gap-3 text-sm text-gray-500"
              style={{ borderColor: "var(--border)" }}
            >
              <span>💳</span>
              <span>
                Payment integration (bKash / SSLCommerz / Bank Transfer) — coming soon.
                We will contact you after order placement.
              </span>
            </div>
          </section>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-pill w-full"
            style={{ fontSize: 14, padding: "16px", opacity: isLoading ? 0.6 : 1 }}
          >
            {isLoading ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        {/* Order summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div
            className="rounded-2xl border p-6"
            style={{ borderColor: "var(--border)" }}
          >
            <h2 className="font-bold text-lg mb-4">
              Order ({items.length} item{items.length !== 1 ? "s" : ""})
            </h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <CartItem key={`${item.productId}:${item.variantId ?? ""}`} item={item} />
              ))}
            </div>
            <div
              className="border-t mt-4 pt-4 flex justify-between font-black text-lg"
              style={{ borderColor: "var(--border)" }}
            >
              <span>Total</span>
              <span>{formatPrice(totalPrice())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

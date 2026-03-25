"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useCartStore } from "@/store/cart";
import { searchProducts } from "@/lib/api";
import type { ProductList } from "@/lib/api-types";

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductList[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const totalItems = useCartStore((s) => s.totalItems());
  const toggleCart = useCartStore((s) => s.toggleCart);

  // Open search
  function openSearch() {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }
  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
  }

  // Keyboard close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeSearch();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Search debounce
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await searchProducts(query, 6);
        setResults(res);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <>
      {/* ── Search overlay ─────────────────────────────────────────────── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: "rgba(0,0,0,0.15)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeSearch();
          }}
        >
          <div
            className="w-full bg-white flex items-center gap-3 px-8"
            style={{
              height: 72,
              borderBottom: "1px solid var(--border)",
              boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="flex-1 bg-transparent text-base outline-none"
              style={{ fontSize: 18, color: "var(--fg)" }}
              aria-label="Search products"
            />
            <button
              onClick={closeSearch}
              aria-label="Close search"
              className="text-xl text-gray-400 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Results dropdown */}
          {(results.length > 0 || searching) && (
            <div className="bg-white mx-8 mt-0 rounded-b-2xl shadow-lg overflow-hidden max-w-2xl">
              {searching && (
                <div className="px-5 py-4 text-sm text-gray-400">Searching…</div>
              )}
              {results.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  onClick={closeSearch}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    {p.primary_image && (
                      <img
                        src={p.primary_image}
                        alt={p.name}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.category?.name}</p>
                  </div>
                  <p className="text-sm font-semibold">৳{p.price.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Main navbar ────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-40 flex items-center justify-between"
        style={{
          background: "var(--bg)",
          height: "var(--navbar-h)",
          padding: "0 48px",
          borderBottom: "1px solid var(--border)",
        }}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="font-black uppercase tracking-wide"
          style={{ fontSize: 18, letterSpacing: 1 }}
        >
          PrototypeBD
        </Link>

        {/* Nav links */}
        <ul className="hidden md:flex items-center gap-9" style={{ gap: 36 }}>
          {[
            { href: "/", label: "Home" },
            { href: "/shop", label: "Shop" },
            { href: "/compare", label: "Compare" },
            { href: "#about", label: "About" },
          ].map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-gray-500 hover:text-gray-900 transition-colors"
                style={{ fontSize: 12, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase" }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center" style={{ gap: 24 }}>
          <Link
            href="/login"
            className="text-gray-500 hover:text-gray-900 transition-colors"
            style={{ fontSize: 12, fontWeight: 500, letterSpacing: 1 }}
          >
            Log in
          </Link>

          {/* Search */}
          <button
            onClick={openSearch}
            aria-label="Open search"
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* Cart */}
          <button
            onClick={() => toggleCart()}
            aria-label={`Cart (${totalItems} items)`}
            className="btn-pill relative"
            style={{ padding: "8px 20px", fontSize: 12, letterSpacing: 1 }}
          >
            Cart
            {totalItems > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full text-white"
                style={{
                  width: 18,
                  height: 18,
                  fontSize: 10,
                  fontWeight: 700,
                  background: "#e53e3e",
                }}
              >
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>

      <CartDrawer />
    </>
  );
}

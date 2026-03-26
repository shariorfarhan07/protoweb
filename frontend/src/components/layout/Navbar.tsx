"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useCartStore } from "@/store/cart";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/compare", label: "Compare" },
  { href: "#about", label: "About" },
  { href: "/contact-us", label: "Contact" },
];

export function Navbar() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const totalItems = useCartStore((s) => s.totalItems());
  const toggleCart = useCartStore((s) => s.toggleCart);

  useEffect(() => { setMounted(true); }, []);

  function openSearch() {
    setMenuOpen(false);
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 80);
  }

  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    closeSearch();
  }

  useEffect(() => {
    function onResize() { if (window.innerWidth >= 768) setMenuOpen(false); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = (menuOpen || searchOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { closeSearch(); setMenuOpen(false); }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); openSearch(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════
          SEARCH OVERLAY
      ══════════════════════════════════════════════════════════════════ */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeSearch(); }}
        >
          {/* Search card */}
          <div
            className="w-full max-w-3xl mx-4 mt-24 md:mt-32 bg-white rounded-3xl overflow-hidden"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.35)" }}
          >
            <form onSubmit={handleSearch} className="flex items-center gap-4 px-6 md:px-8 py-5 md:py-6">
              {/* Search icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" className="shrink-0">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>

              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-300"
                style={{ fontSize: 22, fontWeight: 500 }}
                aria-label="Search products"
                autoComplete="off"
              />

              {/* Submit */}
              {query.trim() && (
                <button
                  type="submit"
                  className="btn-pill shrink-0"
                  style={{ fontSize: 13, padding: "10px 22px" }}
                >
                  Search
                </button>
              )}

              {/* Close */}
              <button
                type="button"
                onClick={closeSearch}
                aria-label="Close search"
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-lg"
              >
                ✕
              </button>
            </form>

            {/* Hint row */}
            <div
              className="flex items-center gap-6 px-6 md:px-8 py-3 border-t text-xs text-gray-400"
              style={{ borderColor: "rgba(0,0,0,0.06)", background: "#fafaf8" }}
            >
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-500 font-mono text-xs">↵</kbd>
                to search
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-500 font-mono text-xs">Esc</kbd>
                to close
              </span>
              <span className="ml-auto">Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-500 font-mono text-xs">⌘K</kbd> anytime</span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE MENU BACKDROP
      ══════════════════════════════════════════════════════════════════ */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(3px)" }}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE MENU PANEL
      ══════════════════════════════════════════════════════════════════ */}
      <div
        className="fixed top-0 left-0 h-full z-40 bg-white flex flex-col md:hidden transition-transform duration-300"
        style={{
          width: 280,
          transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
          boxShadow: menuOpen ? "12px 0 48px rgba(0,0,0,0.18)" : "none",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Drawer header */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}
        >
          <Image src="/logo.png" alt="PrototypeBD" width={36} height={36} />
          <span className="font-black uppercase tracking-wide" style={{ fontSize: 15, letterSpacing: 1 }}>
            PrototypeBD
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="ml-auto w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors"
                  style={{ fontSize: 15 }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Drawer footer */}
        <div className="px-5 py-5" style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}>
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="btn-pill w-full text-center block"
            style={{ fontSize: 13 }}
          >
            Log in
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN NAVBAR
      ══════════════════════════════════════════════════════════════════ */}
      <nav
        className="sticky top-0 z-40 flex items-center gap-3"
        style={{
          background: "#ffffff",
          height: "var(--navbar-h)",
          padding: "0 16px",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
        }}
        aria-label="Main navigation"
      >
        {/* Hamburger — mobile */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
          className="flex flex-col justify-center gap-[5px] w-9 h-9 items-center rounded-lg hover:bg-gray-100 transition-colors md:hidden shrink-0"
        >
          <span className="block h-0.5 w-[18px] bg-gray-700 rounded" />
          <span className="block h-0.5 w-[18px] bg-gray-700 rounded" />
          <span className="block h-0.5 w-[18px] bg-gray-700 rounded" />
        </button>

        {/* Logo + Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src="/logo.png" alt="PrototypeBD" width={40} height={40} className="rounded-full" priority />
          <span
            className="font-black uppercase hidden sm:block"
            style={{ fontSize: 16, letterSpacing: 1, color: "#111" }}
          >
            PrototypeBD
          </span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-1 ml-4">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="px-3 py-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors font-medium"
                style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Big search bar (desktop) ───────────────────────────── */}
        <button
          onClick={openSearch}
          aria-label="Open search"
          className="hidden md:flex flex-1 max-w-md mx-auto items-center gap-3 rounded-2xl border transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
          style={{
            background: "#f5f5f2",
            border: "1.5px solid rgba(0,0,0,0.1)",
            padding: "10px 18px",
            cursor: "text",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5" className="shrink-0">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span className="flex-1 text-left text-gray-400" style={{ fontSize: 14 }}>
            Search products…
          </span>
          <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-400 font-mono"
            style={{ fontSize: 10 }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Spacer (mobile) */}
        <div className="flex-1 md:hidden" />

        {/* Search icon — mobile */}
        <button
          onClick={openSearch}
          aria-label="Search"
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500 shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>

        {/* Log in — desktop */}
        <Link
          href="/login"
          className="hidden md:block shrink-0 text-gray-500 hover:text-gray-900 transition-colors font-medium"
          style={{ fontSize: 13 }}
        >
          Log in
        </Link>

        {/* Cart */}
        <button
          onClick={() => toggleCart()}
          aria-label={`Cart (${totalItems} items)`}
          className="btn-pill relative flex items-center gap-2 shrink-0"
          style={{ padding: "9px 18px", fontSize: 13 }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span className="hidden sm:inline">Cart</span>
          {mounted && totalItems > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full text-white"
              style={{ width: 18, height: 18, fontSize: 10, fontWeight: 700, background: "#e53e3e" }}
            >
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </button>
      </nav>

      <CartDrawer />
    </>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/#services", label: "Services" },
  { href: "/blog", label: "Blogs" },
  { href: "/about", label: "About Us" },
  { href: "/contact-us", label: "Contact Us" },
];

export function Navbar() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [navQuery, setNavQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const acctRef = useRef<HTMLDivElement>(null);
  const totalItems = useCartStore((s) => s.totalItems());
  const toggleCart = useCartStore((s) => s.toggleCart);
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const loggedIn = mounted && !!user;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) {
        setAcctOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

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

  function handleNavSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!navQuery.trim()) return;
    router.push(`/shop?search=${encodeURIComponent(navQuery.trim())}`);
    setNavQuery("");
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
          SEARCH OVERLAY (mobile / ⌘K)
      ══════════════════════════════════════════════════════════════════ */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeSearch(); }}
        >
          <div
            className="w-full max-w-3xl mx-4 mt-24 md:mt-32 bg-white rounded-3xl overflow-hidden"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.35)" }}
          >
            <form onSubmit={handleSearch} className="flex items-center gap-4 px-6 md:px-8 py-5 md:py-6">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f2890e" strokeWidth="2.5" className="shrink-0">
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
              {query.trim() && (
                <button type="submit" className="pbd-orange-btn shrink-0" style={{ fontSize: 13 }}>
                  Search
                </button>
              )}
              <button
                type="button"
                onClick={closeSearch}
                aria-label="Close search"
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-lg"
              >
                ✕
              </button>
            </form>
            <div
              className="flex items-center gap-6 px-6 md:px-8 py-3 border-t text-xs text-gray-400"
              style={{ borderColor: "rgba(0,0,0,0.06)", background: "#fafaf8" }}
            >
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-500 font-mono text-xs">↵</kbd>
                to search
              </span>
              <span className="ml-auto">Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-500 font-mono text-xs">⌘K</kbd> anytime</span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE MENU
      ══════════════════════════════════════════════════════════════════ */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(3px)" }}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
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
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
          <Image src="/logo.png" alt="Prototype BD" width={36} height={36} className="rounded-full" />
          <span className="font-black" style={{ fontSize: 15, letterSpacing: 0.3 }}>Prototype BD</span>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="ml-auto w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>
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
        <div className="px-5 py-5 flex flex-col gap-2" style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}>
          {loggedIn ? (
            <>
              <Link href="/account" onClick={() => setMenuOpen(false)} className="pbd-orange-btn w-full" style={{ fontSize: 13 }}>
                📦 My Orders
              </Link>
              {isAdmin() && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-center font-semibold py-2 text-gray-600" style={{ fontSize: 14 }}>
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => { clearAuth(); setMenuOpen(false); router.push("/"); }}
                className="text-center font-semibold py-2 text-red-600"
                style={{ fontSize: 14 }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="text-center font-semibold py-2 text-gray-600" style={{ fontSize: 14 }}>
                Sign in
              </Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="pbd-orange-btn w-full" style={{ fontSize: 13 }}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN NAVBAR — floating pill
      ══════════════════════════════════════════════════════════════════ */}
      <div className="pbd-navbar-shell">
        <nav className="pbd-navbar" aria-label="Main navigation">
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

          {/* Logo + brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image src="/logo.png" alt="Prototype BD" width={40} height={40} className="rounded-full" priority />
            <span className="font-black hidden sm:block" style={{ fontSize: 18, letterSpacing: 0.2, color: "#1b1e23" }}>
              Prototype BD
            </span>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden lg:flex items-center gap-1 ml-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="px-3 py-2 rounded-lg text-gray-700 hover:text-gray-950 transition-colors font-semibold"
                  style={{ fontSize: 13.5 }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Inline search pill (desktop) */}
          <form
            onSubmit={handleNavSearch}
            className="hidden md:flex flex-1 max-w-xs xl:max-w-sm mx-auto items-center gap-2 rounded-full"
            style={{ background: "#f1f2f4", border: "1px solid #e4e6ea", padding: "9px 8px 9px 18px" }}
          >
            <input
              value={navQuery}
              onChange={(e) => setNavQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search products"
              autoComplete="off"
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400"
              style={{ fontSize: 14 }}
            />
            <button
              type="submit"
              aria-label="Search"
              className="shrink-0 w-7 h-7 flex items-center justify-center"
              style={{ color: "#f2890e" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </form>

          {/* Spacer (mobile) */}
          <div className="flex-1 md:hidden" />

          {/* Search icon — mobile */}
          <button
            onClick={openSearch}
            aria-label="Search"
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors shrink-0"
            style={{ color: "#f2890e" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* Account / Auth — desktop */}
          {loggedIn ? (
            <div className="hidden md:block relative shrink-0" ref={acctRef}>
              <button
                onClick={() => setAcctOpen((v) => !v)}
                aria-label="Account menu"
                aria-expanded={acctOpen}
                className="flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1.5 hover:bg-gray-100 transition-colors"
                style={{ border: "1px solid #e4e6ea" }}
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black"
                  style={{ background: "linear-gradient(135deg,#fbab4d,#f2890e)", fontSize: 12 }}
                >
                  {(user!.first_name?.[0] ?? user!.email[0] ?? "?").toUpperCase()}
                </span>
                <span className="font-semibold text-gray-800" style={{ fontSize: 13 }}>
                  {user!.first_name || "Account"}
                </span>
              </button>
              {acctOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white rounded-2xl py-2 z-50"
                  style={{ border: "1px solid #e4e6ea", boxShadow: "0 16px 40px rgba(0,0,0,0.12)" }}
                >
                  <Link
                    href="/account"
                    onClick={() => setAcctOpen(false)}
                    className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    📦 My Orders
                  </Link>
                  {isAdmin() && (
                    <Link
                      href="/admin"
                      onClick={() => setAcctOpen(false)}
                      className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      🛠️ Admin Dashboard
                    </Link>
                  )}
                  <div className="my-1 border-t" style={{ borderColor: "#f1f2f4" }} />
                  <button
                    onClick={() => { clearAuth(); setAcctOpen(false); router.push("/"); }}
                    className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Sign in — desktop */}
              <Link
                href="/login"
                className="hidden md:block shrink-0 text-gray-700 hover:text-gray-950 transition-colors font-semibold"
                style={{ fontSize: 13.5 }}
              >
                Sign-in
              </Link>

              {/* Sign up — desktop */}
              <Link
                href="/signup"
                className="hidden md:inline-flex shrink-0 items-center rounded-full text-white font-bold"
                style={{ background: "#1b1e23", fontSize: 13, padding: "10px 22px" }}
              >
                Sign-up
              </Link>
            </>
          )}

          {/* Cart */}
          <button
            onClick={() => toggleCart()}
            aria-label={`Cart (${totalItems} items)`}
            className="relative shrink-0 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            style={{ color: "#1b1e23" }}
          >
            <svg width="20" height="20" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.67 8.67H7.34c-1.41 0-2.11 0-2.61.29-.44.25-.78.65-.95 1.12-.2.54-.09 1.24.14 2.62l1.01 6.07c.17 1.03.26 1.54.51 1.93.23.34.55.61.92.78.42.19.94.19 1.99.19h9.29c1.04 0 1.56 0 1.99-.19.37-.17.69-.44.92-.78.25-.39.34-.9.51-1.93l1.01-6.07c.23-1.39.35-2.08.15-2.62a2.02 2.02 0 0 0-.95-1.12c-.5-.29-1.21-.29-2.61-.29h-1.32m-8.67 0h8.67m-8.67 0c0-2.39 1.94-4.33 4.33-4.33s4.33 1.94 4.33 4.33" />
            </svg>
            {mounted && totalItems > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full text-white"
                style={{ width: 18, height: 18, fontSize: 10, fontWeight: 700, background: "#f2890e" }}
              >
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>
        </nav>
      </div>

      <CartDrawer />
    </>
  );
}

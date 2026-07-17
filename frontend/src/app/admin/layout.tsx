"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { logout, adminListReviews, getAdminBlogComments, getAdminProductComments, getContactMessages } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const NAV = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".8"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".4"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".4"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".8"/>
      </svg>
    ),
    superAdminOnly: false,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9Z" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    superAdminOnly: false,
  },
  {
    href: "/admin/reports",
    label: "Reports",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 2.5A.5.5 0 0 1 3.5 2h6.7a.5.5 0 0 1 .35.15l2.3 2.3a.5.5 0 0 1 .15.35V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-11Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M5.5 10.5V8M8 10.5V6.5M10.5 10.5v-1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    superAdminOnly: false,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5 14 5v6L8 14.5 2 11V5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M8 1.5v13M2 5l6 3.5M14 5l-6 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    superAdminOnly: false,
  },
  {
    href: "/admin/inventory",
    label: "Inventory",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="5" cy="4" r="1.2" fill="currentColor"/>
        <circle cx="5" cy="8" r="1.2" fill="currentColor"/>
        <circle cx="5" cy="12" r="1.2" fill="currentColor"/>
      </svg>
    ),
    superAdminOnly: false,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M2.5 13.5c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    superAdminOnly: false,
  },
  {
    href: "/admin/roles",
    label: "Roles",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5l5 2v3.2c0 3.1-2.1 5.6-5 6.3-2.9-.7-5-3.2-5-6.3V3.5l5-2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M6 8l1.5 1.5L10.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    superAdminOnly: false,
  },
  {
    href: "/admin/catalog",
    label: "Catalog",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 2.5A.5.5 0 0 1 2.5 2h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-4A.5.5 0 0 1 2 6.5v-4ZM9 2.5a.5.5 0 0 1 .5-.5H13a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H9.5A.5.5 0 0 1 9 6.5v-4ZM2 9.5A.5.5 0 0 1 2.5 9H7a1 1 0 0 1 1 1v3.5a.5.5 0 0 1-.5.5h-5A.5.5 0 0 1 2 13.5v-4ZM9.5 9h3a1.5 1.5 0 0 1 0 3h-3V9ZM9.5 12h3a1.5 1.5 0 0 1 0 3h-3v-3Z" fill="currentColor" opacity=".7"/>
      </svg>
    ),
    superAdminOnly: true,
  },
  {
    href: "/admin/blog",
    label: "Blog",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 2.5h7l3 3v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M5 7h6M5 9.5h6M5 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    superAdminOnly: false,
  },
  {
    href: "/admin/projects",
    label: "Projects",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="5.5" cy="6.5" r="1.2" fill="currentColor"/>
        <path d="M3 12l3.2-3 2.3 2 2-1.6L13 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    superAdminOnly: false,
  },
  {
    href: "/admin/reviews",
    label: "Reviews",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5l1.545 3.13 3.455.502-2.5 2.437.59 3.44L8 9.385l-3.09 1.624.59-3.44L3 5.132l3.455-.502L8 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    ),
    superAdminOnly: false,
  },
  {
    href: "/admin/product-comments",
    label: "Comments",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2.5 3.5h11a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H6l-3 2.5V11.5H2.5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M5 6.5h6M5 8.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    superAdminOnly: false,
  },
  {
    href: "/admin/messages",
    label: "Messages",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h9A1.5 1.5 0 0 1 14 4.5v7a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 11.5v-7Z" stroke="currentColor" strokeWidth="1.4"/>
        <path d="m2.5 4.5 5.5 4 5.5-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    superAdminOnly: false,
  },
  {
    href: "/admin/newsletter",
    label: "Newsletter",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2.5 2.5h9a1 1 0 0 1 1 1V13l-2-1.2L8.5 13l-2-1.2L4.5 13l-2-1.2V3.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M5 5.5h5M5 7.5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    superAdminOnly: false,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, canManageInventory, isSuperAdmin, hasPermission, clearAuth } = useAuthStore();

  const [pendingReviews, setPendingReviews] = useState(0);
  const [pendingComments, setPendingComments] = useState(0);
  const [pendingProductComments, setPendingProductComments] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => { setMobileNavOpen(false); }, [pathname]);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (!isAdmin() && !canManageInventory() && user.role !== "support") router.push("/");
  }, [user, isAdmin, canManageInventory, router]);

  // Live pending counts for the sidebar badges. Refetched on navigation so the
  // badge clears right after an admin approves/deletes an item.
  const loadBadges = useCallback(async () => {
    if (!user) return;
    if (hasPermission("reviews.moderate")) {
      try {
        const reviews = await adminListReviews();
        setPendingReviews(reviews.filter((r) => !r.is_approved).length);
      } catch { /* ignore */ }
    }
    if (hasPermission("blog.manage")) {
      try {
        const pending = await getAdminBlogComments(false);
        setPendingComments(pending.length);
      } catch { /* ignore */ }
    }
    if (hasPermission("products.manage")) {
      try {
        const pending = await getAdminProductComments(false);
        setPendingProductComments(pending.length);
      } catch { /* ignore */ }
    }
    if (hasPermission("messages.view")) {
      try {
        const unread = await getContactMessages(true);
        setUnreadMessages(unread.length);
      } catch { /* ignore */ }
    }
  }, [user, hasPermission]);

  useEffect(() => { loadBadges(); }, [loadBadges, pathname]);

  if (!user) return null;

  const activeLabel =
    NAV.find((item) =>
      item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
    )?.label ?? "Admin";

  const visibleNav = NAV.filter((item) => {
    if (item.superAdminOnly) return isSuperAdmin();
    if (item.href === "/admin/roles") return hasPermission("roles.manage");
    if (item.href === "/admin/projects") return hasPermission("blog.manage");
    if (item.href === "/admin/users" || item.href === "/admin/reports" || item.href === "/admin/blog") return isAdmin();
    if (item.href === "/admin/inventory" || item.href === "/admin/products" || item.href === "/admin/product-comments") return canManageInventory();
    if (item.href === "/admin/messages" || item.href === "/admin/newsletter") return hasPermission("messages.view");
    return true;
  });

  async function handleLogout() {
    await logout().catch(() => {});
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#f7f7f5" }}>
      {/* Mobile backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden admin-print-hide"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setMobileNavOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar — fixed drawer on mobile, sticky column on desktop */}
      <aside
        className={`w-[220px] flex flex-col shrink-0 fixed lg:sticky top-0 left-0 z-40 h-screen admin-print-hide transform transition-transform duration-200 lg:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "#0f0f0f" }}
      >
        {/* Brand */}
        <div className="px-5 pt-7 pb-6">
          <p className="text-white font-semibold text-sm tracking-tight">PrototypeBD</p>
          <p style={{ color: "#555", fontSize: 11 }} className="mt-0.5 font-medium tracking-widest uppercase">
            Admin
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {visibleNav.map((item) => {
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            const badge =
              item.href === "/admin/reviews" ? pendingReviews :
              item.href === "/admin/blog" ? pendingComments :
              item.href === "/admin/product-comments" ? pendingProductComments :
              item.href === "/admin/messages" ? unreadMessages : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-150"
                style={{
                  color: active ? "#fff" : "#666",
                  background: active ? "rgba(255,255,255,0.08)" : "transparent",
                  fontWeight: active ? 500 : 400,
                }}
              >
                <span style={{ color: active ? "#fff" : "#555" }}>{item.icon}</span>
                {item.label}
                {badge > 0 && (
                  <span
                    className="ml-auto flex items-center justify-center rounded-full font-bold"
                    style={{
                      minWidth: 18, height: 18, padding: "0 5px",
                      fontSize: 10, background: "#f2890e", color: "#fff",
                    }}
                    title={`${badge} pending`}
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-5 mt-auto" style={{ borderTop: "1px solid #1e1e1e" }}>
          <div
            className="flex items-center gap-2.5 mb-3"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: "#2a2a2a", color: "#888" }}
            >
              {user.first_name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs truncate capitalize" style={{ color: "#555" }}>
                {user.role.replace("_", " ")}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="text-xs transition" style={{ color: "#555" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#aaa")}
              onMouseLeave={e => (e.currentTarget.style.color = "#555")}
            >
              ← Store
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs transition"
              style={{ color: "#555" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#e5484d")}
              onMouseLeave={e => (e.currentTarget.style.color = "#555")}
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto min-h-screen flex flex-col">
        {/* Black top bar */}
        <header
          className="sticky top-0 z-20 flex items-center gap-3 sm:gap-4 px-4 sm:px-8 admin-print-hide"
          style={{
            background: "#0f0f0f",
            height: 60,
            borderBottom: "1px solid #1e1e1e",
          }}
        >
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileNavOpen((v) => !v)}
            className="lg:hidden flex items-center justify-center rounded-lg shrink-0"
            style={{ width: 34, height: 34, background: "#1e1e1e", color: "#ddd" }}
            aria-label="Toggle navigation"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <span className="text-white font-semibold tracking-tight" style={{ fontSize: 14 }}>
            {activeLabel}
          </span>
          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/"
              className="hidden sm:inline-block text-xs font-medium transition"
              style={{ color: "#888" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
            >
              View store ↗
            </Link>
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: "#2a2a2a", color: "#ccc" }}
              >
                {user.first_name?.[0]?.toUpperCase() ?? "A"}
              </div>
              <span className="text-white font-medium hidden sm:block" style={{ fontSize: 13 }}>
                {user.first_name} {user.last_name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
              style={{ background: "#1e1e1e", color: "#ddd" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e5484d")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#1e1e1e")}
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}

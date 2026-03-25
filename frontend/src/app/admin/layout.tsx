"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { logout } from "@/lib/api";
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
    href: "/admin/catalog",
    label: "Catalog",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 2.5A.5.5 0 0 1 2.5 2h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-4A.5.5 0 0 1 2 6.5v-4ZM9 2.5a.5.5 0 0 1 .5-.5H13a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H9.5A.5.5 0 0 1 9 6.5v-4ZM2 9.5A.5.5 0 0 1 2.5 9H7a1 1 0 0 1 1 1v3.5a.5.5 0 0 1-.5.5h-5A.5.5 0 0 1 2 13.5v-4ZM9.5 9h3a1.5 1.5 0 0 1 0 3h-3V9ZM9.5 12h3a1.5 1.5 0 0 1 0 3h-3v-3Z" fill="currentColor" opacity=".7"/>
      </svg>
    ),
    superAdminOnly: true,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, canManageInventory, isSuperAdmin, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (!isAdmin() && !canManageInventory() && user.role !== "support") router.push("/");
  }, [user, isAdmin, canManageInventory, router]);

  if (!user) return null;

  const visibleNav = NAV.filter((item) => {
    if (item.superAdminOnly) return isSuperAdmin();
    if (item.href === "/admin/users") return isAdmin();
    if (item.href === "/admin/inventory" || item.href === "/admin/products") return canManageInventory();
    return true;
  });

  async function handleLogout() {
    await logout().catch(() => {});
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#f7f7f5" }}>
      {/* Sidebar */}
      <aside
        className="w-[220px] flex flex-col shrink-0 sticky top-0 h-screen"
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
      <main className="flex-1 overflow-auto min-h-screen">{children}</main>
    </div>
  );
}

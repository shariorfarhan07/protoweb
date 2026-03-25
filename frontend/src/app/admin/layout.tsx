"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { logout } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "◈", superAdminOnly: false },
  { href: "/admin/orders", label: "Orders", icon: "📦", superAdminOnly: false },
  { href: "/admin/products", label: "Products", icon: "🖨", superAdminOnly: false },
  { href: "/admin/inventory", label: "Inventory", icon: "🗃", superAdminOnly: false },
  { href: "/admin/users", label: "Users", icon: "👥", superAdminOnly: false },
  { href: "/admin/catalog", label: "Catalog", icon: "🏷", superAdminOnly: true },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, canManageInventory, isSuperAdmin, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!isAdmin() && !canManageInventory() && user.role !== "support") {
      router.push("/");
    }
  }, [user, isAdmin, canManageInventory, router]);

  if (!user) return null;

  const visibleNav = NAV_ITEMS.filter((item) => {
    if (item.superAdminOnly) return isSuperAdmin();
    if (item.href === "/admin/users") return isAdmin();
    if (item.href === "/admin/inventory" || item.href === "/admin/products")
      return canManageInventory();
    return true;
  });

  async function handleLogout() {
    await logout().catch(() => {});
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-gray-700">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
            PrototypeBD
          </p>
          <p className="text-sm font-bold">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {visibleNav.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                  active
                    ? "bg-white/10 text-white font-medium"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-700 space-y-1">
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
          <p className="text-xs font-medium text-gray-300 capitalize">{user.role}</p>
          <div className="flex gap-2 mt-2">
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-white transition"
            >
              ← Store
            </Link>
            <span className="text-gray-600">·</span>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-red-400 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

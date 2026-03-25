"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminUsers, updateUser } from "@/lib/api";
import type { PaginatedResponse, UserPublic } from "@/lib/api-types";

const ROLES = [
  "customer",
  "support",
  "inventory_manager",
  "admin",
  "super_admin",
] as const;

const ROLE_COLORS: Record<string, string> = {
  customer: "bg-gray-100 text-gray-700",
  support: "bg-blue-100 text-blue-700",
  inventory_manager: "bg-purple-100 text-purple-700",
  admin: "bg-amber-100 text-amber-800",
  super_admin: "bg-red-100 text-red-800",
};

export default function AdminUsersPage() {
  const [data, setData] = useState<PaginatedResponse<UserPublic> | null>(null);
  const [filterRole, setFilterRole] = useState<string>("");
  const [filterActive, setFilterActive] = useState<string>("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminUsers({
        role: filterRole || undefined,
        is_active:
          filterActive === "true"
            ? true
            : filterActive === "false"
            ? false
            : undefined,
        page,
        page_size: 20,
      });
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [filterRole, filterActive, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleToggleActive(user: UserPublic) {
    setUpdatingId(user.id);
    try {
      const updated = await updateUser(user.id, { is_active: !user.is_active });
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((u) => (u.id === updated.id ? updated : u)),
            }
          : prev
      );
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleRoleChange(userId: number, newRole: string) {
    setUpdatingId(userId);
    try {
      const updated = await updateUser(userId, { role: newRole });
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((u) => (u.id === updated.id ? updated : u)),
            }
          : prev
      );
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Users</h1>
      <p className="text-sm text-gray-500 mb-6">
        {data ? `${data.total} users total` : "Loading…"}
      </p>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <select
          value={filterRole}
          onChange={(e) => {
            setFilterRole(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-200 text-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r} className="capitalize">
              {r.replace("_", " ")}
            </option>
          ))}
        </select>

        <select
          value={filterActive}
          onChange={(e) => {
            setFilterActive(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-200 text-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All accounts</option>
          <option value="true">Active</option>
          <option value="false">Disabled</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Joined</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading && data?.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            )}
            {!loading &&
              data?.items.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      defaultValue={user.role}
                      disabled={updatingId === user.id}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="rounded-md border border-gray-200 text-xs px-2 py-1 bg-white disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {user.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(user.created_at).toLocaleDateString("en-BD")}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(user)}
                      disabled={updatingId === user.id}
                      className={`text-xs font-medium px-3 py-1.5 rounded-md transition disabled:opacity-40 disabled:cursor-not-allowed ${
                        user.is_active
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {updatingId === user.id
                        ? "…"
                        : user.is_active
                        ? "Disable"
                        : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-gray-500">
            Page {data.page} of {data.total_pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              disabled={page >= data.total_pages}
              className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

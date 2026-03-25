"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminUsers, updateUser } from "@/lib/api";
import type { PaginatedResponse, UserPublic } from "@/lib/api-types";

const ROLES = ["customer", "support", "inventory_manager", "admin", "super_admin"] as const;

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  customer:          { bg: "#f5f5f5",  color: "#555" },
  support:           { bg: "#edf6ff",  color: "#0070c9" },
  inventory_manager: { bg: "#f0edff",  color: "#6e40c9" },
  admin:             { bg: "#fff8ed",  color: "#c45b00" },
  super_admin:       { bg: "#fff1f1",  color: "#c92a2a" },
};

const TH = "px-5 py-3 text-left font-medium uppercase tracking-widest whitespace-nowrap";
const TD = "px-5 py-3.5 align-middle";

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
        is_active: filterActive === "true" ? true : filterActive === "false" ? false : undefined,
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

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handleToggleActive(user: UserPublic) {
    setUpdatingId(user.id);
    try {
      const updated = await updateUser(user.id, { is_active: !user.is_active });
      setData((prev) =>
        prev ? { ...prev, items: prev.items.map((u) => (u.id === updated.id ? updated : u)) } : prev
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
        prev ? { ...prev, items: prev.items.map((u) => (u.id === updated.id ? updated : u)) } : prev
      );
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdatingId(null);
    }
  }

  const selectCls = "text-sm rounded-lg px-3 py-2 transition focus:outline-none";
  const selectStyle = { border: "1px solid #e0e0e0", background: "#fff", color: "#333" };

  return (
    <div className="p-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "#111" }}>Users</h1>
          <p style={{ color: "#aaa", fontSize: 13 }} className="mt-1">
            {data ? `${data.total} accounts` : "Loading…"}
          </p>
        </div>

        <div className="flex gap-2">
          <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
            className={selectCls} style={selectStyle}>
            <option value="">All roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
          </select>
          <select value={filterActive} onChange={(e) => { setFilterActive(e.target.value); setPage(1); }}
            className={selectCls} style={selectStyle}>
            <option value="">All accounts</option>
            <option value="true">Active</option>
            <option value="false">Disabled</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl px-4 py-3 text-sm"
          style={{ background: "#fff1f1", color: "#c92a2a", border: "1px solid #ffd6d6" }}>
          {error}
        </div>
      )}

      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <table className="w-full text-sm">
          <thead style={{ borderBottom: "1px solid #f0f0f0" }}>
            <tr>
              {["Name", "Email", "Role", "Status", "Joined", ""].map((h, i) => (
                <th key={i} className={TH} style={{ fontSize: 10, color: "#bbb" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f7f7f7" }}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} className={TD}>
                    <div className="h-3.5 rounded-full animate-pulse" style={{ background: "#f0f0f0", width: j === 0 ? "100px" : "80px" }} />
                  </td>
                ))}
              </tr>
            ))}

            {!loading && data?.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-sm" style={{ color: "#bbb" }}>
                  No users found
                </td>
              </tr>
            )}

            {!loading && data?.items.map((user) => (
              <tr
                key={user.id}
                className="transition-colors"
                style={{ borderBottom: "1px solid #f7f7f7" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fafaf8")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}
              >
                <td className={TD}>
                  <p className="font-medium" style={{ color: "#111" }}>
                    {user.first_name} {user.last_name}
                  </p>
                </td>
                <td className={TD} style={{ color: "#777", fontSize: 13 }}>{user.email}</td>
                <td className={TD}>
                  <select
                    defaultValue={user.role}
                    disabled={updatingId === user.id}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="text-xs rounded-lg px-2 py-1.5 focus:outline-none disabled:opacity-40"
                    style={{ border: "1px solid #e0e0e0", background: "#fff", color: "#333" }}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                  </select>
                </td>
                <td className={TD}>
                  <span
                    className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={user.is_active ? { background: "#edfff5", color: "#1a7a45" } : { background: "#f5f5f5", color: "#aaa" }}
                  >
                    {user.is_active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className={TD} style={{ fontSize: 12, color: "#aaa" }}>
                  {new Date(user.created_at).toLocaleDateString("en-BD")}
                </td>
                <td className={TD}>
                  <button
                    onClick={() => handleToggleActive(user)}
                    disabled={updatingId === user.id}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-40"
                    style={user.is_active
                      ? { background: "#fff1f1", color: "#c92a2a" }
                      : { background: "#edfff5", color: "#1a7a45" }}
                  >
                    {updatingId === user.id ? "…" : user.is_active ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination data={data} page={page} setPage={setPage} />
    </div>
  );
}

function Pagination({
  data, page, setPage,
}: {
  data: PaginatedResponse<unknown> | null;
  page: number;
  setPage: (fn: (p: number) => number) => void;
}) {
  if (!data || data.total_pages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-5">
      <p style={{ fontSize: 12, color: "#aaa" }}>Page {data.page} of {data.total_pages}</p>
      <div className="flex gap-2">
        {(["Previous", "Next"] as const).map((label) => {
          const disabled = label === "Previous" ? page <= 1 : page >= data.total_pages;
          return (
            <button key={label}
              onClick={() => setPage((p) => label === "Previous" ? Math.max(1, p - 1) : Math.min(data.total_pages, p + 1))}
              disabled={disabled}
              className="text-xs rounded-lg px-3 py-1.5 transition font-medium disabled:opacity-30"
              style={{ border: "1px solid #e0e0e0", background: "#fff", color: "#333" }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getRoles,
  getPermissions,
  createRole,
  updateRole,
  deleteRole,
} from "@/lib/api";
import type { Permission, RoleOut } from "@/lib/api-types";

type EditorState =
  | { open: false }
  | { open: true; role: RoleOut | null }; // null = create

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<RoleOut[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>({ open: false });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [r, p] = await Promise.all([getRoles(), getPermissions()]);
      setRoles(r);
      setPermissions(p);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(role: RoleOut) {
    if (!confirm(`Delete the “${role.name}” role? This cannot be undone.`)) return;
    try {
      await deleteRole(role.id);
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="p-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "#111" }}>
            Roles &amp; Permissions
          </h1>
          <p style={{ color: "#aaa", fontSize: 13 }} className="mt-1">
            {loading ? "Loading…" : `${roles.length} roles · ${permissions.length} permissions`}
          </p>
        </div>
        <button
          onClick={() => setEditor({ open: true, role: null })}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition"
          style={{ background: "#111" }}
        >
          + New role
        </button>
      </div>

      {error && (
        <div
          className="mb-5 rounded-xl px-4 py-3 text-sm"
          style={{ background: "#fff1f1", color: "#c92a2a", border: "1px solid #ffd6d6" }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl h-40 animate-pulse" style={{ background: "#efefef" }} />
            ))
          : roles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                permissions={permissions}
                onEdit={() => setEditor({ open: true, role })}
                onDelete={() => handleDelete(role)}
              />
            ))}
      </div>

      {editor.open && (
        <RoleEditor
          role={editor.role}
          permissions={permissions}
          onClose={() => setEditor({ open: false })}
          onSaved={async () => {
            setEditor({ open: false });
            await load();
          }}
        />
      )}
    </div>
  );
}

// ── Role card ────────────────────────────────────────────────────────────────

function RoleCard({
  role,
  permissions,
  onEdit,
  onDelete,
}: {
  role: RoleOut;
  permissions: Permission[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const total = permissions.length;
  const granted = role.is_superuser ? total : role.permissions.length;
  const canDelete = !role.is_system && role.user_count === 0;

  return (
    <div className="rounded-2xl p-5 flex flex-col" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold truncate" style={{ color: "#111", fontSize: 15 }}>
            {role.name}
          </h3>
          <p className="font-mono text-xs mt-0.5" style={{ color: "#bbb" }}>
            {role.slug}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {role.is_system && (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: "#eef2ff", color: "#4338ca" }}>
              Built-in
            </span>
          )}
          {role.is_superuser && (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: "#fff1f1", color: "#c92a2a" }}>
              Superuser
            </span>
          )}
        </div>
      </div>

      <p className="text-sm mt-2 flex-1" style={{ color: "#777", minHeight: 36 }}>
        {role.description || "—"}
      </p>

      <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: "#888" }}>
        <span>
          <strong style={{ color: "#111" }}>{role.is_superuser ? "All" : granted}</strong>
          {role.is_superuser ? "" : `/${total}`} permissions
        </span>
        <span>
          <strong style={{ color: "#111" }}>{role.user_count}</strong> user{role.user_count !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={onEdit}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
          style={{ border: "1px solid #e0e0e0", color: "#333", background: "#fff" }}
        >
          {role.is_superuser ? "View" : "Edit"}
        </button>
        <button
          onClick={onDelete}
          disabled={!canDelete}
          title={
            role.is_system
              ? "Built-in roles can't be deleted"
              : role.user_count > 0
                ? "Reassign users before deleting"
                : "Delete role"
          }
          className="rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: "#fff1f1", color: "#c92a2a" }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// ── Role editor (create / edit) ────────────────────────────────────────────────

function RoleEditor({
  role,
  permissions,
  onClose,
  onSaved,
}: {
  role: RoleOut | null;
  permissions: Permission[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isSuper = role?.is_superuser ?? false;
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(role?.permissions ?? [])
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Group permissions by their `group`, preserving first-seen order.
  const groups = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const p of permissions) {
      if (!map.has(p.group)) map.set(p.group, []);
      map.get(p.group)!.push(p);
    }
    return Array.from(map.entries());
  }, [permissions]);

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleGroup(keys: string[], allOn: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => (allOn ? next.delete(k) : next.add(k)));
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setErr(null);
    try {
      const perms = Array.from(selected);
      if (role) {
        await updateRole(role.id, {
          name,
          description,
          ...(isSuper ? {} : { permissions: perms }),
        });
      } else {
        await createRole({ name, description, permissions: perms });
      }
      onSaved();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl h-full bg-white flex flex-col" style={{ boxShadow: "-8px 0 40px rgba(0,0,0,0.2)" }}>
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid #f0f0f0" }}>
          <div>
            <h2 className="font-semibold" style={{ color: "#111", fontSize: 16 }}>
              {role ? (isSuper ? "View role" : "Edit role") : "New role"}
            </h2>
            {role && <p className="font-mono text-xs mt-0.5" style={{ color: "#bbb" }}>{role.slug}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full text-gray-400 hover:bg-gray-100 transition" aria-label="Close">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {err && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#fff1f1", color: "#c92a2a", border: "1px solid #ffd6d6" }}>
              {err}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#999" }}>
              Role name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Content Editor"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ border: "1px solid #e0e0e0" }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#999" }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What is this role for?"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none resize-none"
              style={{ border: "1px solid #e0e0e0" }}
            />
          </div>

          {isSuper ? (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#fff8ed", color: "#92600a", border: "1px solid #ffe6bf" }}>
              The super-admin role always holds <strong>every</strong> permission — including ones added in the future.
              Its permission set can&apos;t be edited.
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#999" }}>
                Permissions
              </p>
              <div className="space-y-4">
                {groups.map(([group, perms]) => {
                  const keys = perms.map((p) => p.key);
                  const allOn = keys.every((k) => selected.has(k));
                  const someOn = keys.some((k) => selected.has(k));
                  return (
                    <div key={group} className="rounded-xl overflow-hidden" style={{ border: "1px solid #f0f0f0" }}>
                      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "#fafaf8" }}>
                        <span className="text-sm font-semibold" style={{ color: "#333" }}>{group}</span>
                        <button
                          onClick={() => toggleGroup(keys, allOn)}
                          className="text-xs font-semibold transition"
                          style={{ color: someOn && !allOn ? "#f2890e" : "#0070c9" }}
                        >
                          {allOn ? "Clear all" : "Select all"}
                        </button>
                      </div>
                      <div>
                        {perms.map((p) => (
                          <label
                            key={p.key}
                            className="flex items-start gap-3 px-4 py-2.5 cursor-pointer transition hover:bg-gray-50"
                            style={{ borderTop: "1px solid #f6f6f6" }}
                          >
                            <input
                              type="checkbox"
                              checked={selected.has(p.key)}
                              onChange={() => toggle(p.key)}
                              className="mt-0.5"
                              style={{ accentColor: "#111" }}
                            />
                            <span className="min-w-0">
                              <span className="block text-sm font-medium" style={{ color: "#222" }}>{p.label}</span>
                              <span className="block text-xs" style={{ color: "#999" }}>
                                {p.description} <span className="font-mono">· {p.key}</span>
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-end gap-3" style={{ borderTop: "1px solid #f0f0f0" }}>
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold transition" style={{ color: "#666" }}>
            Cancel
          </button>
          {!(isSuper && role) && (
            <button
              onClick={save}
              disabled={saving || name.trim().length < 2}
              className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-40"
              style={{ background: "#111" }}
            >
              {saving ? "Saving…" : role ? "Save changes" : "Create role"}
            </button>
          )}
          {isSuper && role && (
            <button
              onClick={save}
              disabled={saving || name.trim().length < 2}
              className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-40"
              style={{ background: "#111" }}
            >
              {saving ? "Saving…" : "Save name"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

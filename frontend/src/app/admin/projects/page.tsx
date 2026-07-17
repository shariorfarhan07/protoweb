"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  getAdminProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/lib/api";
import type { CommunityProject, CommunityProjectPayload } from "@/lib/api-types";
import { buildImageUrl } from "@/lib/utils";
import ImageUpload from "@/components/admin/ImageUpload";

const TH = "px-5 py-3 text-left font-medium uppercase tracking-widest whitespace-nowrap";
const TD = "px-5 py-3.5 align-middle";

const EMPTY: CommunityProjectPayload = {
  title: "",
  description: "",
  image_url: "",
  author_name: "",
  project_url: "",
  is_featured: false,
  is_approved: true,
  sort_order: 0,
};

interface FormModalProps {
  initial?: CommunityProject | null;
  onClose: () => void;
  onSaved: () => void;
}

function FormModal({ initial, onClose, onSaved }: FormModalProps) {
  const [form, setForm] = useState<CommunityProjectPayload>(
    initial
      ? {
          title: initial.title,
          description: initial.description ?? "",
          image_url: initial.image_url ?? "",
          author_name: initial.author_name,
          project_url: initial.project_url ?? "",
          is_featured: initial.is_featured,
          is_approved: initial.is_approved,
          sort_order: initial.sort_order,
        }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof CommunityProjectPayload, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError(null);
    try {
      const payload: CommunityProjectPayload = {
        ...form,
        author_name: form.author_name?.trim() || "Community",
        description: form.description || null,
        image_url: form.image_url || null,
        project_url: form.project_url || null,
      };
      if (initial) await updateProject(initial.id, payload);
      else await createProject(payload);
      onSaved();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>
            {initial ? "Edit project" : "Add project"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {error && (
            <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "#fff1f1", color: "#c92a2a" }}>{error}</div>
          )}

          <ImageUpload value={form.image_url ?? ""} onChange={(url) => set("image_url", url)} label="Project Photo" />

          <div>
            <label className={labelCls}>Title *</label>
            <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Articulated Dragon" required />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea className={inputCls + " resize-none"} rows={3} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="A short description of the build…" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Author / Maker</label>
              <input className={inputCls} value={form.author_name ?? ""} onChange={(e) => set("author_name", e.target.value)} placeholder="Community" />
            </div>
            <div>
              <label className={labelCls}>Sort order</label>
              <input type="number" className={inputCls} value={form.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} min={0} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Project link (optional)</label>
            <input className={inputCls} value={form.project_url ?? ""} onChange={(e) => set("project_url", e.target.value)} placeholder="https://…" />
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" className="w-4 h-4 accent-gray-900" checked={!!form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} />
              <span className="text-sm text-gray-700">Featured ★</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" className="w-4 h-4 accent-gray-900" checked={!!form.is_approved} onChange={(e) => set("is_approved", e.target.checked)} />
              <span className="text-sm text-gray-700">Show on site</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 text-sm rounded-lg font-medium text-white" style={{ background: "#111", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving…" : initial ? "Save changes" : "Add project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<"new" | CommunityProject | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProjects(await getAdminProjects());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this project?")) return;
    setDeletingId(id);
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Builds shown in the homepage gallery &amp; Hall of Fame
          </p>
        </div>
        <button
          onClick={() => setModal("new")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white hover:opacity-80"
          style={{ background: "#111" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          Add Project
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl px-4 py-3 text-sm" style={{ background: "#fff1f1", color: "#c92a2a" }}>{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-sm text-gray-400">Loading…</div>
        ) : projects.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-sm">No projects yet.</p>
            <button onClick={() => setModal("new")} className="mt-4 text-sm font-medium text-gray-900 underline underline-offset-2">Add the first one</button>
          </div>
        ) : (
          <table className="w-full text-sm" style={{ color: "#111" }}>
            <thead>
              <tr className="border-b border-gray-100" style={{ fontSize: 10, color: "#9ca3af" }}>
                <th className={TH}>Photo</th>
                <th className={TH}>Title</th>
                <th className={TH}>Author</th>
                <th className={TH}>Status</th>
                <th className={TH}>Sort</th>
                <th className={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className={TD}>
                    <div className="relative w-14 h-11 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {p.image_url ? (
                        <Image src={buildImageUrl(p.image_url)} alt={p.title} fill className="object-cover" unoptimized />
                      ) : (
                        <span className="text-lg">🛠️</span>
                      )}
                    </div>
                  </td>
                  <td className={TD}>
                    <div className="font-medium text-gray-900">{p.title}</div>
                    {p.description && <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate" style={{ maxWidth: 240 }}>{p.description}</div>}
                  </td>
                  <td className={TD + " text-gray-600"}>{p.author_name}</td>
                  <td className={TD}>
                    <div className="flex flex-wrap gap-1.5">
                      {p.is_featured && (
                        <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "#fff4e5", color: "#c45b00" }}>★ Featured</span>
                      )}
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={p.is_approved ? { background: "#edfff5", color: "#1a7a45" } : { background: "#f3f4f6", color: "#6b7280" }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.is_approved ? "#1a7a45" : "#9ca3af" }} />
                        {p.is_approved ? "Visible" : "Hidden"}
                      </span>
                    </div>
                  </td>
                  <td className={TD + " text-gray-500"}>{p.sort_order}</td>
                  <td className={TD}>
                    <div className="flex gap-2">
                      <button onClick={() => setModal(p)} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50">Edit</button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: "#fff1f1", color: "#c92a2a", opacity: deletingId === p.id ? 0.5 : 1 }}
                      >
                        {deletingId === p.id ? "…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal !== null && (
        <FormModal
          initial={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchProjects(); }}
        />
      )}
    </div>
  );
}

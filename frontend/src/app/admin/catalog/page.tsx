"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminListCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminListBrands,
  adminCreateBrand,
  adminUpdateBrand,
  adminDeleteBrand,
  adminListProductTypes,
  adminCreateProductType,
  adminUpdateProductType,
  adminDeleteProductType,
} from "@/lib/api";
import type {
  CategorySchema,
  BrandSchema,
  ProductTypeSchema,
} from "@/lib/api-types";
import { useAuthStore } from "@/store/auth";

type Tab = "categories" | "brands" | "product-types";

// ── Generic inline-edit row ────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── Category tab ──────────────────────────────────────────────────────────────

function CategoriesTab() {
  const [items, setItems] = useState<CategorySchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<CategorySchema>>({});
  const [creating, setCreating] = useState(false);
  const [newData, setNewData] = useState<Partial<CategorySchema>>({});

  useEffect(() => {
    adminListCategories()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Delete category "${name}"? Products in this category will lose their category assignment.`))
      return;
    try {
      await adminDeleteCategory(id);
      setItems((prev) => prev.filter((c) => c.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function handleSaveEdit(id: number) {
    try {
      const updated = await adminUpdateCategory(id, editData);
      setItems((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditId(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function handleCreate() {
    if (!newData.name?.trim()) return setError("Name is required");
    if (!newData.slug?.trim()) return setError("Slug is required");
    try {
      const created = await adminCreateCategory({
        name: newData.name.trim(),
        slug: newData.slug.trim(),
        description: newData.description ?? null,
        image_url: newData.image_url ?? null,
        gradient_css: newData.gradient_css ?? null,
      });
      setItems((prev) => [...prev, created]);
      setCreating(false);
      setNewData({});
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Create failed");
    }
  }

  if (loading) return <div className="p-6 text-sm text-gray-400">Loading…</div>;

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
          <button className="ml-3 text-red-500 hover:text-red-800" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Gradient CSS</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((cat) =>
              editId === cat.id ? (
                <tr key={cat.id} className="bg-blue-50">
                  <td className="px-4 py-2">
                    <input
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      value={editData.name ?? cat.name}
                      onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      value={editData.slug ?? cat.slug}
                      onChange={(e) => setEditData((d) => ({ ...d, slug: e.target.value }))}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      value={editData.description ?? cat.description ?? ""}
                      onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-mono text-xs"
                      value={editData.gradient_css ?? cat.gradient_css ?? ""}
                      onChange={(e) => setEditData((d) => ({ ...d, gradient_css: e.target.value }))}
                    />
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button
                      onClick={() => handleSaveEdit(cat.id)}
                      className="text-xs bg-gray-900 text-white px-3 py-1 rounded hover:bg-gray-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditId(null); setEditData({}); }}
                      className="text-xs text-gray-500 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{cat.description ?? "—"}</td>
                  <td className="px-4 py-3">
                    {cat.gradient_css ? (
                      <span
                        className="inline-block rounded px-2 py-0.5 text-xs"
                        style={{ background: cat.gradient_css }}
                      >
                        preview
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button
                      onClick={() => { setEditId(cat.id); setEditData({}); }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}

            {/* Create row */}
            {creating && (
              <tr className="bg-green-50">
                <td className="px-4 py-2">
                  <input
                    autoFocus
                    placeholder="Name"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    value={newData.name ?? ""}
                    onChange={(e) => {
                      const name = e.target.value;
                      setNewData((d) => ({ ...d, name, slug: slugify(name) }));
                    }}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    placeholder="slug"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    value={newData.slug ?? ""}
                    onChange={(e) => setNewData((d) => ({ ...d, slug: e.target.value }))}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    placeholder="Description (optional)"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    value={newData.description ?? ""}
                    onChange={(e) => setNewData((d) => ({ ...d, description: e.target.value }))}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    placeholder="e.g. linear-gradient(135deg, #ddeeff, #b8d8f8)"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs font-mono"
                    value={newData.gradient_css ?? ""}
                    onChange={(e) => setNewData((d) => ({ ...d, gradient_css: e.target.value }))}
                  />
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    onClick={handleCreate}
                    className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setCreating(false); setNewData({}); }}
                    className="text-xs text-gray-500 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!creating && (
        <button
          onClick={() => setCreating(true)}
          className="text-sm text-blue-600 hover:underline"
        >
          + Add category
        </button>
      )}
    </div>
  );
}

// ── Brands tab ────────────────────────────────────────────────────────────────

function BrandsTab() {
  const [items, setItems] = useState<BrandSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<BrandSchema>>({});
  const [creating, setCreating] = useState(false);
  const [newData, setNewData] = useState<Partial<BrandSchema>>({});

  useEffect(() => {
    adminListBrands()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Delete brand "${name}"? Products using this brand will lose their brand assignment.`))
      return;
    try {
      await adminDeleteBrand(id);
      setItems((prev) => prev.filter((b) => b.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function handleSaveEdit(id: number) {
    try {
      const updated = await adminUpdateBrand(id, editData);
      setItems((prev) => prev.map((b) => (b.id === id ? updated : b)));
      setEditId(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function handleCreate() {
    if (!newData.name?.trim()) return setError("Name is required");
    if (!newData.slug?.trim()) return setError("Slug is required");
    try {
      const created = await adminCreateBrand({
        name: newData.name.trim(),
        slug: newData.slug.trim(),
        description: newData.description ?? null,
        logo_url: newData.logo_url ?? null,
      });
      setItems((prev) => [...prev, created]);
      setCreating(false);
      setNewData({});
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Create failed");
    }
  }

  if (loading) return <div className="p-6 text-sm text-gray-400">Loading…</div>;

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
          <button className="ml-3 text-red-500 hover:text-red-800" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Logo URL</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((brand) =>
              editId === brand.id ? (
                <tr key={brand.id} className="bg-blue-50">
                  <td className="px-4 py-2">
                    <input
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      value={editData.name ?? brand.name}
                      onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      value={editData.slug ?? brand.slug}
                      onChange={(e) => setEditData((d) => ({ ...d, slug: e.target.value }))}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      value={editData.description ?? brand.description ?? ""}
                      onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      value={editData.logo_url ?? brand.logo_url ?? ""}
                      onChange={(e) => setEditData((d) => ({ ...d, logo_url: e.target.value }))}
                    />
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button
                      onClick={() => handleSaveEdit(brand.id)}
                      className="text-xs bg-gray-900 text-white px-3 py-1 rounded hover:bg-gray-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditId(null); setEditData({}); }}
                      className="text-xs text-gray-500 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{brand.name}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{brand.slug}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{brand.description ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-xs">{brand.logo_url ?? "—"}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button
                      onClick={() => { setEditId(brand.id); setEditData({}); }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(brand.id, brand.name)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}

            {creating && (
              <tr className="bg-green-50">
                <td className="px-4 py-2">
                  <input
                    autoFocus
                    placeholder="Name"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    value={newData.name ?? ""}
                    onChange={(e) => {
                      const name = e.target.value;
                      setNewData((d) => ({ ...d, name, slug: slugify(name) }));
                    }}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    placeholder="slug"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    value={newData.slug ?? ""}
                    onChange={(e) => setNewData((d) => ({ ...d, slug: e.target.value }))}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    placeholder="Description (optional)"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    value={newData.description ?? ""}
                    onChange={(e) => setNewData((d) => ({ ...d, description: e.target.value }))}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    placeholder="Logo URL (optional)"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    value={newData.logo_url ?? ""}
                    onChange={(e) => setNewData((d) => ({ ...d, logo_url: e.target.value }))}
                  />
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    onClick={handleCreate}
                    className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setCreating(false); setNewData({}); }}
                    className="text-xs text-gray-500 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!creating && (
        <button
          onClick={() => setCreating(true)}
          className="text-sm text-blue-600 hover:underline"
        >
          + Add brand
        </button>
      )}
    </div>
  );
}

// ── Product Types tab ─────────────────────────────────────────────────────────

function ProductTypesTab() {
  const [items, setItems] = useState<ProductTypeSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<ProductTypeSchema>>({});
  const [creating, setCreating] = useState(false);
  const [newData, setNewData] = useState<Partial<ProductTypeSchema>>({});

  useEffect(() => {
    adminListProductTypes()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number, label: string) {
    if (!window.confirm(`Delete product type "${label}"? This won't change existing products but the type won't appear in dropdowns.`))
      return;
    try {
      await adminDeleteProductType(id);
      setItems((prev) => prev.filter((pt) => pt.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function handleSaveEdit(id: number) {
    try {
      const updated = await adminUpdateProductType(id, editData);
      setItems((prev) => prev.map((pt) => (pt.id === id ? updated : pt)));
      setEditId(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function handleCreate() {
    if (!newData.value?.trim()) return setError("Value (slug) is required");
    if (!newData.label?.trim()) return setError("Label is required");
    try {
      const created = await adminCreateProductType({
        value: newData.value.trim(),
        label: newData.label.trim(),
        is_active: newData.is_active ?? true,
      });
      setItems((prev) => [...prev, created]);
      setCreating(false);
      setNewData({});
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Create failed");
    }
  }

  if (loading) return <div className="p-6 text-sm text-gray-400">Loading…</div>;

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
          <button className="ml-3 text-red-500 hover:text-red-800" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Product type <strong>value</strong> is stored in the database (e.g. <code>printer</code>).
        <strong> Label</strong> is the display name (e.g. <code>3D Printer</code>).
      </p>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Value (slug)</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Label</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Active</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((pt) =>
              editId === pt.id ? (
                <tr key={pt.id} className="bg-blue-50">
                  <td className="px-4 py-2">
                    <input
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-mono"
                      value={editData.value ?? pt.value}
                      onChange={(e) => setEditData((d) => ({ ...d, value: e.target.value }))}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      value={editData.label ?? pt.label}
                      onChange={(e) => setEditData((d) => ({ ...d, label: e.target.value }))}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={editData.is_active ?? pt.is_active}
                      onChange={(e) => setEditData((d) => ({ ...d, is_active: e.target.checked }))}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button
                      onClick={() => handleSaveEdit(pt.id)}
                      className="text-xs bg-gray-900 text-white px-3 py-1 rounded hover:bg-gray-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditId(null); setEditData({}); }}
                      className="text-xs text-gray-500 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={pt.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-700 text-xs">{pt.value}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{pt.label}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        pt.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {pt.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button
                      onClick={() => { setEditId(pt.id); setEditData({}); }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(pt.id, pt.label)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}

            {creating && (
              <tr className="bg-green-50">
                <td className="px-4 py-2">
                  <input
                    autoFocus
                    placeholder="e.g. resin"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-mono"
                    value={newData.value ?? ""}
                    onChange={(e) => setNewData((d) => ({ ...d, value: e.target.value }))}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    placeholder="e.g. Resin Printer"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    value={newData.label ?? ""}
                    onChange={(e) => setNewData((d) => ({ ...d, label: e.target.value }))}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={newData.is_active ?? true}
                    onChange={(e) => setNewData((d) => ({ ...d, is_active: e.target.checked }))}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    onClick={handleCreate}
                    className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setCreating(false); setNewData({}); }}
                    className="text-xs text-gray-500 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!creating && (
        <button
          onClick={() => setCreating(true)}
          className="text-sm text-blue-600 hover:underline"
        >
          + Add product type
        </button>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CatalogPage() {
  const router = useRouter();
  const { isSuperAdmin } = useAuthStore();
  const [tab, setTab] = useState<Tab>("categories");

  useEffect(() => {
    if (!isSuperAdmin()) {
      router.push("/admin");
    }
  }, [isSuperAdmin, router]);

  if (!isSuperAdmin()) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "categories", label: "Categories" },
    { key: "brands", label: "Brands" },
    { key: "product-types", label: "Product Types" },
  ];

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Catalog Management</h1>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t.key
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "categories" && <CategoriesTab />}
      {tab === "brands" && <BrandsTab />}
      {tab === "product-types" && <ProductTypesTab />}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminListCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory,
  adminListBrands, adminCreateBrand, adminUpdateBrand, adminDeleteBrand,
  adminListProductTypes, adminCreateProductType, adminUpdateProductType, adminDeleteProductType,
} from "@/lib/api";
import type { CategorySchema, BrandSchema, ProductTypeSchema } from "@/lib/api-types";
import { useAuthStore } from "@/store/auth";

type Tab = "categories" | "brands" | "product-types";

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const TH = "px-5 py-3 text-left uppercase tracking-widest font-medium whitespace-nowrap";
const TD = "px-5 py-3.5 align-middle";

const inputStyle = {
  border: "1px solid #e0e0e0",
  borderRadius: 8,
  padding: "6px 10px",
  fontSize: 13,
  color: "#111",
  outline: "none",
  width: "100%",
  background: "#fff",
};

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
    adminListCategories().then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try { await adminDeleteCategory(id); setItems((prev) => prev.filter((c) => c.id !== id)); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Delete failed"); }
  }

  async function handleSaveEdit(id: number) {
    try {
      const updated = await adminUpdateCategory(id, editData);
      setItems((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditId(null);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Update failed"); }
  }

  async function handleCreate() {
    if (!newData.name?.trim()) return setError("Name is required");
    if (!newData.slug?.trim()) return setError("Slug is required");
    try {
      const created = await adminCreateCategory({
        name: newData.name.trim(), slug: newData.slug.trim(),
        description: newData.description ?? null, image_url: newData.image_url ?? null,
        gradient_css: newData.gradient_css ?? null,
      });
      setItems((prev) => [...prev, created]);
      setCreating(false); setNewData({});
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Create failed"); }
  }

  if (loading) return <Skeleton />;

  return (
    <TabContent error={error} onClearError={() => setError(null)}
      onAdd={() => setCreating(true)} addLabel="+ Category" showAdd={!creating}>
      <table className="w-full text-sm">
        <thead style={{ borderBottom: "1px solid #f0f0f0" }}>
          <tr>
            {["Name", "Slug", "Description", "Gradient", ""].map((h, i) => (
              <th key={i} className={TH} style={{ fontSize: 10, color: "#bbb" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((cat) => editId === cat.id ? (
            <tr key={cat.id} style={{ background: "#fafaf8", borderBottom: "1px solid #f0f0f0" }}>
              <td className={TD}><input style={inputStyle} value={editData.name ?? cat.name}
                onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))} /></td>
              <td className={TD}><input style={inputStyle} value={editData.slug ?? cat.slug}
                onChange={(e) => setEditData((d) => ({ ...d, slug: e.target.value }))} /></td>
              <td className={TD}><input style={inputStyle} value={editData.description ?? cat.description ?? ""}
                onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))} /></td>
              <td className={TD}><input style={{ ...inputStyle, fontFamily: "monospace", fontSize: 11 }}
                value={editData.gradient_css ?? cat.gradient_css ?? ""}
                onChange={(e) => setEditData((d) => ({ ...d, gradient_css: e.target.value }))} /></td>
              <td className={TD}><RowActions onSave={() => handleSaveEdit(cat.id)} onCancel={() => { setEditId(null); setEditData({}); }} /></td>
            </tr>
          ) : (
            <tr key={cat.id} className="transition-colors" style={{ borderBottom: "1px solid #f7f7f7" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fafaf8")}
              onMouseLeave={e => (e.currentTarget.style.background = "")}>
              <td className={TD + " font-medium"} style={{ color: "#111" }}>{cat.name}</td>
              <td className={TD}><span className="font-mono text-xs" style={{ color: "#aaa" }}>{cat.slug}</span></td>
              <td className={TD + " truncate"} style={{ color: "#777", maxWidth: 200 }}>{cat.description ?? "—"}</td>
              <td className={TD}>
                {cat.gradient_css
                  ? <span className="inline-block rounded-lg px-3 py-1 text-xs" style={{ background: cat.gradient_css }}>preview</span>
                  : <span style={{ color: "#ccc" }}>—</span>}
              </td>
              <td className={TD}><RowMenu onEdit={() => { setEditId(cat.id); setEditData({}); }} onDelete={() => handleDelete(cat.id, cat.name)} /></td>
            </tr>
          ))}

          {creating && (
            <tr style={{ background: "#f9fffe", borderBottom: "1px solid #f0f0f0" }}>
              <td className={TD}><input autoFocus placeholder="Name" style={inputStyle}
                value={newData.name ?? ""}
                onChange={(e) => { const name = e.target.value; setNewData((d) => ({ ...d, name, slug: slugify(name) })); }} /></td>
              <td className={TD}><input placeholder="slug" style={inputStyle} value={newData.slug ?? ""}
                onChange={(e) => setNewData((d) => ({ ...d, slug: e.target.value }))} /></td>
              <td className={TD}><input placeholder="Description" style={inputStyle} value={newData.description ?? ""}
                onChange={(e) => setNewData((d) => ({ ...d, description: e.target.value }))} /></td>
              <td className={TD}><input placeholder="linear-gradient(…)" style={{ ...inputStyle, fontFamily: "monospace", fontSize: 11 }}
                value={newData.gradient_css ?? ""}
                onChange={(e) => setNewData((d) => ({ ...d, gradient_css: e.target.value }))} /></td>
              <td className={TD}><RowActions onSave={handleCreate} onCancel={() => { setCreating(false); setNewData({}); }} saveLabel="Add" /></td>
            </tr>
          )}
        </tbody>
      </table>
    </TabContent>
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
    adminListBrands().then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Delete brand "${name}"?`)) return;
    try { await adminDeleteBrand(id); setItems((prev) => prev.filter((b) => b.id !== id)); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Delete failed"); }
  }

  async function handleSaveEdit(id: number) {
    try {
      const updated = await adminUpdateBrand(id, editData);
      setItems((prev) => prev.map((b) => (b.id === id ? updated : b)));
      setEditId(null);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Update failed"); }
  }

  async function handleCreate() {
    if (!newData.name?.trim()) return setError("Name is required");
    if (!newData.slug?.trim()) return setError("Slug is required");
    try {
      const created = await adminCreateBrand({
        name: newData.name.trim(), slug: newData.slug.trim(),
        description: newData.description ?? null, logo_url: newData.logo_url ?? null,
      });
      setItems((prev) => [...prev, created]); setCreating(false); setNewData({});
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Create failed"); }
  }

  if (loading) return <Skeleton />;

  return (
    <TabContent error={error} onClearError={() => setError(null)}
      onAdd={() => setCreating(true)} addLabel="+ Brand" showAdd={!creating}>
      <table className="w-full text-sm">
        <thead style={{ borderBottom: "1px solid #f0f0f0" }}>
          <tr>
            {["Name", "Slug", "Description", "Logo URL", ""].map((h, i) => (
              <th key={i} className={TH} style={{ fontSize: 10, color: "#bbb" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((brand) => editId === brand.id ? (
            <tr key={brand.id} style={{ background: "#fafaf8", borderBottom: "1px solid #f0f0f0" }}>
              <td className={TD}><input style={inputStyle} value={editData.name ?? brand.name}
                onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))} /></td>
              <td className={TD}><input style={inputStyle} value={editData.slug ?? brand.slug}
                onChange={(e) => setEditData((d) => ({ ...d, slug: e.target.value }))} /></td>
              <td className={TD}><input style={inputStyle} value={editData.description ?? brand.description ?? ""}
                onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))} /></td>
              <td className={TD}><input style={inputStyle} value={editData.logo_url ?? brand.logo_url ?? ""}
                onChange={(e) => setEditData((d) => ({ ...d, logo_url: e.target.value }))} /></td>
              <td className={TD}><RowActions onSave={() => handleSaveEdit(brand.id)} onCancel={() => { setEditId(null); setEditData({}); }} /></td>
            </tr>
          ) : (
            <tr key={brand.id} className="transition-colors" style={{ borderBottom: "1px solid #f7f7f7" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fafaf8")}
              onMouseLeave={e => (e.currentTarget.style.background = "")}>
              <td className={TD + " font-medium"} style={{ color: "#111" }}>{brand.name}</td>
              <td className={TD}><span className="font-mono text-xs" style={{ color: "#aaa" }}>{brand.slug}</span></td>
              <td className={TD} style={{ color: "#777" }}>{brand.description ?? "—"}</td>
              <td className={TD + " truncate max-w-[200px]"} style={{ color: "#aaa", fontSize: 12 }}>{brand.logo_url ?? "—"}</td>
              <td className={TD}><RowMenu onEdit={() => { setEditId(brand.id); setEditData({}); }} onDelete={() => handleDelete(brand.id, brand.name)} /></td>
            </tr>
          ))}

          {creating && (
            <tr style={{ background: "#f9fffe", borderBottom: "1px solid #f0f0f0" }}>
              <td className={TD}><input autoFocus placeholder="Name" style={inputStyle} value={newData.name ?? ""}
                onChange={(e) => { const name = e.target.value; setNewData((d) => ({ ...d, name, slug: slugify(name) })); }} /></td>
              <td className={TD}><input placeholder="slug" style={inputStyle} value={newData.slug ?? ""}
                onChange={(e) => setNewData((d) => ({ ...d, slug: e.target.value }))} /></td>
              <td className={TD}><input placeholder="Description" style={inputStyle} value={newData.description ?? ""}
                onChange={(e) => setNewData((d) => ({ ...d, description: e.target.value }))} /></td>
              <td className={TD}><input placeholder="Logo URL" style={inputStyle} value={newData.logo_url ?? ""}
                onChange={(e) => setNewData((d) => ({ ...d, logo_url: e.target.value }))} /></td>
              <td className={TD}><RowActions onSave={handleCreate} onCancel={() => { setCreating(false); setNewData({}); }} saveLabel="Add" /></td>
            </tr>
          )}
        </tbody>
      </table>
    </TabContent>
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
    adminListProductTypes().then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number, label: string) {
    if (!window.confirm(`Delete product type "${label}"?`)) return;
    try { await adminDeleteProductType(id); setItems((prev) => prev.filter((pt) => pt.id !== id)); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Delete failed"); }
  }

  async function handleSaveEdit(id: number) {
    try {
      const updated = await adminUpdateProductType(id, editData);
      setItems((prev) => prev.map((pt) => (pt.id === id ? updated : pt)));
      setEditId(null);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Update failed"); }
  }

  async function handleCreate() {
    if (!newData.value?.trim()) return setError("Value is required");
    if (!newData.label?.trim()) return setError("Label is required");
    try {
      const created = await adminCreateProductType({
        value: newData.value.trim(), label: newData.label.trim(), is_active: newData.is_active ?? true,
      });
      setItems((prev) => [...prev, created]); setCreating(false); setNewData({});
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Create failed"); }
  }

  if (loading) return <Skeleton />;

  return (
    <TabContent error={error} onClearError={() => setError(null)}
      onAdd={() => setCreating(true)} addLabel="+ Type" showAdd={!creating}>
      <p className="px-5 pt-4 pb-2" style={{ fontSize: 12, color: "#aaa" }}>
        <strong style={{ color: "#777" }}>Value</strong> is stored in the DB (e.g. <code>printer</code>).{" "}
        <strong style={{ color: "#777" }}>Label</strong> is shown to users (e.g. <code>3D Printer</code>).
      </p>
      <table className="w-full text-sm">
        <thead style={{ borderBottom: "1px solid #f0f0f0" }}>
          <tr>
            {["Value", "Label", "Active", ""].map((h, i) => (
              <th key={i} className={TH} style={{ fontSize: 10, color: "#bbb" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((pt) => editId === pt.id ? (
            <tr key={pt.id} style={{ background: "#fafaf8", borderBottom: "1px solid #f0f0f0" }}>
              <td className={TD}><input style={{ ...inputStyle, fontFamily: "monospace" }} value={editData.value ?? pt.value}
                onChange={(e) => setEditData((d) => ({ ...d, value: e.target.value }))} /></td>
              <td className={TD}><input style={inputStyle} value={editData.label ?? pt.label}
                onChange={(e) => setEditData((d) => ({ ...d, label: e.target.value }))} /></td>
              <td className={TD}>
                <input type="checkbox" checked={editData.is_active ?? pt.is_active}
                  onChange={(e) => setEditData((d) => ({ ...d, is_active: e.target.checked }))} className="rounded" />
              </td>
              <td className={TD}><RowActions onSave={() => handleSaveEdit(pt.id)} onCancel={() => { setEditId(null); setEditData({}); }} /></td>
            </tr>
          ) : (
            <tr key={pt.id} className="transition-colors" style={{ borderBottom: "1px solid #f7f7f7" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fafaf8")}
              onMouseLeave={e => (e.currentTarget.style.background = "")}>
              <td className={TD}><span className="font-mono text-xs" style={{ color: "#aaa" }}>{pt.value}</span></td>
              <td className={TD + " font-medium"} style={{ color: "#111" }}>{pt.label}</td>
              <td className={TD}>
                <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={pt.is_active ? { background: "#edfff5", color: "#1a7a45" } : { background: "#f5f5f5", color: "#aaa" }}>
                  {pt.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className={TD}><RowMenu onEdit={() => { setEditId(pt.id); setEditData({}); }} onDelete={() => handleDelete(pt.id, pt.label)} /></td>
            </tr>
          ))}

          {creating && (
            <tr style={{ background: "#f9fffe", borderBottom: "1px solid #f0f0f0" }}>
              <td className={TD}><input autoFocus placeholder="e.g. resin" style={{ ...inputStyle, fontFamily: "monospace" }}
                value={newData.value ?? ""} onChange={(e) => setNewData((d) => ({ ...d, value: e.target.value }))} /></td>
              <td className={TD}><input placeholder="e.g. Resin Printer" style={inputStyle}
                value={newData.label ?? ""} onChange={(e) => setNewData((d) => ({ ...d, label: e.target.value }))} /></td>
              <td className={TD}>
                <input type="checkbox" checked={newData.is_active ?? true}
                  onChange={(e) => setNewData((d) => ({ ...d, is_active: e.target.checked }))} className="rounded" />
              </td>
              <td className={TD}><RowActions onSave={handleCreate} onCancel={() => { setCreating(false); setNewData({}); }} saveLabel="Add" /></td>
            </tr>
          )}
        </tbody>
      </table>
    </TabContent>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-3 py-6 px-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-4 rounded-full animate-pulse" style={{ background: "#f0f0f0", width: `${70 - i * 10}%` }} />
      ))}
    </div>
  );
}

function TabContent({
  children, error, onClearError, onAdd, addLabel, showAdd,
}: {
  children: React.ReactNode;
  error: string | null;
  onClearError: () => void;
  onAdd: () => void;
  addLabel: string;
  showAdd: boolean;
}) {
  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl px-4 py-3 flex items-center justify-between text-sm"
          style={{ background: "#fff1f1", color: "#c92a2a", border: "1px solid #ffd6d6" }}>
          {error}
          <button onClick={onClearError} className="ml-3 font-bold" style={{ color: "#c92a2a" }}>×</button>
        </div>
      )}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        {children}
      </div>
      {showAdd && (
        <button onClick={onAdd} className="text-sm font-medium transition"
          style={{ color: "#111", textDecoration: "underline", textUnderlineOffset: 3 }}>
          {addLabel}
        </button>
      )}
    </div>
  );
}

function RowActions({
  onSave, onCancel, saveLabel = "Save",
}: { onSave: () => void; onCancel: () => void; saveLabel?: string }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={onSave} className="text-xs font-medium rounded-lg px-3 py-1.5 transition"
        style={{ background: "#111", color: "#fff" }}>
        {saveLabel}
      </button>
      <button onClick={onCancel} className="text-xs font-medium rounded-lg px-3 py-1.5 transition"
        style={{ background: "#f5f5f5", color: "#555" }}>
        Cancel
      </button>
    </div>
  );
}

function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3 justify-end">
      <button onClick={onEdit} className="text-xs font-medium transition"
        style={{ color: "#555" }}
        onMouseEnter={e => (e.currentTarget.style.color = "#111")}
        onMouseLeave={e => (e.currentTarget.style.color = "#555")}>
        Edit
      </button>
      <button onClick={onDelete} className="text-xs font-medium transition"
        style={{ color: "#ddd" }}
        onMouseEnter={e => (e.currentTarget.style.color = "#e5484d")}
        onMouseLeave={e => (e.currentTarget.style.color = "#ddd")}>
        Delete
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CatalogPage() {
  const router = useRouter();
  const { isSuperAdmin } = useAuthStore();
  const [tab, setTab] = useState<Tab>("categories");

  useEffect(() => { if (!isSuperAdmin()) router.push("/admin"); }, [isSuperAdmin, router]);
  if (!isSuperAdmin()) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "categories", label: "Categories" },
    { key: "brands", label: "Brands" },
    { key: "product-types", label: "Product Types" },
  ];

  return (
    <div className="p-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "#111" }}>Catalog</h1>
        <p style={{ color: "#aaa", fontSize: 13 }} className="mt-1">Manage categories, brands, and product types</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6" style={{ borderBottom: "1px solid #ebebeb" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px"
            style={{
              borderColor: tab === t.key ? "#111" : "transparent",
              color: tab === t.key ? "#111" : "#aaa",
            }}
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

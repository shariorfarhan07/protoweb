"use client";

import { useEffect, useState } from "react";
import {
  getBlogPosts,
  getBlogCategories,
  createBlogPost,
  deleteBlogPost,
  syncFacebookPosts,
  getAdminBlogComments,
  approveBlogComment,
  deleteBlogComment,
} from "@/lib/api";
import type { BlogPostList, BlogCategory, BlogCommentAdmin } from "@/lib/api-types";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostList[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [pending, setPending] = useState<BlogCommentAdmin[]>([]);
  const [busyComment, setBusyComment] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  async function refresh() {
    const [p, c, pend] = await Promise.all([
      getBlogPosts({ page_size: 50 }),
      getBlogCategories(),
      getAdminBlogComments(false),
    ]);
    setPosts(p.items);
    setCategories(c);
    setPending(pend);
  }

  async function handleApprove(id: number) {
    setBusyComment(id);
    try {
      await approveBlogComment(id);
      setPending((cs) => cs.filter((c) => c.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setBusyComment(null);
    }
  }

  async function handleDeleteComment(id: number) {
    setBusyComment(id);
    try {
      await deleteBlogComment(id);
      setPending((cs) => cs.filter((c) => c.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyComment(null);
    }
  }

  useEffect(() => {
    refresh().catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  async function handleSync() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await syncFacebookPosts();
      setSyncMsg(res.message);
      if (res.ok) await refresh();
    } catch (e) {
      setSyncMsg(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createBlogPost({
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        content: content.trim(),
        category_id: categoryId ? Number(categoryId) : undefined,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        is_published: true,
      });
      setTitle(""); setExcerpt(""); setContent(""); setTags(""); setCategoryId("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create post");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this post?")) return;
    await deleteBlogPost(id);
    await refresh();
  }

  const input = "w-full rounded-lg px-3 py-2.5 text-sm outline-none";
  const inputStyle = { border: "1px solid #e4e6ea" } as const;

  return (
    <div className="p-10 max-w-5xl">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "#111" }}>Blog</h1>
          <p style={{ color: "#aaa", fontSize: 13 }} className="mt-1">Manage posts &amp; sync from Facebook</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "#1877f2" }}
          >
            {syncing ? "Syncing…" : "Sync from Facebook"}
          </button>
          {syncMsg && <p className="text-xs max-w-xs text-right" style={{ color: "#888" }}>{syncMsg}</p>}
        </div>
      </div>

      {/* Create post */}
      <form onSubmit={handleCreate} className="rounded-2xl p-6 mb-8" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h2 className="font-semibold mb-4" style={{ fontSize: 15 }}>New post</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input className={input} style={inputStyle} placeholder="Title *" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <select className={input} style={inputStyle} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">— Category —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <input className={`${input} mb-3`} style={inputStyle} placeholder="Excerpt (short summary)" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        <textarea className={`${input} mb-3`} style={inputStyle} rows={6} placeholder="Content (HTML allowed: <p>, <h2>, <ul>…)" value={content} onChange={(e) => setContent(e.target.value)} />
        <input className={`${input} mb-3`} style={inputStyle} placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <button type="submit" disabled={saving} className="rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ background: "#111" }}>
          {saving ? "Publishing…" : "Publish post"}
        </button>
      </form>

      {/* Pending comments — moderation */}
      <div className="rounded-2xl p-6 mb-8" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-semibold" style={{ fontSize: 15 }}>Pending comments</h2>
          {pending.length > 0 && (
            <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: "#fff4e5", color: "#c45b00" }}>
              {pending.length} awaiting approval
            </span>
          )}
        </div>
        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : pending.length === 0 ? (
          <p className="text-sm text-gray-400">Nothing to review — all caught up. 🎉</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((c) => (
              <li key={c.id} className="rounded-xl p-4" style={{ border: "1px solid #f0f0ee" }}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold text-gray-900">{c.author_name}</span>
                      {c.author_email && <span className="text-gray-400"> · {c.author_email}</span>}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      on <a href={`/blog/${c.post_slug}`} target="_blank" rel="noreferrer" className="underline">{c.post_title}</a>
                      {" · "}{new Date(c.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(c.id)}
                      disabled={busyComment === c.id}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                      style={{ background: "#1a7a45" }}
                    >
                      {busyComment === c.id ? "…" : "Approve"}
                    </button>
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      disabled={busyComment === c.id}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                      style={{ background: "#fff1f1", color: "#c92a2a" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{c.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Posts list */}
      <div className="rounded-2xl p-6" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h2 className="font-semibold mb-4" style={{ fontSize: 15 }}>Published posts ({posts.length})</h2>
        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-gray-400">No posts yet.</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "#f0f0ee" }}>
            {posts.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{p.title}</p>
                  <p className="text-xs text-gray-400">
                    {p.category?.name ?? "Uncategorized"} · {p.source} · {p.reading_minutes} min · {p.comment_count} comments
                  </p>
                </div>
                <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-gray-500 hover:text-gray-900">View ↗</a>
                <button onClick={() => handleDelete(p.id)} className="text-xs font-medium text-red-500 hover:text-red-700">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

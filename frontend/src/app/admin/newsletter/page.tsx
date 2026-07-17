"use client";

import { useCallback, useEffect, useState } from "react";
import { getNewsletterSubscribers, deleteNewsletterSubscriber } from "@/lib/api";
import type { NewsletterSubscriber } from "@/lib/api-types";

const TH = "px-5 py-3 text-left font-medium uppercase tracking-widest whitespace-nowrap";
const TD = "px-5 py-3.5 align-middle";

export default function AdminNewsletterPage() {
  const [subs, setSubs] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSubs(await getNewsletterSubscribers());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(id: number) {
    if (!confirm("Remove this subscriber?")) return;
    setBusy(id);
    try {
      await deleteNewsletterSubscriber(id);
      setSubs((s) => s.filter((x) => x.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(null);
    }
  }

  async function copyAll() {
    const emails = subs.filter((s) => s.is_active).map((s) => s.email).join(", ");
    try {
      await navigator.clipboard.writeText(emails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto w-full">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "#111" }}>
            Newsletter
          </h1>
          <p style={{ color: "#aaa", fontSize: 13 }} className="mt-1">
            {loading ? "Loading…" : `${subs.length} subscriber${subs.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {subs.length > 0 && (
          <button
            onClick={copyAll}
            className="text-sm font-medium rounded-lg px-4 py-2 transition"
            style={{ background: "#fff", border: "1px solid #e0e0e0", color: "#333" }}
          >
            {copied ? "Copied ✓" : "Copy all emails"}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-5 rounded-xl px-4 py-3 text-sm" style={{ background: "#fff1f1", color: "#c92a2a", border: "1px solid #ffd6d6" }}>
          {error}
        </div>
      )}

      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <table className="w-full text-sm">
          <thead style={{ borderBottom: "1px solid #f0f0f0" }}>
            <tr>
              <th className={TH} style={{ fontSize: 10, color: "#bbb" }}>Email</th>
              <th className={TH} style={{ fontSize: 10, color: "#bbb" }}>Source</th>
              <th className={TH} style={{ fontSize: 10, color: "#bbb" }}>Subscribed</th>
              <th className={TH} style={{ fontSize: 10, color: "#bbb" }} />
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f7f7f7" }}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className={TD}>
                      <div className="h-3.5 rounded-full animate-pulse" style={{ background: "#f0f0f0", width: j === 0 ? "180px" : "70px" }} />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && subs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-16 text-center text-sm" style={{ color: "#bbb" }}>
                  No subscribers yet.
                </td>
              </tr>
            )}

            {!loading &&
              subs.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f7f7f7" }}>
                  <td className={TD}>
                    <a href={`mailto:${s.email}`} className="font-medium hover:underline" style={{ color: "#111" }}>
                      {s.email}
                    </a>
                    {!s.is_active && <span className="ml-2 text-xs" style={{ color: "#bbb" }}>(inactive)</span>}
                  </td>
                  <td className={TD} style={{ color: "#999" }}>{s.source ?? "—"}</td>
                  <td className={TD} style={{ color: "#999", fontSize: 12 }}>
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td className={TD + " text-right"}>
                    <button
                      onClick={() => remove(s.id)}
                      disabled={busy === s.id}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-40"
                      style={{ background: "#fff1f1", color: "#c92a2a" }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

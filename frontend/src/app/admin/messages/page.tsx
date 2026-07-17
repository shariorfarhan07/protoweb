"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getContactMessages,
  setContactMessageRead,
  deleteContactMessage,
} from "@/lib/api";
import type { ContactMessage } from "@/lib/api-types";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMessages(await getContactMessages());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleRead(m: ContactMessage) {
    setBusy(m.id);
    try {
      await setContactMessageRead(m.id, !m.is_read);
      setMessages((ms) => ms.map((x) => (x.id === m.id ? { ...x, is_read: !m.is_read } : x)));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this message permanently?")) return;
    setBusy(id);
    try {
      await deleteContactMessage(id);
      setMessages((ms) => ms.filter((x) => x.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(null);
    }
  }

  const shown = unreadOnly ? messages.filter((m) => !m.is_read) : messages;
  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto w-full">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "#111" }}>
            Messages
          </h1>
          <p style={{ color: "#aaa", fontSize: 13 }} className="mt-1">
            {loading ? "Loading…" : `${messages.length} message${messages.length !== 1 ? "s" : ""} · ${unread} unread`}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none" style={{ color: "#555" }}>
          <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} className="rounded" />
          Unread only
        </label>
      </div>

      {error && (
        <div className="mb-5 rounded-xl px-4 py-3 text-sm" style={{ background: "#fff1f1", color: "#c92a2a", border: "1px solid #ffd6d6" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "#efefed" }} />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <p className="text-sm text-gray-400 py-10 text-center">No messages.</p>
      ) : (
        <ul className="space-y-3">
          {shown.map((m) => (
            <li
              key={m.id}
              className="rounded-2xl p-5"
              style={{
                background: "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                borderLeft: m.is_read ? "3px solid transparent" : "3px solid #f2890e",
              }}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold text-gray-900">{m.name}</span>
                    {!m.is_read && (
                      <span className="ml-2 text-xs font-bold rounded-full px-2 py-0.5" style={{ background: "#fff4e5", color: "#c45b00" }}>
                        New
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    <a href={`mailto:${m.email}`} className="underline">{m.email}</a>
                    {m.phone && <> · <a href={`tel:${m.phone}`} className="underline">{m.phone}</a></>}
                    {" · "}
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => toggleRead(m)}
                    disabled={busy === m.id}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                    style={{ background: "#f4f4f2", color: "#444" }}
                  >
                    {m.is_read ? "Mark unread" : "Mark read"}
                  </button>
                  <button
                    onClick={() => remove(m.id)}
                    disabled={busy === m.id}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                    style={{ background: "#fff1f1", color: "#c92a2a" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3 whitespace-pre-line leading-relaxed">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

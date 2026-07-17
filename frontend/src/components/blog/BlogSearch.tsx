"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function BlogSearch() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("search") ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams();
    if (q.trim()) next.set("search", q.trim());
    router.push(`/blog${next.toString() ? `?${next}` : ""}`);
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-2 rounded-full bg-white"
      style={{ border: "1px solid #e4e6ea", padding: "8px 8px 8px 16px", maxWidth: 360 }}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search articles…"
        aria-label="Search blog"
        className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
      />
      <button
        type="submit"
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-white"
        style={{ background: "#f2890e" }}
        aria-label="Search"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>
    </form>
  );
}

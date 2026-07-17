"use client";

import { useState } from "react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prototypebd.com";

export function ShareButtons({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${SITE_URL}/blog/${slug}`;
  const enc = encodeURIComponent;

  const links = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
      bg: "#1877f2",
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`,
      bg: "#111",
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${enc(`${title} ${url}`)}`,
      bg: "#25d366",
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
      bg: "#0a66c2",
    },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-gray-500 mr-1">Share:</span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-white px-3 py-1.5 rounded-full transition-transform hover:-translate-y-0.5"
          style={{ background: l.bg }}
        >
          {l.label}
        </a>
      ))}
      <button
        onClick={copy}
        className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
        style={{ background: "#eceef1", color: "#333" }}
      >
        {copied ? "Copied ✓" : "Copy link"}
      </button>
    </div>
  );
}

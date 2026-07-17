"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { CommunityProject } from "@/lib/api-types";
import { buildImageUrl, imageBg } from "@/lib/utils";

function CardVisual({ p }: { p: CommunityProject }) {
  return (
    <article
      className="group bg-white rounded-2xl overflow-hidden flex flex-col h-full transition-transform hover:-translate-y-1"
      style={{ border: "1px solid #eceef1", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
    >
      <div className="relative" style={{ aspectRatio: "4/3", background: imageBg(p.image_url) }}>
        {p.image_url ? (
          <Image
            src={buildImageUrl(p.image_url)}
            alt={p.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width:768px) 100vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🛠️</div>
        )}
        {p.is_featured && (
          <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-full text-white" style={{ background: "#f2890e" }}>
            ★ Featured
          </span>
        )}
        {/* hover hint */}
        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(0,0,0,0.25)" }}>
          <span className="rounded-full px-3 py-1.5 text-xs font-bold text-gray-900" style={{ background: "rgba(255,255,255,0.95)" }}>
            🔍 View photo
          </span>
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 leading-snug" style={{ fontSize: 16 }}>{p.title}</h3>
        {p.description && <p className="text-sm text-gray-500 mt-1.5 line-clamp-3">{p.description}</p>}
        <p className="text-xs text-gray-400 mt-auto pt-3">by <span className="font-semibold text-gray-600">{p.author_name}</span></p>
      </div>
    </article>
  );
}

function Lightbox({ p, onClose }: { p: CommunityProject; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={p.title}
    >
      <div className="w-full max-w-3xl bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
        <div className="relative" style={{ aspectRatio: "16/10", background: imageBg(p.image_url) }}>
          {p.image_url ? (
            <Image src={buildImageUrl(p.image_url)} alt={p.title} fill className="object-contain" sizes="768px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl">🛠️</div>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-white text-lg"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            ✕
          </button>
          {p.is_featured && (
            <span className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: "#f2890e" }}>
              ★ Featured
            </span>
          )}
        </div>
        <div className="p-6">
          <h2 className="font-extrabold text-gray-900" style={{ fontSize: 20, letterSpacing: -0.3 }}>{p.title}</h2>
          <p className="text-xs text-gray-400 mt-1">by <span className="font-semibold text-gray-600">{p.author_name}</span></p>
          {p.description && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{p.description}</p>}
          {p.project_url && (
            <a
              href={p.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-5 rounded-full px-5 py-2.5 text-sm font-bold text-white"
              style={{ background: "linear-gradient(90deg,#fbab4d,#f2890e)" }}
            >
              View project ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProjectsGallery({ projects }: { projects: CommunityProject[] }) {
  const [active, setActive] = useState<CommunityProject | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setActive(null); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [active]);

  if (projects.length === 0) {
    return <p className="text-sm text-gray-400">No projects yet — be the first to share!</p>;
  }

  return (
    <>
      <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {projects.map((p) => (
          <button key={p.id} type="button" onClick={() => setActive(p)} className="text-left block w-full">
            <CardVisual p={p} />
          </button>
        ))}
      </div>
      {active && <Lightbox p={active} onClose={() => setActive(null)} />}
    </>
  );
}

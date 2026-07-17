"use client";

import { useState } from "react";
import type { VideoTutorial } from "@/lib/api-types";

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}

function thumb(v: VideoTutorial): string | null {
  if (v.thumbnail_url) return v.thumbnail_url;
  const id = youtubeId(v.video_url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function VideoGrid({ videos }: { videos: VideoTutorial[] }) {
  const [active, setActive] = useState<VideoTutorial | null>(null);
  const activeId = active ? youtubeId(active.video_url) : null;

  if (videos.length === 0) {
    return <p className="text-sm text-gray-400">No videos yet — check back soon.</p>;
  }

  return (
    <>
      <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {videos.map((v) => {
          const t = thumb(v);
          return (
            <button
              key={v.id}
              onClick={() => setActive(v)}
              className="group text-left bg-white rounded-2xl overflow-hidden flex flex-col transition-transform hover:-translate-y-1"
              style={{ border: "1px solid #eceef1", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
            >
              <div className="relative" style={{ aspectRatio: "16/9", background: "#111" }}>
                {t && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t} alt={v.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" loading="lazy" />
                )}
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-14 h-14 rounded-full flex items-center justify-center text-white"
                    style={{ background: "rgba(0,0,0,0.55)" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                </span>
                {v.duration && (
                  <span className="absolute bottom-2 right-2 text-[11px] font-semibold text-white px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(0,0,0,0.7)" }}>
                    {v.duration}
                  </span>
                )}
              </div>
              <div className="p-4">
                {v.category && (
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#f2890e" }}>
                    {v.category}
                  </span>
                )}
                <h3 className="font-bold text-gray-900 leading-snug mt-1 line-clamp-2" style={{ fontSize: 15 }}>
                  {v.title}
                </h3>
                {v.description && <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{v.description}</p>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Player modal */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={() => setActive(null)}
        >
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
              {activeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${activeId}?autoplay=1`}
                  title={active.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-sm">
                  <a href={active.video_url} target="_blank" rel="noopener noreferrer" className="underline">
                    Open video ↗
                  </a>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="text-white font-semibold text-sm">{active.title}</p>
              <button onClick={() => setActive(null)} className="text-white/70 hover:text-white text-sm">✕ Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { ImageSchema } from "@/lib/api-types";
import { buildImageUrl, imageBg } from "@/lib/utils";

interface ImageGalleryProps {
  images: ImageSchema[];
  name: string;
}

export function ImageGallery({ images, name }: ImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  // Reset when images change (e.g. filament variant swap)
  useEffect(() => {
    setActiveIdx(0);
  }, [images]);

  const prev = useCallback(() => {
    setActiveIdx((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setActiveIdx((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (images.length <= 1) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, prev, next]);

  if (!images.length) {
    return (
      <div
        className="rounded-card bg-gray-100 flex items-center justify-center w-full lg:w-[440px] shrink-0"
        style={{ aspectRatio: "1" }}
      >
        <span className="text-gray-300 text-sm">No image</span>
      </div>
    );
  }

  const active = images[activeIdx];

  return (
    <div className="flex flex-col gap-3 w-full lg:w-[440px] shrink-0">
      {/* ── Main image ── */}
      <div
        className="relative rounded-card overflow-hidden select-none"
        style={{ aspectRatio: "1", background: imageBg(active.url) }}
      >
        <Image
          key={active.url}
          src={buildImageUrl(active.url)}
          alt={active.alt_text ?? name}
          fill
          className="object-contain p-8 transition-opacity duration-200"
          sizes="(max-width: 1023px) 100vw, 440px"
          priority
          unoptimized
        />

        {/* Prev / Next arrows — only when multiple images */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center text-gray-700 transition"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center text-gray-700 transition"
            >
              ›
            </button>

            {/* Counter badge */}
            <div className="absolute bottom-2 right-3 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full">
              {activeIdx + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* ── Thumbnails ── */}
      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIdx(i)}
              aria-label={`View image ${i + 1}`}
              aria-pressed={i === activeIdx}
              className="relative rounded-xl overflow-hidden border-2 transition-colors shrink-0"
              style={{
                width: 72,
                height: 72,
                borderColor: i === activeIdx ? "var(--fg)" : "var(--border)",
                background: imageBg(img.url),
              }}
            >
              <Image
                src={buildImageUrl(img.url)}
                alt={img.alt_text ?? `${name} ${i + 1}`}
                fill
                className="object-contain p-1.5"
                sizes="72px"
                loading="lazy"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("prototypebd-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { accessToken?: string } };
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const token = getStoredToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/upload/image`, {
    method: "POST",
    body: form,
    headers,
    credentials: "include",
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg);
  }
  const { url } = (await res.json()) as { url: string };
  return url; // relative path e.g. /static/uploads/abc.jpg
}

function resolveDisplayUrl(url: string): string {
  if (url.startsWith("http")) return url;
  // relative URLs work via Next.js /static rewrite proxy
  return url;
}

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  max?: number;
}

export default function MultiImageUpload({
  value,
  onChange,
  label = "Product Images",
  max = 10,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: File[]) {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) return;
    const remaining = max - value.length;
    if (remaining <= 0) {
      setError(`Maximum ${max} images allowed`);
      return;
    }
    const toUpload = imageFiles.slice(0, remaining);
    setError(null);
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded: string[] = [];
      for (let i = 0; i < toUpload.length; i++) {
        const url = await uploadFile(toUpload[i]);
        uploaded.push(url);
        setUploadProgress(Math.round(((i + 1) / toUpload.length) * 100));
      }
      onChange([...value, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function setPrimary(index: number) {
    const next = [...value];
    const [img] = next.splice(index, 1);
    next.unshift(img);
    onChange(next);
  }

  function moveLeft(index: number) {
    if (index === 0) return;
    const next = [...value];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }

  function moveRight(index: number) {
    if (index === value.length - 1) return;
    const next = [...value];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs text-gray-400">
          {value.length}/{max} images
        </span>
      </div>

      {/* Thumbnail grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {value.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className={`relative group aspect-square rounded-xl overflow-hidden border-2 bg-gray-100 ${
                i === 0 ? "border-indigo-500" : "border-gray-200"
              }`}
            >
              <Image
                src={resolveDisplayUrl(url)}
                alt={`Product image ${i + 1}`}
                fill
                className="object-cover"
                unoptimized
              />

              {/* Primary badge */}
              {i === 0 && (
                <div className="absolute top-1 left-1 bg-indigo-600 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md leading-none">
                  PRIMARY
                </div>
              )}

              {/* Hover controls overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5 gap-1">
                {/* Top row: remove */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    title="Remove"
                    className="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center leading-none transition"
                  >
                    ×
                  </button>
                </div>

                {/* Middle: set primary */}
                {i > 0 && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setPrimary(i)}
                      title="Set as primary image"
                      className="text-[10px] bg-white/90 hover:bg-white text-gray-800 rounded-md px-1.5 py-0.5 font-medium transition whitespace-nowrap"
                    >
                      ★ Set primary
                    </button>
                  </div>
                )}

                {/* Bottom row: move left/right */}
                <div className="flex justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveLeft(i)}
                    disabled={i === 0}
                    title="Move left"
                    className="flex-1 bg-white/80 hover:bg-white text-gray-800 rounded text-xs py-0.5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => moveRight(i)}
                    disabled={i === value.length - 1}
                    title="Move right"
                    className="flex-1 bg-white/80 hover:bg-white text-gray-800 rounded text-xs py-0.5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {value.length < max && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(Array.from(e.dataTransfer.files));
          }}
          onClick={() => !uploading && fileRef.current?.click()}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 py-8 text-sm select-none ${
            dragOver
              ? "border-indigo-400 bg-indigo-50"
              : uploading
              ? "border-gray-300 bg-gray-50 cursor-wait"
              : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
          }`}
        >
          {uploading ? (
            <>
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-gray-500 text-sm">
                Uploading… {uploadProgress > 0 ? `${uploadProgress}%` : ""}
              </p>
            </>
          ) : (
            <>
              <span className="text-3xl">🖼</span>
              <p className="text-gray-600 text-center leading-snug">
                <span className="font-medium text-gray-800">Click to upload</span>
                {" or drag & drop"}
                <br />
                <span className="text-gray-400 text-xs">
                  PNG, JPG, WebP — up to {max - value.length} more image{max - value.length !== 1 ? "s" : ""}
                </span>
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />

      {error && (
        <div className="flex items-center justify-between text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {value.length > 0 && (
        <p className="text-xs text-gray-400">
          First image is the primary (shown on product cards). Hover an image to reorder or remove.
        </p>
      )}
    </div>
  );
}

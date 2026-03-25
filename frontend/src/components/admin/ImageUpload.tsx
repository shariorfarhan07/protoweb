"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const BACKEND_BASE = API_BASE.replace("/api/v1", "");

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
  const { url } = await res.json();
  return url; // e.g. /static/uploads/abc.jpg
}

function resolveDisplayUrl(url: string): string {
  if (url.startsWith("http")) return url;
  return `${BACKEND_BASE}${url}`;
}

interface ImageUploadProps {
  /** Current primary image URL (from previous save) */
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label = "Product Image",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return;
      }
      setError(null);
      setUploading(true);
      try {
        const url = await uploadFile(file);
        onChange(url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition flex flex-col items-center justify-center gap-2 text-sm
          ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"}
          ${value ? "py-3" : "py-10"}`}
      >
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10">
            <span className="text-sm text-gray-500 animate-pulse">Uploading…</span>
          </div>
        )}

        {value ? (
          <div className="flex items-center gap-4 px-4 w-full">
            <div className="relative w-20 h-20 shrink-0">
              <Image
                src={resolveDisplayUrl(value)}
                alt="Product image"
                fill
                className="object-cover rounded-lg"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{value.split("/").pop()}</p>
              <p className="text-xs text-gray-400 mt-0.5">Click or drag to replace</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              className="shrink-0 text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <span className="text-3xl">🖼</span>
            <p className="text-gray-500">
              <span className="font-medium text-gray-700">Click to upload</span> or drag & drop
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, WebP — max 5 MB</p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Manual URL fallback */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">or enter URL:</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/images/my-product.png"
          className="flex-1 rounded-md border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

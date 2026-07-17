"use client";

import { useEffect, useRef, useState } from "react";
import { importProductsCsv } from "@/lib/api";
import type { ProductImportResult } from "@/lib/api";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** FastAPI returns errors as JSON `{"detail": "..."}`; the api throws that raw body. */
function readError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  try {
    const parsed = JSON.parse(msg) as { detail?: string };
    if (parsed?.detail) return parsed.detail;
  } catch {
    /* not JSON */
  }
  return msg || "Import failed";
}

export function ImportCsvModal({
  onClose,
  onImported,
}: {
  onClose: () => void;
  onImported: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProductImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  function pickFile(f: File | undefined | null) {
    setError(null);
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".csv") && f.type !== "text/csv") {
      setError("Please choose a .csv file.");
      return;
    }
    setFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (busy) return;
    pickFile(e.dataTransfer.files?.[0]);
  }

  async function handleImport() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const res = await importProductsCsv(file);
      setResult(res);
      onImported();
    } catch (e: unknown) {
      setError(readError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(17,17,17,0.45)" }}
      onClick={() => !busy && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl"
        style={{ background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="font-semibold tracking-tight" style={{ color: "#111", fontSize: 17 }}>
              Update products via CSV
            </h2>
            <p style={{ fontSize: 12.5, color: "#999" }} className="mt-1">
              Rows are matched by <strong>id</strong> or <strong>SKU</strong> and updated in place — safe to re-run.
            </p>
          </div>
          <button
            onClick={() => !busy && onClose()}
            className="text-gray-400 hover:text-gray-700 transition shrink-0 ml-3"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pb-6">
          {!result ? (
            <>
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); if (!busy) setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => !busy && inputRef.current?.click()}
                className="rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                style={{
                  border: `2px dashed ${dragging ? "#111" : "#dcdcdc"}`,
                  background: dragging ? "#fafafa" : "#fcfcfc",
                  padding: "36px 24px",
                }}
              >
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={dragging ? "#111" : "#bbb"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="M17 8l-5-5-5 5" />
                  <path d="M12 3v12" />
                </svg>
                <p className="mt-3 text-sm font-medium" style={{ color: "#333" }}>
                  {dragging ? "Drop the file to upload" : "Drag & drop your CSV here"}
                </p>
                <p className="mt-1 text-xs" style={{ color: "#aaa" }}>
                  or <span style={{ color: "#111", textDecoration: "underline" }}>browse</span> to choose a file
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => pickFile(e.target.files?.[0])}
                />
              </div>

              {/* Selected file */}
              {file && (
                <div
                  className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5"
                  style={{ background: "#f5f9ff", border: "1px solid #d6e7ff" }}
                >
                  <span className="flex items-center justify-center rounded-lg shrink-0"
                    style={{ width: 30, height: 30, background: "#dbeafe", color: "#0070c9", fontSize: 11, fontWeight: 700 }}>
                    CSV
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: "#0c4a6e" }}>{file.name}</p>
                    <p style={{ fontSize: 11, color: "#7aa7d0" }}>{formatBytes(file.size)}</p>
                  </div>
                  {!busy && (
                    <button
                      onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ""; }}
                      className="text-xs text-sky-500 hover:text-sky-800 transition shrink-0"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: "#fff1f1", color: "#c92a2a" }}>
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => !busy && onClose()}
                  disabled={busy}
                  className="text-sm font-medium rounded-lg px-4 py-2 transition disabled:opacity-50"
                  style={{ background: "#fff", border: "1px solid #e0e0e0", color: "#555" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!file || busy}
                  className="text-sm font-semibold rounded-lg px-5 py-2 transition disabled:opacity-40"
                  style={{ background: "#111", color: "#fff" }}
                >
                  {busy ? "Updating…" : "Import & Update"}
                </button>
              </div>
            </>
          ) : (
            /* Result */
            (() => {
              const hasIssues = result.skipped > 0 || result.errors.length > 0;
              const nothingUpdated = result.updated === 0;
              // Red when nothing landed, amber when partial, green when clean.
              const tone = nothingUpdated
                ? { bg: "#fff1f1", color: "#c92a2a", border: "#ffd6d6", head: "⚠ No products were updated" }
                : hasIssues
                ? { bg: "#fffaf2", color: "#9a4d00", border: "#ffe2b8", head: "⚠ Updated with warnings" }
                : { bg: "#ecfdf3", color: "#15803d", border: "#bbf7d0", head: "✓ Import complete" };
              return (
            <div>
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ background: tone.bg, color: tone.color, border: `1px solid ${tone.border}` }}
              >
                <p className="font-semibold mb-1">{tone.head}</p>
                <strong>{result.updated}</strong> product{result.updated !== 1 ? "s" : ""} updated
                {result.skipped > 0 && <> · <strong>{result.skipped}</strong> skipped (no matching id/SKU)</>}
                {nothingUpdated && result.errors.length === 0 && (
                  <p className="mt-1 text-xs">
                    Check that your <strong>id</strong>/<strong>sku</strong> values match existing products.
                  </p>
                )}
                {result.errors.length > 0 && (
                  <>
                    {" "}· <strong>{result.errors.length}</strong> error(s):
                    <ul className="mt-1.5 list-disc list-inside text-xs" style={{ color: "#b45309" }}>
                      {result.errors.slice(0, 10).map((er, i) => (
                        <li key={i}>Row {er.row}: {er.message}</li>
                      ))}
                      {result.errors.length > 10 && <li>…and {result.errors.length - 10} more</li>}
                    </ul>
                  </>
                )}
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => { setResult(null); setFile(null); }}
                  className="text-sm font-medium rounded-lg px-4 py-2 transition"
                  style={{ background: "#fff", border: "1px solid #e0e0e0", color: "#555" }}
                >
                  Import another
                </button>
                <button
                  onClick={onClose}
                  className="text-sm font-semibold rounded-lg px-5 py-2 transition"
                  style={{ background: "#111", color: "#fff" }}
                >
                  Done
                </button>
              </div>
            </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}

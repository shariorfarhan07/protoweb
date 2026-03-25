"use client";

import { useState, useEffect, useRef } from "react";

type SpecEntry = { key: string; value: string };

function entriesToRecord(entries: SpecEntry[]): Record<string, string> {
  return entries
    .filter((e) => e.key.trim())
    .reduce<Record<string, string>>((acc, e) => {
      acc[e.key.trim()] = e.value.trim();
      return acc;
    }, {});
}

function recordToEntries(obj: Record<string, string>): SpecEntry[] {
  return Object.entries(obj).map(([key, value]) => ({ key, value: String(value) }));
}

function entriesToJson(entries: SpecEntry[]): string {
  const obj = entriesToRecord(entries);
  return JSON.stringify(obj, null, 2);
}

interface SpecificationsEditorProps {
  /** Controlled value — a flat object e.g. { "Build Volume": "256×256×256 mm" } */
  value: Record<string, string>;
  onChange: (val: Record<string, string>) => void;
}

export default function SpecificationsEditor({
  value,
  onChange,
}: SpecificationsEditorProps) {
  const [mode, setMode] = useState<"fields" | "json">("fields");
  const [entries, setEntries] = useState<SpecEntry[]>(() => {
    const e = recordToEntries(value);
    return e.length > 0 ? e : [{ key: "", value: "" }];
  });
  const [jsonText, setJsonText] = useState(() => entriesToJson(recordToEntries(value)));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Keep local entries in sync when parent resets value (e.g. page load)
  useEffect(() => {
    const incoming = recordToEntries(value);
    setEntries(incoming.length > 0 ? incoming : [{ key: "", value: "" }]);
    setJsonText(entriesToJson(incoming));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount only

  // ── Field mode helpers ────────────────────────────────────────────────────

  function updateEntries(next: SpecEntry[]) {
    setEntries(next);
    setJsonText(entriesToJson(next));
    onChange(entriesToRecord(next));
  }

  function addRow() {
    updateEntries([...entries, { key: "", value: "" }]);
  }

  function removeRow(i: number) {
    const next = entries.filter((_, idx) => idx !== i);
    updateEntries(next.length > 0 ? next : [{ key: "", value: "" }]);
  }

  function setEntry(i: number, field: "key" | "value", val: string) {
    const next = entries.map((e, idx) => (idx === i ? { ...e, [field]: val } : e));
    updateEntries(next);
  }

  // ── JSON mode helpers ─────────────────────────────────────────────────────

  function handleJsonChange(raw: string) {
    setJsonText(raw);
    setJsonError(null);
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null) {
        setJsonError("Must be a JSON object { }");
        return;
      }
      // Coerce all values to strings
      const coerced: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        coerced[k] = String(v);
      }
      const next = recordToEntries(coerced);
      setEntries(next.length > 0 ? next : [{ key: "", value: "" }]);
      onChange(coerced);
    } catch {
      setJsonError("Invalid JSON");
    }
  }

  // ── Mode switch ───────────────────────────────────────────────────────────

  function switchToJson() {
    setJsonText(entriesToJson(entries));
    setJsonError(null);
    setMode("json");
  }

  function switchToFields() {
    // Try to preserve the latest JSON edits
    try {
      const parsed = JSON.parse(jsonText);
      if (typeof parsed === "object" && !Array.isArray(parsed) && parsed !== null) {
        const next = recordToEntries(parsed as Record<string, string>);
        setEntries(next.length > 0 ? next : [{ key: "", value: "" }]);
        onChange(entriesToRecord(next));
      }
    } catch {
      // Silently keep existing entries if JSON was invalid
    }
    setJsonError(null);
    setMode("fields");
  }

  // ── JSON file import ──────────────────────────────────────────────────────

  function handleFileImport(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const raw = e.target?.result as string;
      handleJsonChange(raw);
    };
    reader.readAsText(file);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
            Specifications
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Used in the comparison table for 3D printers and CNC machines.
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
          <button
            type="button"
            onClick={switchToFields}
            className={`px-3 py-1.5 transition ${
              mode === "fields"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            Fields
          </button>
          <button
            type="button"
            onClick={switchToJson}
            className={`px-3 py-1.5 border-l border-gray-200 transition ${
              mode === "json"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            JSON
          </button>
        </div>
      </div>

      {/* ── Fields mode ── */}
      {mode === "fields" && (
        <div className="space-y-2">
          {entries.map((spec, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={spec.key}
                onChange={(e) => setEntry(i, "key", e.target.value)}
                placeholder="e.g. Build Volume"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-400 shrink-0">:</span>
              <input
                type="text"
                value={spec.value}
                onChange={(e) => setEntry(i, "value", e.target.value)}
                placeholder="e.g. 256 × 256 × 256 mm"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="text-gray-400 hover:text-red-500 text-xl leading-none px-1 transition shrink-0"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            className="text-sm text-blue-600 hover:underline"
          >
            + Add specification
          </button>
        </div>
      )}

      {/* ── JSON mode ── */}
      {mode === "json" && (
        <div className="space-y-2">
          <textarea
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            rows={12}
            spellCheck={false}
            placeholder={'{\n  "Build Volume": "256 × 256 × 256 mm",\n  "Nozzle Diameter": "0.4 mm"\n}'}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y ${
              jsonError ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
          />

          {jsonError && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <span>⚠</span> {jsonError}
            </p>
          )}

          {!jsonError && Object.keys(entriesToRecord(entries)).length > 0 && (
            <p className="text-xs text-green-600">
              ✓ {Object.keys(entriesToRecord(entries)).length} spec{Object.keys(entriesToRecord(entries)).length !== 1 ? "s" : ""} parsed
            </p>
          )}

          {/* Import from file */}
          <div className="flex items-center gap-3 pt-1">
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileImport(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded px-2.5 py-1 transition hover:bg-gray-50"
            >
              📂 Import from .json file
            </button>
            <button
              type="button"
              onClick={() => {
                const blob = new Blob([jsonText], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "specifications.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded px-2.5 py-1 transition hover:bg-gray-50"
            >
              ⬇ Export .json
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent, ReactNodeViewRenderer, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExt from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { ImageNodeView } from "./ImageNodeView";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";

// Custom image extension: adds `align` attribute + NodeView with drag/align/delete toolbar
const CustomImage = ImageExt.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "center",
        parseHTML: (el) => el.getAttribute("data-align") ?? "center",
        renderHTML: (attrs) => ({ "data-align": attrs.align as string }),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

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

async function uploadImageFile(file: File): Promise<string> {
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
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(text);
  }
  const { url } = (await res.json()) as { url: string };
  return url.startsWith("http") ? url : `http://localhost:8000${url}`;
}

// ── Shared UI primitives ───────────────────────────────────────────────────────

function Sep() {
  return <span className="w-px h-5 bg-gray-300 mx-0.5 self-center shrink-0" />;
}

function Btn({
  onClick,
  active,
  disabled,
  title,
  children,
  className = "",
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`h-7 px-1.5 min-w-[26px] rounded text-sm font-medium transition-colors select-none inline-flex items-center justify-center gap-0.5 ${
        active
          ? "bg-indigo-600 text-white"
          : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
      } disabled:opacity-30 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

// ── Toolbar ────────────────────────────────────────────────────────────────────

interface ToolbarProps {
  editor: Editor;
  uploading: boolean;
  onUploadFile: (file: File) => void;
}

function Toolbar({ editor, uploading, onUploadFile }: ToolbarProps) {
  const textColorRef = useRef<HTMLInputElement>(null);
  const highlightColorRef = useRef<HTMLInputElement>(null);

  const headingLevel = editor.isActive("heading", { level: 1 })
    ? "1"
    : editor.isActive("heading", { level: 2 })
    ? "2"
    : editor.isActive("heading", { level: 3 })
    ? "3"
    : editor.isActive("heading", { level: 4 })
    ? "4"
    : "0";

  const currentColor =
    (editor.getAttributes("textStyle").color as string | undefined) ?? "#111111";
  const currentHighlight =
    (editor.getAttributes("highlight").color as string | undefined) ?? "#fef08a";

  return (
    <div className="border-b border-gray-200 bg-gray-50 rounded-t-lg select-none">
      {/* ── Row 1: headings · text formatting · color · alignment · lists · history ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
        {/* Heading dropdown */}
        <select
          value={headingLevel}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "0") editor.chain().focus().setParagraph().run();
            else
              editor
                .chain()
                .focus()
                .toggleHeading({ level: parseInt(v) as 1 | 2 | 3 | 4 })
                .run();
          }}
          className="h-7 pl-2 pr-5 text-sm rounded border border-gray-300 bg-white text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
          title="Text style"
        >
          <option value="0">Normal</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
        </select>

        <Sep />

        {/* Basic text formatting */}
        <Btn
          title="Bold (Ctrl+B)"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <b>B</b>
        </Btn>
        <Btn
          title="Italic (Ctrl+I)"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <i>I</i>
        </Btn>
        <Btn
          title="Underline (Ctrl+U)"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <span className="underline">U</span>
        </Btn>
        <Btn
          title="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <span className="line-through">S</span>
        </Btn>
        <Btn
          title="Subscript"
          active={editor.isActive("subscript")}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
        >
          x<sub className="text-[9px]">2</sub>
        </Btn>
        <Btn
          title="Superscript"
          active={editor.isActive("superscript")}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        >
          x<sup className="text-[9px]">2</sup>
        </Btn>

        <Sep />

        {/* Text color */}
        <button
          type="button"
          title="Text color"
          onMouseDown={(e) => {
            e.preventDefault();
            textColorRef.current?.click();
          }}
          className="h-7 px-1.5 rounded text-sm font-medium transition-colors text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1"
        >
          <span className="font-bold leading-none" style={{ color: currentColor }}>
            A
          </span>
          <span
            className="w-4 h-1.5 rounded-sm border border-gray-300 block"
            style={{ background: currentColor }}
          />
        </button>
        <input
          ref={textColorRef}
          type="color"
          defaultValue="#111111"
          className="sr-only"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        />
        <Btn
          title="Remove text color"
          onClick={() => editor.chain().focus().unsetColor().run()}
        >
          ⌫A
        </Btn>

        {/* Highlight */}
        <button
          type="button"
          title="Highlight color"
          onMouseDown={(e) => {
            e.preventDefault();
            highlightColorRef.current?.click();
          }}
          className="h-7 px-1.5 rounded text-sm font-medium transition-colors text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1"
        >
          <span
            className="font-bold leading-none px-0.5 rounded-sm"
            style={{ background: currentHighlight }}
          >
            H
          </span>
          <span
            className="w-4 h-1.5 rounded-sm border border-gray-300 block"
            style={{ background: currentHighlight }}
          />
        </button>
        <input
          ref={highlightColorRef}
          type="color"
          defaultValue="#fef08a"
          className="sr-only"
          onChange={(e) =>
            editor.chain().focus().toggleHighlight({ color: e.target.value }).run()
          }
        />
        <Btn
          title="Remove highlight"
          onClick={() => editor.chain().focus().unsetHighlight().run()}
        >
          ⌫H
        </Btn>

        <Sep />

        {/* Alignment */}
        <Btn
          title="Align left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          ≡L
        </Btn>
        <Btn
          title="Align center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          ≡C
        </Btn>
        <Btn
          title="Align right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          ≡R
        </Btn>
        <Btn
          title="Justify"
          active={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          ≡J
        </Btn>

        <Sep />

        {/* Lists */}
        <Btn
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </Btn>
        <Btn
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </Btn>

        <Sep />

        {/* History */}
        <Btn
          title="Undo (Ctrl+Z)"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          ↩
        </Btn>
        <Btn
          title="Redo (Ctrl+Y)"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          ↪
        </Btn>
      </div>

      {/* ── Row 2: blocks · link · image · table ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-t border-gray-100">
        <Btn
          title="Blockquote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          ❝ Quote
        </Btn>
        <Btn
          title="Inline code"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          `code`
        </Btn>
        <Btn
          title="Code block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          {"</>"} Block
        </Btn>
        <Btn
          title="Horizontal rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          — HR
        </Btn>

        <Sep />

        {/* Link */}
        <Btn
          title="Insert / edit link"
          active={editor.isActive("link")}
          onClick={() => {
            const prev = editor.getAttributes("link").href as string | undefined;
            const url = window.prompt(
              "Enter URL (leave empty to remove):",
              prev ?? "https://"
            );
            if (url === null) return;
            if (url.trim() === "") editor.chain().focus().unsetLink().run();
            else
              editor
                .chain()
                .focus()
                .setLink({ href: url.trim(), target: "_blank" })
                .run();
          }}
        >
          🔗 Link
        </Btn>

        {/* Image upload via label — avoids browser security block on programmatic .click() */}
        <input
          id="rte-img-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUploadFile(file);
            e.target.value = "";
          }}
        />
        <label
          htmlFor="rte-img-upload"
          title="Upload image (also supports drag & drop or paste from clipboard)"
          onMouseDown={(e) => e.preventDefault()}
          className={`h-7 px-1.5 rounded text-sm font-medium transition-colors select-none cursor-pointer inline-flex items-center gap-1 ${
            uploading
              ? "bg-indigo-100 text-indigo-500 cursor-wait"
              : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
          }`}
        >
          {uploading ? "⏳ Uploading…" : "📷 Upload Image"}
        </label>

        {/* Image by URL */}
        <Btn
          title="Insert image from URL"
          onClick={() => {
            const url = window.prompt("Image URL:");
            if (url?.trim()) editor.chain().focus().setImage({ src: url.trim() }).run();
          }}
        >
          🌐 Image URL
        </Btn>

        <Sep />

        {/* Table controls */}
        <Btn
          title="Insert 3×3 table"
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        >
          ⊞ Table
        </Btn>
        <Btn
          title="Add row below"
          onClick={() => editor.chain().focus().addRowAfter().run()}
        >
          +Row
        </Btn>
        <Btn
          title="Add column after"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
        >
          +Col
        </Btn>
        <Btn
          title="Delete row"
          onClick={() => editor.chain().focus().deleteRow().run()}
        >
          −Row
        </Btn>
        <Btn
          title="Delete column"
          onClick={() => editor.chain().focus().deleteColumn().run()}
        >
          −Col
        </Btn>
        <Btn
          title="Delete table"
          onClick={() => editor.chain().focus().deleteTable().run()}
        >
          ✕ Tbl
        </Btn>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write product description here…",
  minHeight = 320,
}: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Refs keep the paste/drop handlers inside useEditor from capturing stale setters
  const setUploadingRef = useRef(setUploading);
  const setUploadErrorRef = useRef(setUploadError);
  setUploadingRef.current = setUploading;
  setUploadErrorRef.current = setUploadError;

  async function handleFile(file: File, insertFn: (url: string) => void) {
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadImageFile(file);
      insertFn(url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CustomImage.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: { class: "outline-none" },

      // Paste images from clipboard (screenshots, copy-pasted images)
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items ?? []);
        const imageItem = items.find((i) => i.type.startsWith("image/"));
        if (!imageItem) return false;
        const file = imageItem.getAsFile();
        if (!file) return false;
        event.preventDefault();
        setUploadingRef.current(true);
        setUploadErrorRef.current(null);
        uploadImageFile(file)
          .then((url) => {
            view.dispatch(
              view.state.tr.replaceSelectionWith(
                view.state.schema.nodes.image.create({ src: url })
              )
            );
          })
          .catch((e) =>
            setUploadErrorRef.current(
              e instanceof Error ? e.message : "Paste upload failed"
            )
          )
          .finally(() => setUploadingRef.current(false));
        return true;
      },

      // Drag & drop images into the editor
      handleDrop(view, event, _slice, moved) {
        if (moved) return false;
        const files = Array.from(event.dataTransfer?.files ?? []);
        const imageFile = files.find((f) => f.type.startsWith("image/"));
        if (!imageFile) return false;
        event.preventDefault();
        setUploadingRef.current(true);
        setUploadErrorRef.current(null);
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
        uploadImageFile(imageFile)
          .then((url) => {
            const pos = coords?.pos ?? view.state.selection.from;
            view.dispatch(
              view.state.tr.insert(
                pos,
                view.state.schema.nodes.image.create({ src: url })
              )
            );
          })
          .catch((e) =>
            setUploadErrorRef.current(
              e instanceof Error ? e.message : "Drop upload failed"
            )
          )
          .finally(() => setUploadingRef.current(false));
        return true;
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
      <Toolbar
        editor={editor}
        uploading={uploading}
        onUploadFile={(file) =>
          handleFile(file, (url) => editor.chain().focus().setImage({ src: url }).run())
        }
      />

      {uploadError && (
        <div className="flex items-center justify-between px-4 py-2 bg-red-50 border-b border-red-200 text-sm text-red-700">
          <span>⚠ {uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="ml-4 text-red-400 hover:text-red-600 text-base leading-none"
          >
            ✕
          </button>
        </div>
      )}

      <EditorContent
        editor={editor}
        style={{ minHeight }}
        className={[
          "prose prose-sm max-w-none px-4 py-3",
          "[&_.ProseMirror]:outline-none",
          // Images
          "[&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-md [&_.ProseMirror_img]:my-2",
          // Tables
          "[&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:my-3",
          "[&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-gray-300 [&_.ProseMirror_td]:p-2 [&_.ProseMirror_td]:align-top [&_.ProseMirror_td]:min-w-[60px]",
          "[&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-gray-300 [&_.ProseMirror_th]:p-2 [&_.ProseMirror_th]:bg-gray-100 [&_.ProseMirror_th]:font-semibold [&_.ProseMirror_th]:text-left",
          "[&_.ProseMirror_.selectedCell]:bg-indigo-50",
          // Placeholder
          "[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0",
        ].join(" ")}
      />

      <div className="px-4 py-1 border-t border-gray-100 bg-gray-50 text-xs text-gray-400 select-none">
        Tip: Drag &amp; drop or paste images directly into the editor
      </div>
    </div>
  );
}

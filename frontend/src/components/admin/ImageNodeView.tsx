"use client";

import { useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

export function ImageNodeView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  const [hovered, setHovered] = useState(false);

  const src = node.attrs.src as string;
  const alt = (node.attrs.alt as string) ?? "";
  const align = (node.attrs.align as string) ?? "center";

  const justifyClass =
    align === "left"
      ? "justify-start"
      : align === "right"
      ? "justify-end"
      : "justify-center";

  const showBar = hovered || selected;

  return (
    <NodeViewWrapper
      className={`image-node my-2 flex ${justifyClass}`}
      data-drag-handle
      draggable="true"
    >
      <div
        className="relative inline-block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Floating toolbar */}
        {showBar && (
          <div
            className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-px bg-gray-900/95 text-white rounded-lg px-1 py-0.5 shadow-xl text-xs whitespace-nowrap"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {/* Drag handle */}
            <span
              className="cursor-grab active:cursor-grabbing px-1.5 py-1 text-gray-300 hover:text-white select-none"
              title="Drag to reposition"
            >
              ⠿
            </span>
            <span className="w-px h-4 bg-gray-600 mx-0.5" />

            {/* Align */}
            <button
              type="button"
              title="Align left"
              onMouseDown={(e) => {
                e.preventDefault();
                updateAttributes({ align: "left" });
              }}
              className={`px-1.5 py-1 rounded hover:bg-gray-700 transition ${
                align === "left" ? "bg-indigo-600" : ""
              }`}
            >
              ◁─
            </button>
            <button
              type="button"
              title="Align center"
              onMouseDown={(e) => {
                e.preventDefault();
                updateAttributes({ align: "center" });
              }}
              className={`px-1.5 py-1 rounded hover:bg-gray-700 transition ${
                align === "center" ? "bg-indigo-600" : ""
              }`}
            >
              ─◈─
            </button>
            <button
              type="button"
              title="Align right"
              onMouseDown={(e) => {
                e.preventDefault();
                updateAttributes({ align: "right" });
              }}
              className={`px-1.5 py-1 rounded hover:bg-gray-700 transition ${
                align === "right" ? "bg-indigo-600" : ""
              }`}
            >
              ─▷
            </button>
            <span className="w-px h-4 bg-gray-600 mx-0.5" />

            {/* Delete */}
            <button
              type="button"
              title="Remove image"
              onMouseDown={(e) => {
                e.preventDefault();
                deleteNode();
              }}
              className="px-1.5 py-1 rounded text-red-400 hover:bg-red-600 hover:text-white transition"
            >
              ✕
            </button>
          </div>
        )}

        {/* Image */}
        <img
          src={src}
          alt={alt}
          draggable="false"
          className={`max-w-full rounded-md block transition-all ${
            selected ? "ring-2 ring-indigo-500 ring-offset-1" : ""
          } ${showBar ? "brightness-95" : ""}`}
        />
      </div>
    </NodeViewWrapper>
  );
}

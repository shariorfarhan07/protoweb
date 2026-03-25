import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function formatPrice(amount: number): string {
  return `৳${amount.toLocaleString("en-BD")}`;
}

export function formatDiscount(price: number, comparePrice: number): number {
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).trimEnd() + "…";
}

const PNG_GRADIENTS = [
  "linear-gradient(135deg, #ddeeff, #c8e6ff)",
  "linear-gradient(135deg, #ffe8d6, #ffd4b8)",
  "linear-gradient(135deg, #d6ffe8, #b8f5d2)",
  "linear-gradient(135deg, #ead6ff, #d4b8ff)",
  "linear-gradient(135deg, #fff4d6, #ffe8a0)",
  "linear-gradient(135deg, #ffd6e8, #ffb8d4)",
  "linear-gradient(135deg, #d6f0ff, #b8e4ff)",
  "linear-gradient(135deg, #e8ffd6, #ceffb0)",
];

/** Returns a stable light gradient for PNG images, plain white for others. */
export function imageBg(url: string | null | undefined): string {
  if (!url?.toLowerCase().endsWith(".png")) return "#ffffff";
  // Simple deterministic hash → pick gradient by index
  let h = 0;
  for (let i = 0; i < url.length; i++) h = (h * 31 + url.charCodeAt(i)) >>> 0;
  return PNG_GRADIENTS[h % PNG_GRADIENTS.length];
}

export function buildImageUrl(path: string): string {
  if (!path) return "/placeholder.png";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return path;
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ??
    "http://localhost:8000";
  return `${apiBase}/${path}`;
}

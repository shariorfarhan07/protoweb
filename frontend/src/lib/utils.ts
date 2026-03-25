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

export function buildImageUrl(path: string): string {
  if (!path) return "/placeholder.png";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return path;
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ??
    "http://localhost:8000";
  return `${apiBase}/${path}`;
}

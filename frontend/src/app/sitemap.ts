import type { MetadataRoute } from "next";
import { getCategories, getBrands, getProducts } from "@/lib/api";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://prototypebd.com";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, brands, products] = await Promise.allSettled([
    getCategories(),
    getBrands(),
    getProducts({ page_size: 100 }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), priority: 1.0, changeFrequency: "daily" },
    { url: `${BASE_URL}/shop`, lastModified: new Date(), priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE_URL}/compare`, lastModified: new Date(), priority: 0.5, changeFrequency: "weekly" },
  ];

  const categoryRoutes: MetadataRoute.Sitemap =
    categories.status === "fulfilled"
      ? categories.value.map((c) => ({
          url: `${BASE_URL}/category/${c.slug}`,
          lastModified: new Date(),
          priority: 0.8,
          changeFrequency: "weekly" as const,
        }))
      : [];

  const brandRoutes: MetadataRoute.Sitemap =
    brands.status === "fulfilled"
      ? brands.value.map((b) => ({
          url: `${BASE_URL}/brand/${b.slug}`,
          lastModified: new Date(),
          priority: 0.7,
          changeFrequency: "weekly" as const,
        }))
      : [];

  const productRoutes: MetadataRoute.Sitemap =
    products.status === "fulfilled"
      ? products.value.items.map((p) => ({
          url: `${BASE_URL}/products/${p.slug}`,
          lastModified: new Date(),
          priority: 0.9,
          changeFrequency: "daily" as const,
        }))
      : [];

  return [...staticRoutes, ...categoryRoutes, ...brandRoutes, ...productRoutes];
}

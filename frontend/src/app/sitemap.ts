import type { MetadataRoute } from "next";
import {
  getCategories,
  getBrands,
  getProducts,
  getBlogPosts,
  getBlogCategories,
} from "@/lib/api";
import type { ProductList, BlogPostList } from "@/lib/api-types";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://prototypebd.com";

export const revalidate = 3600;

const PAGE_SIZE = 100;
const MAX_PAGES = 50; // safety cap → up to 5 000 products

/** Walk every page of the product list so large catalogues aren't truncated. */
async function getAllProducts(): Promise<ProductList[]> {
  const first = await getProducts({ page: 1, page_size: PAGE_SIZE });
  const all = [...first.items];

  const totalPages = Math.min(first.total_pages, MAX_PAGES);
  if (totalPages > 1) {
    const rest = await Promise.allSettled(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        getProducts({ page: i + 2, page_size: PAGE_SIZE })
      )
    );
    for (const r of rest) {
      if (r.status === "fulfilled") all.push(...r.value.items);
    }
  }
  return all;
}

/** Walk every page of the blog post list. */
async function getAllBlogPosts(): Promise<BlogPostList[]> {
  const first = await getBlogPosts({ page: 1, page_size: 50 });
  const all = [...first.items];
  const totalPages = Math.min(first.total_pages, MAX_PAGES);
  if (totalPages > 1) {
    const rest = await Promise.allSettled(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        getBlogPosts({ page: i + 2, page_size: 50 })
      )
    );
    for (const r of rest) {
      if (r.status === "fulfilled") all.push(...r.value.items);
    }
  }
  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, brands, products, blogPosts, blogCategories] =
    await Promise.allSettled([
      getCategories(),
      getBrands(),
      getAllProducts(),
      getAllBlogPosts(),
      getBlogCategories(),
    ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, priority: 1.0, changeFrequency: "daily" },
    { url: `${BASE_URL}/shop`, lastModified: now, priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE_URL}/blog`, lastModified: now, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE_URL}/blog/videos`, lastModified: now, priority: 0.6, changeFrequency: "weekly" },
    { url: `${BASE_URL}/blog/projects`, lastModified: now, priority: 0.6, changeFrequency: "weekly" },
    { url: `${BASE_URL}/about`, lastModified: now, priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE_URL}/contact-us`, lastModified: now, priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE_URL}/privacy-policy`, lastModified: now, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE_URL}/compare`, lastModified: now, priority: 0.5, changeFrequency: "weekly" },
  ];

  const blogPostRoutes: MetadataRoute.Sitemap =
    blogPosts.status === "fulfilled"
      ? blogPosts.value.map((p) => ({
          url: `${BASE_URL}/blog/${p.slug}`,
          lastModified: new Date(p.updated_at ?? p.published_at),
          priority: 0.7,
          changeFrequency: "weekly" as const,
        }))
      : [];

  const blogCategoryRoutes: MetadataRoute.Sitemap =
    blogCategories.status === "fulfilled"
      ? blogCategories.value.map((c) => ({
          url: `${BASE_URL}/blog?category=${c.slug}`,
          lastModified: now,
          priority: 0.5,
          changeFrequency: "weekly" as const,
        }))
      : [];

  const categoryRoutes: MetadataRoute.Sitemap =
    categories.status === "fulfilled"
      ? categories.value.map((c) => ({
          url: `${BASE_URL}/category/${c.slug}`,
          lastModified: now,
          priority: 0.8,
          changeFrequency: "weekly" as const,
        }))
      : [];

  const brandRoutes: MetadataRoute.Sitemap =
    brands.status === "fulfilled"
      ? brands.value.map((b) => ({
          url: `${BASE_URL}/brand/${b.slug}`,
          lastModified: now,
          priority: 0.7,
          changeFrequency: "weekly" as const,
        }))
      : [];

  const productRoutes: MetadataRoute.Sitemap =
    products.status === "fulfilled"
      ? products.value.map((p) => ({
          url: `${BASE_URL}/products/${p.slug}`,
          lastModified: now,
          priority: 0.9,
          changeFrequency: "daily" as const,
        }))
      : [];

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...brandRoutes,
    ...productRoutes,
    ...blogPostRoutes,
    ...blogCategoryRoutes,
  ];
}

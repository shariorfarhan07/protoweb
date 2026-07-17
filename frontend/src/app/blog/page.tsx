import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/blog/PostCard";
import { BlogSearch } from "@/components/blog/BlogSearch";
import { getBlogPosts, getBlogCategories, getBlogTags } from "@/lib/api";
import type { BlogPostList, BlogCategory, BlogTag, PaginatedResponse } from "@/lib/api-types";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prototypebd.com";

interface SearchParams {
  category?: string;
  tag?: string;
  search?: string;
  page?: string;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { category, tag, search } = searchParams;

  // Search result pages should not be indexed (thin / infinite combinations).
  if (search) {
    return {
      title: `Search: ${search} — Blog`,
      description: `Blog articles matching “${search}”.`,
      robots: { index: false, follow: true },
      alternates: { canonical: "/blog" },
    };
  }

  if (category) {
    let name = category;
    try {
      const cats = await getBlogCategories();
      name = cats.find((c) => c.slug === category)?.name ?? category;
    } catch {
      /* fall back to slug */
    }
    return {
      title: `${name} — 3D Printing ${name}`,
      description: `${name} articles, guides and updates from PrototypeBD.`,
      alternates: { canonical: `/blog?category=${category}` },
      openGraph: { type: "website", title: `${name} — PrototypeBD Blog`, url: `/blog?category=${category}` },
    };
  }

  if (tag) {
    return {
      title: `#${tag} — Blog`,
      description: `Articles tagged “${tag}”.`,
      alternates: { canonical: `/blog?tag=${tag}` },
    };
  }

  return {
    title: "Blog — Tutorials, News, Projects & Tips",
    description:
      "3D printing tutorials, product news, community projects and pro tips from the PrototypeBD team.",
    alternates: {
      canonical: "/blog",
      types: { "application/rss+xml": `${SITE_URL}/blog/rss.xml` },
    },
    openGraph: { type: "website", title: "PrototypeBD Blog", url: "/blog" },
  };
}

function buildQuery(base: Partial<SearchParams>): string {
  const qs = new URLSearchParams();
  Object.entries(base).forEach(([k, v]) => {
    if (v) qs.set(k, String(v));
  });
  return qs.toString() ? `?${qs}` : "";
}

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const { category, tag, search } = searchParams;
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  let categories: BlogCategory[] = [];
  let tags: BlogTag[] = [];
  let data: PaginatedResponse<BlogPostList> = { items: [], total: 0, page: 1, page_size: 9, total_pages: 0 };

  try {
    [categories, tags, data] = await Promise.all([
      getBlogCategories(),
      getBlogTags(),
      getBlogPosts({ category, tag, search, page, page_size: 9 }),
    ]);
  } catch (e) {
    console.warn("Blog fetch failed:", e);
  }

  const activeCat = category ?? "";
  const activeCategory = categories.find((c) => c.slug === activeCat);

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog#blog`,
    name: activeCategory ? `${activeCategory.name} — PrototypeBD Blog` : "PrototypeBD Blog",
    url: activeCategory ? `${SITE_URL}/blog?category=${activeCategory.slug}` : `${SITE_URL}/blog`,
    publisher: { "@id": `${SITE_URL}/#organization` },
    blogPost: data.items.slice(0, 10).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE_URL}/blog/${p.slug}`,
      datePublished: p.published_at,
      author: { "@type": "Organization", name: p.author_name },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      ...(activeCategory
        ? [{ "@type": "ListItem", position: 3, name: activeCategory.name, item: `${SITE_URL}/blog?category=${activeCategory.slug}` }]
        : []),
    ],
  };

  return (
    <div style={{ background: "#f4f4f0", minHeight: "70vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {/* Header */}
      <header className="pbd-wrap" style={{ paddingTop: 48, paddingBottom: 8 }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#f2890e", letterSpacing: 3 }}>
          The PrototypeBD Blog
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-extrabold tracking-tight text-gray-900" style={{ fontSize: 38, letterSpacing: -1 }}>
            Tutorials, News &amp; Projects
          </h1>
          <BlogSearch />
        </div>

        {/* Sub-nav: videos + projects */}
        <div className="flex gap-2 mt-5">
          <Link href="/blog/videos" className="text-sm font-semibold rounded-full px-4 py-2"
            style={{ background: "#111", color: "#fff" }}>
            ▶ Video Tutorials
          </Link>
          <Link href="/blog/projects" className="text-sm font-semibold rounded-full px-4 py-2"
            style={{ background: "#fff", border: "1px solid #e4e6ea", color: "#111" }}>
            ✦ Community Showcase
          </Link>
        </div>
      </header>

      {/* Category tabs */}
      <nav className="pbd-wrap" style={{ paddingTop: 24, paddingBottom: 8 }}>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/blog"
            className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            style={ activeCat === "" ? { background: "#111", color: "#fff" } : { background: "#fff", color: "#555", border: "1px solid #e4e6ea" }}
          >
            All
          </Link>
          {categories.map((c) => {
            const active = activeCat === c.slug;
            return (
              <Link
                key={c.id}
                href={`/blog${buildQuery({ category: c.slug })}`}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
                style={active
                  ? { background: c.color ?? "#111", color: "#fff" }
                  : { background: "#fff", color: "#555", border: "1px solid #e4e6ea" }}
              >
                {c.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Active filter notice */}
      {(tag || search) && (
        <div className="pbd-wrap" style={{ paddingTop: 8 }}>
          <p className="text-sm text-gray-500">
            {search && <>Results for “<b>{search}</b>” </>}
            {tag && <>Tagged “<b>{tag}</b>” </>}
            · <Link href="/blog" className="underline" style={{ color: "#f2890e" }}>clear</Link>
          </p>
        </div>
      )}

      {/* Posts grid */}
      <section className="pbd-wrap" style={{ paddingTop: 24, paddingBottom: 48 }}>
        {data.items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-semibold text-gray-700">No articles found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different category or search term.</p>
          </div>
        ) : (
          <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {data.items.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {data.total_pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {page > 1 && (
              <Link href={`/blog${buildQuery({ category, tag, search, page: String(page - 1) })}`}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-white" style={{ border: "1px solid #e4e6ea" }}>
                ← Prev
              </Link>
            )}
            <span className="px-4 py-2 text-sm text-gray-500">Page {page} of {data.total_pages}</span>
            {page < data.total_pages && (
              <Link href={`/blog${buildQuery({ category, tag, search, page: String(page + 1) })}`}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-white" style={{ border: "1px solid #e4e6ea" }}>
                Next →
              </Link>
            )}
          </div>
        )}

        {/* Tag cloud */}
        {tags.length > 0 && (
          <div className="mt-12 pt-8" style={{ borderTop: "1px solid #e4e6ea" }}>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Popular tags</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <Link key={t.id} href={`/blog${buildQuery({ tag: t.slug })}`}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-white text-gray-600 hover:text-gray-900"
                  style={{ border: "1px solid #e4e6ea" }}>
                  #{t.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

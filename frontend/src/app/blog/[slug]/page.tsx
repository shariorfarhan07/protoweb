import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { CommentSection } from "@/components/blog/CommentSection";
import { PostCard } from "@/components/blog/PostCard";
import { getBlogPost, getBlogPosts } from "@/lib/api";
import { buildImageUrl } from "@/lib/utils";
import type { BlogPostList } from "@/lib/api-types";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prototypebd.com";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  if (!post) return { title: "Article not found", robots: { index: false, follow: false } };
  const canonical = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt ?? undefined,
      url: canonical,
      images: post.cover_image ? [{ url: buildImageUrl(post.cover_image) }] : undefined,
      publishedTime: post.published_at,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt ?? undefined },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function absUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

function wordCount(html: string): number {
  return html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPost(params.slug);
  if (!post) notFound();

  const color = post.category?.color ?? "#f2890e";

  // Related posts (same category, excluding the current one) for internal linking.
  let related: BlogPostList[] = [];
  if (post.category) {
    try {
      const res = await getBlogPosts({ category: post.category.slug, page_size: 4 });
      related = res.items.filter((p) => p.slug !== post.slug).slice(0, 3);
    } catch {
      related = [];
    }
  }

  const blogPostingLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE_URL}/blog/${post.slug}#article`,
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_image ? [absUrl(buildImageUrl(post.cover_image))] : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at ?? post.published_at,
    author: { "@type": "Organization", name: post.author_name, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "PrototypeBD",
      "@id": `${SITE_URL}/#organization`,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
    articleSection: post.category?.name ?? undefined,
    keywords: post.tags.map((t) => t.name).join(", ") || undefined,
    wordCount: wordCount(post.content),
    inLanguage: "en",
    timeRequired: `PT${post.reading_minutes}M`,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      ...(post.category
        ? [{ "@type": "ListItem", position: 3, name: post.category.name, item: `${SITE_URL}/blog?category=${post.category.slug}` }]
        : []),
      {
        "@type": "ListItem",
        position: post.category ? 4 : 3,
        name: post.title,
        item: `${SITE_URL}/blog/${post.slug}`,
      },
    ],
  };

  return (
    <div style={{ background: "#f4f4f0" }}>
      <article className="mx-auto px-5" style={{ maxWidth: 760, paddingTop: 40, paddingBottom: 56 }}>
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-gray-700">Home</Link><span>/</span>
          <Link href="/blog" className="hover:text-gray-700">Blog</Link>
          {post.category && (
            <>
              <span>/</span>
              <Link href={`/blog?category=${post.category.slug}`} className="hover:text-gray-700">{post.category.name}</Link>
            </>
          )}
        </nav>

        {post.category && (
          <Link href={`/blog?category=${post.category.slug}`}
            className="inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4"
            style={{ background: `${color}1a`, color }}>
            {post.category.name}
          </Link>
        )}

        <h1 className="font-extrabold text-gray-900 leading-tight" style={{ fontSize: "clamp(28px, 5vw, 42px)", letterSpacing: -1 }}>
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-500">
          <span className="font-semibold text-gray-700" rel="author">{post.author_name}</span>
          <span>·</span>
          <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
          <span>·</span><span>{post.reading_minutes} min read</span>
          <span>·</span><span>{post.view_count} views</span>
          {post.source === "facebook" && post.source_url && (
            <a href={post.source_url} target="_blank" rel="noopener noreferrer"
              className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ background: "#1877f2" }}>
              View on Facebook ↗
            </a>
          )}
        </div>

        {post.cover_image && (
          <div className="relative w-full rounded-2xl overflow-hidden mt-6" style={{ aspectRatio: "16/9" }}>
            <Image src={buildImageUrl(post.cover_image)} alt={post.title} fill className="object-cover" sizes="760px" priority />
          </div>
        )}

        <div className="my-6">
          <ShareButtons slug={post.slug} title={post.title} />
        </div>

        {/* Content */}
        <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8">
            {post.tags.map((t) => (
              <Link key={t.id} href={`/blog?tag=${t.slug}`}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-white text-gray-600 hover:text-gray-900"
                style={{ border: "1px solid #e4e6ea" }}>
                #{t.name}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 pt-6" style={{ borderTop: "1px solid #e4e6ea" }}>
          <ShareButtons slug={post.slug} title={post.title} />
        </div>

        {/* Related posts — internal linking */}
        {related.length > 0 && (
          <section className="mt-12 pt-8" style={{ borderTop: "1px solid #e4e6ea" }}>
            <h2 className="text-xl font-bold text-gray-900 mb-5">Related articles</h2>
            <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
              {related.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </section>
        )}

        {/* Comments */}
        <CommentSection slug={post.slug} />
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    </div>
  );
}

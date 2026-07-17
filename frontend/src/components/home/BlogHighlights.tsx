import Link from "next/link";
import { PostCard } from "@/components/blog/PostCard";
import type { BlogPostList } from "@/lib/api-types";

export function BlogHighlights({ posts }: { posts: BlogPostList[] }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="pbd-wrap" style={{ marginTop: 56 }}>
      <div className="pbd-section-head">
        <div>
          <h2 className="pbd-section-title">From the Blog</h2>
          <p style={{ color: "var(--pbd-ink-soft, #6b7280)", fontSize: 13.5, marginTop: 2 }}>
            Guides, product news and maker tips.
          </p>
        </div>
        <div className="pbd-head-tools">
          <Link href="/blog" className="pbd-orange-btn">Read the blog</Link>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {posts.slice(0, 3).map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}

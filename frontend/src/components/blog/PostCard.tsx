import Link from "next/link";
import Image from "next/image";
import type { BlogPostList } from "@/lib/api-types";
import { buildImageUrl } from "@/lib/utils";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PostCard({ post }: { post: BlogPostList }) {
  const color = post.category?.color ?? "#f2890e";

  return (
    <article
      className="group bg-white rounded-2xl overflow-hidden flex flex-col border transition-all duration-200 hover:-translate-y-1"
      style={{ borderColor: "#eceef1", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
    >
      <Link href={`/blog/${post.slug}`} className="relative block" style={{ aspectRatio: "16/9" }}>
        {post.cover_image ? (
          <Image
            src={buildImageUrl(post.cover_image)}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width:768px) 100vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${color}22, ${color}0a)` }}
          >
            <span className="text-4xl font-black" style={{ color: `${color}88` }}>
              {post.category?.name ?? "Blog"}
            </span>
          </div>
        )}
        {post.source === "facebook" && (
          <span
            className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full text-white"
            style={{ background: "#1877f2" }}
          >
            From Facebook
          </span>
        )}
      </Link>

      <div className="flex flex-col flex-1 p-5 gap-3">
        {post.category && (
          <Link
            href={`/blog?category=${post.category.slug}`}
            className="self-start text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{ background: `${color}1a`, color }}
          >
            {post.category.name}
          </Link>
        )}

        <Link href={`/blog/${post.slug}`}>
          <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-black" style={{ fontSize: 17 }}>
            {post.title}
          </h3>
        </Link>

        {post.excerpt && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{post.excerpt}</p>
        )}

        <div className="flex items-center gap-3 mt-auto pt-2 text-xs text-gray-400">
          <span className="font-medium text-gray-600">{post.author_name}</span>
          <span>·</span>
          <span>{formatDate(post.published_at)}</span>
          <span>·</span>
          <span>{post.reading_minutes} min read</span>
          {post.comment_count > 0 && (
            <>
              <span>·</span>
              <span>{post.comment_count} 💬</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

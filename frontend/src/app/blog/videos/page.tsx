import type { Metadata } from "next";
import Link from "next/link";
import { VideoGrid } from "@/components/blog/VideoGrid";
import { getVideoTutorials } from "@/lib/api";
import type { VideoTutorial } from "@/lib/api-types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Video Tutorials — 3D Printing & Laser Engraving",
  description: "Watch step-by-step video tutorials on 3D printing, laser engraving, slicing and more.",
  alternates: { canonical: "/blog/videos" },
  openGraph: { type: "website", title: "Video Tutorials — PrototypeBD", url: "/blog/videos" },
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prototypebd.com";

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}

export default async function VideosPage() {
  let videos: VideoTutorial[] = [];
  try {
    videos = await getVideoTutorials();
  } catch (e) {
    console.warn("Videos fetch failed:", e);
  }

  // VideoObject structured data → eligible for video rich results.
  const videoLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: videos.map((v, i) => {
      const id = youtubeId(v.video_url);
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "VideoObject",
          name: v.title,
          description: v.description ?? v.title,
          thumbnailUrl: v.thumbnail_url ?? (id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : undefined),
          uploadDate: v.created_at,
          contentUrl: v.video_url,
          embedUrl: id ? `https://www.youtube.com/embed/${id}` : v.video_url,
        },
      };
    }),
  };

  return (
    <div style={{ background: "#f4f4f0", minHeight: "70vh" }}>
      {videos.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoLd) }} />
      )}
      <header className="pbd-wrap" style={{ paddingTop: 48, paddingBottom: 8 }}>
        <nav className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
          <Link href="/blog" className="hover:text-gray-700">Blog</Link><span>/</span><span>Videos</span>
        </nav>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#f2890e", letterSpacing: 3 }}>
          Watch &amp; Learn
        </p>
        <h1 className="font-extrabold tracking-tight text-gray-900" style={{ fontSize: 38, letterSpacing: -1 }}>
          Video Tutorials
        </h1>
        <p className="text-gray-500 mt-2 max-w-xl">
          From unboxing to advanced slicer settings — learn 3D printing and laser engraving at your own pace.
        </p>
      </header>

      <section className="pbd-wrap" style={{ paddingTop: 28, paddingBottom: 56 }}>
        <VideoGrid videos={videos} />
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { getCommunityProjects } from "@/lib/api";
import type { CommunityProject } from "@/lib/api-types";
import { ProjectsGallery } from "@/components/blog/ProjectsGallery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Community Project Showcase",
  description: "Real builds from the PrototypeBD community — prints, mods and maker projects.",
  alternates: { canonical: "/blog/projects" },
  openGraph: { type: "website", title: "Community Showcase — PrototypeBD", url: "/blog/projects" },
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prototypebd.com";

export default async function ProjectsPage() {
  let projects: CommunityProject[] = [];
  try {
    projects = await getCommunityProjects();
  } catch (e) {
    console.warn("Projects fetch failed:", e);
  }

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Community Project Showcase",
    url: `${SITE_URL}/blog/projects`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: projects.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.title,
        item: p.project_url ?? `${SITE_URL}/blog/projects`,
      })),
    },
  };

  return (
    <div style={{ background: "#f4f4f0", minHeight: "70vh" }}>
      {projects.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      )}
      <header className="pbd-wrap" style={{ paddingTop: 48, paddingBottom: 8 }}>
        <nav className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
          <Link href="/blog" className="hover:text-gray-700">Blog</Link><span>/</span><span>Community</span>
        </nav>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#f2890e", letterSpacing: 3 }}>
          Made by the community
        </p>
        <h1 className="font-extrabold tracking-tight text-gray-900" style={{ fontSize: 38, letterSpacing: -1 }}>
          Community Project Showcase
        </h1>
        <p className="text-gray-500 mt-2 max-w-xl">
          Real builds from makers using PrototypeBD gear. Got something to show?{" "}
          <Link href="/contact-us" className="underline" style={{ color: "#f2890e" }}>Submit your project.</Link>
        </p>
      </header>

      <section className="pbd-wrap" style={{ paddingTop: 28, paddingBottom: 56 }}>
        <ProjectsGallery projects={projects} />
      </section>
    </div>
  );
}

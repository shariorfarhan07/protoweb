import { getBlogPosts } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prototypebd.com";

export const revalidate = 600;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  let items = "";
  try {
    const res = await getBlogPosts({ page: 1, page_size: 30 });
    items = res.items
      .map((p) => {
        const url = `${SITE_URL}/blog/${p.slug}`;
        return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.published_at).toUTCString()}</pubDate>
      ${p.category ? `<category>${esc(p.category.name)}</category>` : ""}
      <description>${esc(p.excerpt ?? "")}</description>
    </item>`;
      })
      .join("\n");
  } catch {
    items = "";
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PrototypeBD Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>3D printing tutorials, news, projects and tips from PrototypeBD.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}

import type { RequestHandler } from "./$types";
import { SITE_URL } from "$lib/constants";

// Demo players surfaced on the landing page. These resolve to deterministic
// mock profiles via the server adapter, so they are safe to advertise in the
// sitemap. Real friend-code pages are only indexable once the public lookup
// path exists, so they are intentionally omitted for now.
const DEMO_PLAYERS = ["amatsuka", "rainbow14", "dxstar"];

const STATIC_URLS: {
  path: string;
  changefreq: "daily" | "weekly" | "monthly";
  priority: string;
}[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "monthly", priority: "0.3" },
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemap(): string {
  const lastmod = new Date().toISOString().split("T")[0];

  const staticEntries = STATIC_URLS.map(
    ({ path, changefreq, priority }) =>
      `  <url>\n` +
      `    <loc>${SITE_URL}${escapeXml(path)}</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `    <changefreq>${changefreq}</changefreq>\n` +
      `    <priority>${priority}</priority>\n` +
      `  </url>`,
  );

  const playerEntries = DEMO_PLAYERS.map(
    (login) =>
      `  <url>\n` +
      `    <loc>${SITE_URL}/${escapeXml(login)}</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `    <changefreq>weekly</changefreq>\n` +
      `    <priority>0.7</priority>\n` +
      `  </url>`,
  );

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    [...staticEntries, ...playerEntries].join("\n") +
    `\n</urlset>\n`
  );
}

export const GET: RequestHandler = ({ platform }) => {
  const body = buildSitemap();
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
};

import type { APIRoute } from "astro";
import { projects } from "@data/projects";

const base = "https://community.curations.dev";

const urls = [
  base,
  `${base}/projects`,
  `${base}/ideas`,
  `${base}/forum`,
  ...projects.map((project) => `${base}/projects/${project.slug}`),
];

export const GET: APIRoute = () => {
  const entries = urls
    .map((url) => `<url><loc>${url}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`)
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};

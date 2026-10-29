import { DEFAULT_LOCALE, LOCALES, type Locale } from "../../app/assets/const/locale";
import { Route } from "../../app/assets/const/route";
import { projects } from "../../app/assets/data/projects";
import posts from "../../app/assets/data/blog/posts";

const X_DEFAULT = "x-default";

const XML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => XML_ENTITIES[char] ?? char);
}

function localizedPath(locale: Locale, path: string): string {
  return path === Route.home ? `/${locale}` : `/${locale}${path}`;
}

export function indexablePaths(): string[] {
  return [
    Route.home,
    Route.projects,
    ...projects.map((project) => Route.project(project.id)),
    Route.resume,
    Route.blog,
    ...posts.map((post) => Route.post(post.slug)),
  ];
}

function alternateLink(hreflang: string, href: string): string {
  return `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}"/>`;
}

function sitemapEntry(baseUrl: string, path: string, locale: Locale): string {
  const url = (target: Locale) => `${baseUrl}${localizedPath(target, path)}`;
  return [
    "  <url>",
    `    <loc>${escapeXml(url(locale))}</loc>`,
    ...LOCALES.map((target) => alternateLink(target, url(target))),
    alternateLink(X_DEFAULT, url(DEFAULT_LOCALE)),
    "  </url>",
  ].join("\n");
}

export function sitemapXml(baseUrl: string): string {
  const entries = indexablePaths().flatMap((path) =>
    LOCALES.map((locale) => sitemapEntry(baseUrl, path, locale)),
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");
}

export function robotsTxt(baseUrl: string): string {
  const lines = ["User-Agent: *", "Disallow:"];
  if (baseUrl) lines.push("", `Sitemap: ${baseUrl}${Route.sitemap}`);
  return `${lines.join("\n")}\n`;
}

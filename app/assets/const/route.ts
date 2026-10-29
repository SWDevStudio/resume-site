import type { Locale } from "./locale";

export const Route = {
  home: "/",
  about: { path: "/", hash: "#about" },
  contact: { path: "/", hash: "#contact" },
  projects: "/projects",
  project: (slug: string) => `/projects/${slug}`,
  blog: "/blog",
  post: (slug: string) => `/blog/${slug}`,
  resume: "/resume",
  resumePdf: (locale: Locale) => `/resume/${locale}.pdf`,
  resumeMarkdown: (locale: Locale) => `/resume/${locale}.md`,
  sitemap: "/sitemap.xml",
  robots: "/robots.txt",
  top: "#top",
  anchor: (id: string) => `#${id}`,
} as const;

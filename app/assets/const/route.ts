export const Route = {
  home: "/",
  about: { path: "/", hash: "#about" },
  contact: { path: "/", hash: "#contact" },
  projects: "/projects",
  project: (slug: string) => `/projects/${slug}`,
  blog: "/blog",
  resume: "/resume",
  top: "#top",
  anchor: (id: string) => `#${id}`,
} as const;

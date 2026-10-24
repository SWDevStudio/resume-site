import type { BlogPostSummary } from "../../api/types/blog";

const posts = [
  {
    slug: "booking-calendar-nextjs",
    kind: "video",
    title: "[Booking calendar in Next.js from scratch]",
    excerpt: "[What the video covers in one or two sentences.]",
    publishedAt: "[20 Sep 2026]",
    duration: "24:18",
    tags: ["Next.js", "Booking", "Tutorial"],
    cover: {
      type: "video",
      title: "<Calendar />",
      duration: "24:18",
    },
    source: {
      name: "YouTube",
      url: "https://www.youtube.com/",
    },
  },
  {
    slug: "llms-txt-gen",
    kind: "tool",
    title: "[llms-txt-gen]",
    excerpt: "[CLI that builds llms.txt from your sitemap and keeps it in sync on every deploy.]",
    publishedAt: "[14 Sep 2026]",
    stars: "[128]",
    forks: "[12]",
    language: "TypeScript",
    license: "MIT",
    version: "[v1.2.0]",
    tags: ["CLI", "TypeScript", "SEO", "Open source"],
    cover: {
      type: "terminal",
      title: "github.com/[user]/llms-txt-gen",
      command: "npx llms-txt-gen init",
      output: "✓ llms.txt generated · 42 pages",
    },
    source: {
      name: "GitHub",
      url: "https://github.com/",
    },
  },
  {
    slug: "seo-for-llms",
    kind: "article",
    title: "SEO for LLMs in the AI era",
    excerpt:
      "People increasingly ask AI assistants for answers. Those responses are synthesized from web sources that model providers crawl, index and score for reliability.",
    publishedAt: "[12 Sep 2026]",
    readMinutes: 8,
    tags: ["SEO", "AI", "llms.txt", "Next.js"],
    cover: {
      type: "text",
      lines: [
        {
          text: "robots.txt",
          muted: true,
          strike: true,
        },
        {
          text: "llms.txt",
          indent: 1.2,
        },
      ],
    },
    source: {
      name: "habr.com",
      url: "https://habr.com/",
    },
  },
  {
    slug: "lighthouse-100",
    kind: "video",
    title: "[Lighthouse 100 in 30 minutes]",
    excerpt: "[What the video covers in one or two sentences.]",
    publishedAt: "[5 Sep 2026]",
    duration: "31:05",
    tags: ["Lighthouse", "Performance", "Tutorial"],
    cover: {
      type: "video",
      title: "100 / 100",
      duration: "31:05",
    },
    source: {
      name: "YouTube",
      url: "https://www.youtube.com/",
    },
  },
  {
    slug: "headless-or-classic-cms",
    kind: "article",
    title: "Headless or classic CMS",
    excerpt:
      "[When a headless CMS pays off, and when a classic one is still the faster and cheaper choice for a small business.]",
    publishedAt: "[28 Aug 2026]",
    readMinutes: 11,
    tags: ["CMS", "Headless", "Architecture"],
    cover: {
      type: "text",
      lines: [
        {
          text: "{ headless }",
        },
        {
          text: "vs <classic />",
          scale: 0.62,
          muted: true,
          indent: 2.4,
        },
      ],
    },
    source: {
      name: "dev.to",
      url: "https://dev.to/",
    },
  },
  {
    slug: "cwv-watch",
    kind: "tool",
    title: "[cwv-watch]",
    excerpt:
      "[GitHub Action that runs Lighthouse on every pull request and comments with Core Web Vitals.]",
    publishedAt: "[10 Aug 2026]",
    stars: "[64]",
    forks: "[8]",
    language: "GitHub Action",
    license: "MIT",
    version: "[v0.4.1]",
    tags: ["GitHub Actions", "Lighthouse", "CI"],
    cover: {
      type: "terminal",
      title: "github.com/[user]/cwv-watch",
      command: "uses: [user]/cwv-watch@v1",
      output: "✓ LCP 1.8s · CLS 0.02 · INP 90ms",
    },
    source: {
      name: "GitHub",
      url: "https://github.com/",
    },
  },
  {
    slug: "core-web-vitals-checklist",
    kind: "article",
    title: "[Core Web Vitals: a checklist for e-commerce]",
    excerpt: "[One or two sentences about what the reader will learn.]",
    publishedAt: "[2 Aug 2026]",
    readMinutes: 6,
    tags: ["Performance", "Core Web Vitals", "E-commerce"],
    cover: {
      type: "text",
      lines: [
        {
          text: "LCP < 2.5s",
        },
        {
          text: "INP < 200ms · CLS < 0.1",
          scale: 0.42,
          muted: true,
        },
      ],
    },
    source: {
      name: "medium.com",
      url: "https://medium.com/",
    },
  },
] satisfies BlogPostSummary[];

export default posts;

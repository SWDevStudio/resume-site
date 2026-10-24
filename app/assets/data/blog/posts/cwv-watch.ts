import type { BlogBlock } from "../../../api/types/blog";

const cwv_watch = [
  {
    component: "BlogPostHeader",
    data: {
      slug: "cwv-watch",
      kind: "tool",
      title: "[cwv-watch]",
      publishedAt: "[10 Aug 2026]",
      stars: "[64]",
      forks: "[8]",
      language: "GitHub Action",
      license: "MIT",
      version: "[v0.4.1]",
      author: {
        name: "Michael",
        role: "Fullstack developer",
        initials: "SW",
      },
    },
  },
  {
    component: "BlogPostCover",
    data: {
      cover: {
        type: "terminal",
        title: "github.com/[user]/cwv-watch",
        command: "uses: [user]/cwv-watch@v1",
        output: "✓ LCP 1.8s · CLS 0.02 · INP 90ms",
      },
    },
  },
  {
    component: "BlogPostFacts",
    data: {
      stars: "[64]",
      forks: "[8]",
      language: "GitHub Action",
      license: "MIT",
      version: "[v0.4.1]",
    },
  },
  {
    component: "BlogPostSource",
    data: {
      kind: "tool",
      source: {
        name: "GitHub",
        url: "https://github.com/",
      },
    },
  },
  {
    component: "BlogPostChapter",
    data: {
      id: "intro",
      name: "What it does",
      hidden: true,
      blocks: [
        {
          component: "BlogPostText",
          data: {
            text: "[What the action does and which problem it solves, in two or three sentences.]",
          },
        },
      ],
    },
  },
  {
    component: "BlogPostChapter",
    data: {
      id: "install",
      name: "Install",
      blocks: [
        {
          component: "BlogPostCode",
          data: {
            code: "npm i -D cwv-watch\nnpx cwv-watch init",
          },
        },
      ],
    },
  },
  {
    component: "BlogPostChapter",
    data: {
      id: "usage",
      name: "Usage",
      blocks: [
        {
          component: "BlogPostText",
          data: {
            text: "[How to run it locally and in CI.]",
          },
        },
        {
          component: "BlogPostCode",
          data: {
            code: "npx cwv-watch run --url https://[site]/",
          },
        },
      ],
    },
  },
  {
    component: "BlogPostChapter",
    data: {
      id: "options",
      name: "Options",
      blocks: [
        {
          component: "BlogPostTable",
          data: {
            columns: ["Option", "What it does"],
            rows: [
              ["--url", "[Page URL to audit]"],
              ["--budget", "[Path to the performance budget file]"],
              ["--comment", "[Post the result to the pull request]"],
            ],
          },
        },
      ],
    },
  },
  {
    component: "BlogPostChapter",
    data: {
      id: "roadmap",
      name: "Roadmap",
      blocks: [
        {
          component: "BlogPostList",
          data: {
            ordered: false,
            items: ["[Planned feature]", "[Planned feature]"],
          },
        },
      ],
    },
  },
  {
    component: "BlogPostTags",
    data: {
      tags: ["GitHub Actions", "Lighthouse", "CI"],
    },
  },
  {
    component: "BlogPostRelated",
    data: {
      items: [
        {
          slug: "core-web-vitals-checklist",
          kind: "article",
          title: "[Core Web Vitals: a checklist for e-commerce]",
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
        },
        {
          slug: "lighthouse-100",
          kind: "video",
          title: "[Lighthouse 100 in 30 minutes]",
          cover: {
            type: "video",
            title: "100 / 100",
            duration: "31:05",
          },
        },
      ],
    },
  },
] satisfies BlogBlock[];

export default cwv_watch;

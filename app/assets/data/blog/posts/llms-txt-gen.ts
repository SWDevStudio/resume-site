import type { BlogBlock } from "../../../api/types/blog";

const llms_txt_gen = [
  {
    component: "BlogPostHeader",
    data: {
      slug: "llms-txt-gen",
      kind: "tool",
      title: "[llms-txt-gen]",
      publishedAt: "[14 Sep 2026]",
      stars: "[128]",
      forks: "[12]",
      language: "TypeScript",
      license: "MIT",
      version: "[v1.2.0]",
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
        title: "github.com/[user]/llms-txt-gen",
        command: "npx llms-txt-gen init",
        output: "✓ llms.txt generated · 42 pages",
      },
    },
  },
  {
    component: "BlogPostFacts",
    data: {
      stars: "[128]",
      forks: "[12]",
      language: "TypeScript",
      license: "MIT",
      version: "[v1.2.0]",
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
            text: "[What the tool does and which problem it solves, in two or three sentences.]",
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
            code: "npm i -D llms-txt-gen\nnpx llms-txt-gen init",
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
            code: "npx llms-txt-gen build --sitemap https://[site]/sitemap.xml",
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
              ["--sitemap", "[URL or path to sitemap.xml]"],
              ["--out", "[Where to write the file, default ./public/llms.txt]"],
              ["--watch", "[Rebuild on content changes]"],
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
      tags: ["CLI", "TypeScript", "SEO", "Open source"],
    },
  },
  {
    component: "BlogPostRelated",
    data: {
      items: [
        {
          slug: "seo-for-llms",
          kind: "article",
          title: "SEO for LLMs in the AI era",
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

export default llms_txt_gen;

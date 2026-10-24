import type { BlogBlock } from "../../../api/types/blog";

const seo_for_llms = [
  {
    component: "BlogPostHeader",
    data: {
      slug: "seo-for-llms",
      kind: "article",
      title: "SEO for LLMs in the AI era",
      publishedAt: "[12 Sep 2026]",
      readMinutes: 8,
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
  },
  {
    component: "BlogPostSource",
    data: {
      kind: "article",
      source: {
        name: "habr.com",
        url: "https://habr.com/",
      },
    },
  },
  {
    component: "BlogPostChapter",
    data: {
      id: "intro",
      name: "Introduction",
      hidden: true,
      blocks: [
        {
          component: "BlogPostText",
          data: {
            text: "People increasingly ask AI assistants for answers. Those responses are synthesized from web sources that model providers crawl, index and score for reliability. [Continue the intro: why it matters for a small business site.]",
          },
        },
      ],
    },
  },
  {
    component: "BlogPostChapter",
    data: {
      id: "what",
      name: "What is llms.txt",
      blocks: [
        {
          component: "BlogPostText",
          data: {
            text: "[A short explanation: a plain-text map of your site for language models, next to robots.txt and sitemap.xml.]",
          },
        },
        {
          component: "BlogPostCode",
          data: {
            language: "markdown",
            code: "# Sawa Studio\n> Fullstack developer: fast, SEO-friendly web products.\n## Projects\n- [Qwixit](https://[site]/projects/qwixit): fashion marketplace\n- [Brendmart](https://[site]/projects/brendmart): online store",
          },
        },
      ],
    },
  },
  {
    component: "BlogPostChapter",
    data: {
      id: "setup",
      name: "How to set it up",
      blocks: [
        {
          component: "BlogPostList",
          data: {
            ordered: true,
            items: [
              "[Step one: list the pages that matter.]",
              "[Step two: write one-line descriptions.]",
              "[Step three: publish at /llms.txt and link it from robots.txt.]",
            ],
          },
        },
        {
          component: "BlogPostCallout",
          data: {
            variant: "tip",
            text: "[A practical tip, e.g. regenerate the file on every deploy with llms-txt-gen.]",
          },
        },
      ],
    },
  },
  {
    component: "BlogPostChapter",
    data: {
      id: "results",
      name: "Results",
      blocks: [
        {
          component: "BlogPostText",
          data: {
            text: "[What changed after: mentions in AI answers, traffic, leads.]",
          },
        },
      ],
    },
  },
  {
    component: "BlogPostTags",
    data: {
      tags: ["SEO", "AI", "llms.txt", "Next.js"],
    },
  },
  {
    component: "BlogPostRelated",
    data: {
      items: [
        {
          slug: "headless-or-classic-cms",
          kind: "article",
          title: "Headless or classic CMS",
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
        },
        {
          slug: "llms-txt-gen",
          kind: "tool",
          title: "[llms-txt-gen]",
          cover: {
            type: "terminal",
            title: "github.com/[user]/llms-txt-gen",
            command: "npx llms-txt-gen init",
            output: "✓ llms.txt generated · 42 pages",
          },
        },
      ],
    },
  },
] satisfies BlogBlock[];

export default seo_for_llms;

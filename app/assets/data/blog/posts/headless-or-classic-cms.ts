import type { BlogBlock } from "../../../../types/blog";

const headless_or_classic_cms = [
  {
    component: "BlogPostHeader",
    data: {
      slug: "headless-or-classic-cms",
      kind: "article",
      title: "Headless or classic CMS",
      publishedAt: "[28 Aug 2026]",
      readMinutes: 11,
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
  },
  {
    component: "BlogPostSource",
    data: {
      kind: "article",
      source: {
        name: "dev.to",
        url: "https://dev.to/",
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
            text: "[Why the choice of a CMS matters for a small business site.]",
          },
        },
      ],
    },
  },
  {
    component: "BlogPostChapter",
    data: {
      id: "headless",
      name: "What is a headless CMS",
      blocks: [
        {
          component: "BlogPostText",
          data: {
            text: "[A short explanation: content lives in an API, the site is a separate frontend.]",
          },
        },
      ],
    },
  },
  {
    component: "BlogPostChapter",
    data: {
      id: "pays-off",
      name: "When headless pays off",
      blocks: [
        {
          component: "BlogPostList",
          data: {
            ordered: false,
            items: [
              "[Several channels share one content source.]",
              "[The team needs a custom frontend.]",
            ],
          },
        },
      ],
    },
  },
  {
    component: "BlogPostChapter",
    data: {
      id: "classic",
      name: "When classic is enough",
      blocks: [
        {
          component: "BlogPostText",
          data: {
            text: "[A simple site with one editor: a classic CMS is faster and cheaper.]",
          },
        },
      ],
    },
  },
  {
    component: "BlogPostTags",
    data: {
      tags: ["CMS", "Headless", "Architecture"],
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

export default headless_or_classic_cms;

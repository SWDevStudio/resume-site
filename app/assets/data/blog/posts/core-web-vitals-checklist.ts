import type { BlogBlock } from "../../../api/types/blog";

const core_web_vitals_checklist = [
  {
    component: "BlogPostHeader",
    data: {
      slug: "core-web-vitals-checklist",
      kind: "article",
      title: "[Core Web Vitals: a checklist for e-commerce]",
      publishedAt: "[2 Aug 2026]",
      readMinutes: 6,
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
  },
  {
    component: "BlogPostSource",
    data: {
      kind: "article",
      source: {
        name: "medium.com",
        url: "https://medium.com/",
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
            text: "[Why Core Web Vitals matter for an online store.]",
          },
        },
      ],
    },
  },
  {
    component: "BlogPostChapter",
    data: {
      id: "metrics",
      name: "What Core Web Vitals measure",
      blocks: [
        {
          component: "BlogPostText",
          data: {
            text: "[LCP, INP and CLS in one paragraph each.]",
          },
        },
      ],
    },
  },
  {
    component: "BlogPostChapter",
    data: {
      id: "checklist",
      name: "Checklist",
      blocks: [
        {
          component: "BlogPostList",
          data: {
            ordered: true,
            items: [
              "[Check one: optimize the hero image.]",
              "[Check two: defer third-party scripts.]",
              "[Check three: reserve space for dynamic blocks.]",
            ],
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
            text: "[What changed after: metrics, conversion.]",
          },
        },
      ],
    },
  },
  {
    component: "BlogPostTags",
    data: {
      tags: ["Performance", "Core Web Vitals", "E-commerce"],
    },
  },
  {
    component: "BlogPostRelated",
    data: {
      items: [
        {
          slug: "cwv-watch",
          kind: "tool",
          title: "[cwv-watch]",
          cover: {
            type: "terminal",
            title: "github.com/[user]/cwv-watch",
            command: "uses: [user]/cwv-watch@v1",
            output: "✓ LCP 1.8s · CLS 0.02 · INP 90ms",
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

export default core_web_vitals_checklist;

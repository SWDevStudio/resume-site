import type { BlogBlock } from "../../../api/types/blog";

const lighthouse_100 = [
  {
    component: "BlogPostHeader",
    data: {
      slug: "lighthouse-100",
      kind: "video",
      title: "[Lighthouse 100 in 30 minutes]",
      publishedAt: "[5 Sep 2026]",
      duration: "31:05",
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
        type: "video",
        title: "100 / 100",
        duration: "31:05",
      },
    },
  },
  {
    component: "BlogPostSource",
    data: {
      kind: "video",
      source: {
        name: "YouTube",
        url: "https://www.youtube.com/",
      },
    },
  },
  {
    component: "BlogPostChapter",
    data: {
      id: "intro",
      name: "About the video",
      hidden: true,
      blocks: [
        {
          component: "BlogPostText",
          data: {
            text: "[What the viewer will build and who the video is for.]",
          },
        },
      ],
    },
  },
  {
    component: "BlogPostChapter",
    data: {
      id: "chapters",
      name: "Chapters",
      blocks: [
        {
          component: "BlogPostTable",
          data: {
            columns: ["Time", "Chapter"],
            rows: [
              ["00:00", "[Intro]"],
              ["02:14", "[Data model]"],
              ["08:40", "[Calendar UI]"],
              ["15:05", "[Availability API]"],
              ["21:30", "[Deploy]"],
            ],
          },
        },
      ],
    },
  },
  {
    component: "BlogPostChapter",
    data: {
      id: "summary",
      name: "Summary",
      blocks: [
        {
          component: "BlogPostText",
          data: {
            text: "[The key points of the video as text.]",
          },
        },
      ],
    },
  },
  {
    component: "BlogPostChapter",
    data: {
      id: "code",
      name: "Code from the video",
      blocks: [
        {
          component: "BlogPostCode",
          data: {
            code: "// [snippet from the video]\nexport const budget = {\n  // ...\n};",
          },
        },
      ],
    },
  },
  {
    component: "BlogPostTags",
    data: {
      tags: ["Lighthouse", "Performance", "Tutorial"],
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
          slug: "booking-calendar-nextjs",
          kind: "video",
          title: "[Booking calendar in Next.js from scratch]",
          cover: {
            type: "video",
            title: "<Calendar />",
            duration: "24:18",
          },
        },
      ],
    },
  },
] satisfies BlogBlock[];

export default lighthouse_100;

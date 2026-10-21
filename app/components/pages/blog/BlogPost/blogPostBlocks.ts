import type { Component } from "vue";
import BlogPostCallout from "./BlogPostCallout.vue";
import BlogPostChapter from "./BlogPostChapter.vue";
import BlogPostCode from "./BlogPostCode.vue";
import BlogPostCover from "./BlogPostCover.vue";
import BlogPostFacts from "./BlogPostFacts.vue";
import BlogPostHeader from "./BlogPostHeader.vue";
import BlogPostList from "./BlogPostList.vue";
import BlogPostRelated from "./BlogPostRelated.vue";
import BlogPostSource from "./BlogPostSource.vue";
import BlogPostTable from "./BlogPostTable.vue";
import BlogPostTags from "./BlogPostTags.vue";
import BlogPostText from "./BlogPostText.vue";

export const blogPostBlocks: Record<string, Component> = {
  BlogPostHeader,
  BlogPostCover,
  BlogPostFacts,
  BlogPostSource,
  BlogPostChapter,
  BlogPostText,
  BlogPostList,
  BlogPostCode,
  BlogPostCallout,
  BlogPostTable,
  BlogPostTags,
  BlogPostRelated,
};

export const blogPostBlockNames: string[] = Object.keys(blogPostBlocks);

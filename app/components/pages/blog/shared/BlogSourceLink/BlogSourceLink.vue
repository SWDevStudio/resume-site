<template>
  <a
    class="blog-source-link"
    :class="rootClass"
    :href="source.url"
    target="_blank"
    rel="noopener noreferrer"
  >
    <span class="blog-source-link-text">
      <I18nT
        v-if="phrase"
        :keypath="keypath"
        tag="span"
      >
        <template #name>
          <span
            lang="en"
            data-atom-skip
          >
            {{ source.name }}
          </span>
        </template>
      </I18nT>
      <span
        v-else
        lang="en"
        data-atom-skip
      >
        {{ source.name }}
      </span>
    </span>
    <UiIcon
      name="external"
      class="blog-source-link-icon"
    />
  </a>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { I18nT } from "vue-i18n";
import { blogToneClass } from "~/components/pages/blog/shared/blogTone";
import UiIcon from "~/components/ui/UiIcon/UiIcon.vue";
import type { BlogKind, BlogSource } from "~/assets/api/types/blog";

const props = withDefaults(
  defineProps<{
    source: BlogSource;
    kind: BlogKind;
    phrase?: boolean;
  }>(),
  { phrase: true },
);

const rootClass = computed(() => blogToneClass(props.kind));
const keypath = computed(() => `blog.card.source.${props.kind}`);
</script>

<style src="./BlogSourceLink.css" />

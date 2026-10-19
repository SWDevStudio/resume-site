<template>
  <div class="folder">
    <span
      class="card-frame"
      aria-hidden="true"
    />
    <span
      class="card-deco"
      aria-hidden="true"
    />
    <div class="card-body">
      <UiCardHead
        v-if="hasHead"
        :index="data.index"
        :title="data.title"
        :subtitle="data.subtitle"
      />
      <p
        v-if="data.text"
        class="card-text"
      >
        {{ data.text }}
      </p>
      <div
        v-if="hasTags"
        class="card-tags"
      >
        <span
          v-for="tag in tags"
          :key="tag"
          class="card-tag"
        >
          {{ tag }}
        </span>
      </div>
      <slot name="media">
        <UiCardMedia
          v-if="data.image"
          :src="data.image"
          :alt="imageAlt"
        />
      </slot>
      <div
        v-if="slots.actions"
        class="folder-actions"
      >
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue";
import type { FolderData } from "~/components/ui/card/types";
import UiCardHead from "~/components/ui/card/UiCardHead/UiCardHead.vue";
import UiCardMedia from "~/components/ui/card/UiCardMedia/UiCardMedia.vue";

const props = defineProps<{
  data: FolderData;
}>();

const slots = useSlots();

const hasHead = computed(() => Boolean(props.data.title || props.data.subtitle));
const tags = computed(() => props.data.tags ?? []);
const hasTags = computed(() => tags.value.length > 0);
const imageAlt = computed(() => props.data.imageAlt ?? "");
</script>

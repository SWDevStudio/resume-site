<template>
  <section
    ref="root"
    class="page-section"
    :class="sectionClass"
    :aria-labelledby="sectionId"
  >
    <span
      v-if="label"
      class="page-section-label"
    >
      {{ label }}
    </span>
    <div
      v-if="hasEnd"
      class="page-section-head"
    >
      <PageSectionHeading
        :id="sectionId"
        :tag="tag"
        :name="name"
        :meta="meta"
        :meta-inline="metaInline"
        :visually-hidden="hideHeading"
      />
      <div class="page-section-end">
        <slot name="heading-end" />
      </div>
    </div>
    <PageSectionHeading
      v-else
      :id="sectionId"
      :tag="tag"
      :name="name"
      :meta="meta"
      :meta-inline="metaInline"
      :visually-hidden="hideHeading"
    />
    <span
      v-if="ruled"
      class="page-section-rule"
      aria-hidden="true"
    />
    <div class="page-section-body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useSlots } from "vue";
import PageSectionHeading from "./PageSectionHeading.vue";
import { useSectionEntry } from "./usePageSections";

const props = defineProps<{
  name: string;
  id?: string;
  navName?: string;
  label?: string;
  meta?: string;
  metaInline?: boolean;
  hideHeading?: boolean;
  ruled?: boolean;
}>();

const slots = useSlots();
const root = ref<HTMLElement | null>(null);
const { node, attach, detach } = useSectionEntry(props);

const level = computed(() => node.value?.level ?? 2);
const tag = computed(() => `h${level.value}`);
const sectionId = computed(() => node.value?.id);
const hasEnd = computed(() => Boolean(slots["heading-end"]));
const sectionClass = computed(() => [
  `page-section-level-${level.value}`,
  { "page-section-root": level.value === 2 },
]);

onMounted(() => attach(root.value));
onBeforeUnmount(detach);
</script>

<style src="./PageSection.css" />

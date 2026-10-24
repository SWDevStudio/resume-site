<template>
  <article
    ref="root"
    class="projects-card"
    :class="toneClass"
    :aria-labelledby="headingId"
  >
    <div class="projects-card-head">
      <span class="projects-card-label">
        <span class="projects-card-index">{{ project.index }}</span>
        <span>{{ project.subtitle }}</span>
      </span>
      <UiButton
        class="projects-card-live btn-ghost"
        :href="liveHref"
        :aria-disabled="liveDisabled"
        target="_blank"
      >
        {{ t("projects.page.card.liveSite") }}
        <UiIcon
          name="external"
          class="projects-card-live-icon"
        />
      </UiButton>
    </div>
    <component
      :is="tag"
      :id="headingId"
      class="projects-card-title"
    >
      <span
        class="projects-card-name"
        lang="en"
        data-atom-skip
      >
        {{ name }}
      </span>
      <span class="projects-card-headline">{{ project.headline }}</span>
    </component>
    <ProjectsCardCover
      :image="project.preview"
      :alt="project.previewAlt"
    />
    <p class="projects-card-text">{{ project.description }}</p>
    <ProjectsCardTags :tags="project.tags" />
    <UiButton
      class="btn-block btn-md"
      :class="buttonClass"
      :to="href"
    >
      {{ t("projects.page.card.readCase") }}
    </UiButton>
  </article>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Route } from "~/assets/const";
import { pageToneClass } from "~/components/pages/shared/pageTone";
import { useSectionEntry } from "~/components/pages/shared/PageSections/usePageSections";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import UiIcon from "~/components/ui/UiIcon/UiIcon.vue";
import type { ProjectView, Tone } from "#shared/types/catalog";
import ProjectsCardCover from "./ProjectsCardCover.vue";
import ProjectsCardTags from "./ProjectsCardTags.vue";

const BUTTON_CLASS: Record<Tone, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  accent: "btn-accent",
};

const props = defineProps<{
  project: ProjectView;
}>();

const { t } = useI18n();

const root = ref<HTMLElement | null>(null);
const entry = reactive({
  name: computed(() => `${props.project.index} · ${props.project.name}`),
  id: computed(() => props.project.id),
});
const { node, attach, detach } = useSectionEntry(entry);

const tag = computed(() => `h${node.value?.level ?? 2}`);
const headingId = computed(() => node.value?.id);
const toneClass = computed(() => pageToneClass(props.project.tone));
const buttonClass = computed(() => BUTTON_CLASS[props.project.tone]);
const name = computed(() => `${props.project.name}: `);
const href = computed(() => Route.project(props.project.id));
const liveHref = computed(() => props.project.url ?? null);
const liveDisabled = computed(() => (props.project.url ? undefined : "true"));

onMounted(() => attach(root.value));
onBeforeUnmount(detach);
</script>

<style src="./ProjectsCard.css" />

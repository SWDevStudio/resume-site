<template>
  <UiFolder
    class="home-projects-card"
    :class="tone.cardClass"
    :data="data"
  >
    <template #actions>
      <UiButton
        class="home-projects-live btn-link"
        :href="liveHref"
        :aria-disabled="liveDisabled"
        target="_blank"
      >
        {{ t("home.projects.liveSite") }}
        <UiIcon
          name="external"
          class="home-projects-live-icon"
        />
      </UiButton>
      <UiButton
        class="home-projects-read btn-sm"
        :class="tone.button"
        :to="href"
      >
        {{ t("home.projects.readCase") }}
      </UiButton>
    </template>
  </UiFolder>
</template>

<script setup lang="ts">
import { Route } from "~/assets/const";
import { resolveProjectImage } from "~/components/pages/shared/projectImage";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import UiIcon from "~/components/ui/UiIcon/UiIcon.vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { FolderData } from "~/components/ui/card/types";
import UiFolder from "~/components/ui/UiFolder/UiFolder.vue";
import type { ProjectView } from "~/assets/api/types/catalog";
import { projectTones } from "./projects";

const CARD_TAGS = 3;

const props = defineProps<{
  project: ProjectView;
}>();

const { t } = useI18n();

const tone = computed(() => projectTones[props.project.tone]);
const data = computed<FolderData>(() => ({
  index: props.project.index,
  title: props.project.name,
  subtitle: props.project.subtitle,
  text: props.project.description,
  tags: props.project.tags.slice(0, CARD_TAGS),
  image: resolveProjectImage(props.project.preview),
  imageAlt: props.project.previewAlt,
}));

const href = computed(() => Route.project(props.project.id));
const liveHref = computed(() => props.project.url ?? null);
const liveDisabled = computed(() => (props.project.url ? undefined : "true"));
</script>

<style src="./ProjectsCard.css" />

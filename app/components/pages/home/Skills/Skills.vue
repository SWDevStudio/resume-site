<template>
  <HomeSlide
    id="skills"
    class="home-skills"
    wide
  >
    <template #backdrop>
      <SkillsDecor />
    </template>

    <div class="home-skills-main">
      <div class="home-skills-head">
        <span class="home-skills-label">{{ t("home.skills.label") }}</span>
        <h2 class="home-skills-title">
          {{ t("home.skills.titleTop") }}
          <span class="home-skills-accent">{{ t("home.skills.titleAccent") }}</span>
        </h2>
      </div>

      <SkillsIntro :groups="groups" />

      <div class="home-skills-panels">
        <UiPanel
          v-for="panel in panels"
          :key="panel.key"
          class="home-skills-panel"
          :class="panel.class"
          :data="panel.data"
        >
          <SkillsTile
            v-for="tile in panel.tiles"
            :key="tile.skill"
            class="home-skills-tile"
            :class="tile.class"
            :skill-name="tile.skill"
            :swap-name="tile.swap"
            :phase="tile.phase"
            :steps="steps"
          />
        </UiPanel>
      </div>
    </div>

    <SkillsToolkit :skills="additional" />
  </HomeSlide>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { PanelData } from "~/components/ui/card/types";
import HomeSlide from "~/components/pages/home/HomeSlide/HomeSlide.vue";
import UiPanel from "~/components/ui/UiPanel/UiPanel.vue";
import type { SkillGroupView } from "~/assets/api/types/catalog";
import SkillsDecor from "./SkillsDecor.vue";
import SkillsIntro from "./SkillsIntro.vue";
import SkillsTile from "./SkillsTile.vue";
import SkillsToolkit from "./SkillsToolkit.vue";
import { buildSkillPanels } from "./skillPanels";

const props = defineProps<{
  groups: SkillGroupView[];
}>();

const { t } = useI18n();

const built = computed(() => buildSkillPanels(props.groups));
const steps = computed(() => built.value.steps);

const panels = computed(() =>
  built.value.panels.map((panel) => ({
    key: panel.key,
    class: panel.class,
    tiles: panel.tiles,
    data: { index: panel.index, title: t(`home.skills.${panel.key}`) } satisfies PanelData,
  })),
);

const additional = computed(
  () => props.groups.find((group) => group.id === "additional")?.skills ?? [],
);
</script>

<style src="./Skills.css" />

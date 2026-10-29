<template>
  <div class="home-skills-intro">
    <I18nT
      keypath="home.skills.description"
      tag="p"
      class="home-skills-description"
    >
      <template
        v-for="term in descriptionTerms"
        :key="term.slot"
        #[term.slot]
      >
        <span
          lang="en"
          data-atom-skip
        >
          {{ term.text }}
        </span>
      </template>
    </I18nT>
    <UiButton
      class="home-skills-action"
      type="button"
      aria-haspopup="dialog"
      @click="openAll"
    >
      <UiIcon
        name="arrow-right"
        class="home-skills-action-icon"
      />
      {{ t("home.skills.all") }}
    </UiButton>
    <SkillsAll
      v-model="allOpen"
      :groups="groups"
    />
  </div>
</template>

<script setup lang="ts">
import { useToggle } from "@vueuse/core";
import { I18nT, useI18n } from "vue-i18n";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import UiIcon from "~/components/ui/UiIcon/UiIcon.vue";
import type { SkillGroupView } from "~/assets/api/types/catalog";
import { $metrika } from "~/assets/metrika";
import SkillsAll from "./SkillsAll.vue";

defineProps<{
  groups: SkillGroupView[];
}>();

const { t } = useI18n();

const descriptionTerms = [
  { slot: "vue", text: "Vue.js" },
  { slot: "nest", text: "NestJS" },
  { slot: "tauri", text: "Tauri" },
  { slot: "rust", text: "Rust" },
];

const [allOpen, toggleAll] = useToggle(false);

function openAll() {
  toggleAll(true);
  $metrika.skills.openAll();
}
</script>

<style src="./SkillsIntro.css" />

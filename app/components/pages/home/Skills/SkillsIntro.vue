<template>
  <div class="home-skills-intro">
    <p class="home-skills-description">{{ t("home.skills.description") }}</p>
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
import { useI18n } from "vue-i18n";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import UiIcon from "~/components/ui/UiIcon/UiIcon.vue";
import type { SkillGroupView } from "~/assets/api/types/catalog";
import { $metrika } from "~/assets/metrika";
import SkillsAll from "./SkillsAll.vue";

defineProps<{
  groups: SkillGroupView[];
}>();

const { t } = useI18n();

const [allOpen, toggleAll] = useToggle(false);

function openAll() {
  toggleAll(true);
  $metrika.skills.openAll();
}
</script>

<style src="./SkillsIntro.css" />

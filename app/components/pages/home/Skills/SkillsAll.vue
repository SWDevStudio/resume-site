<template>
  <UiModal
    v-model="open"
    class="home-skills-all"
    :label="t('home.skills.label')"
    :title="t('home.skills.modal.title')"
    :accent="t('home.skills.modal.accent')"
    :description="t('home.skills.modal.description')"
    :close-label="t('home.skills.modal.close')"
    module="skills"
  >
    <div class="home-skills-all-groups">
      <SkillsAllGroup
        v-for="entry in entries"
        :key="entry.group.id"
        :group="entry.group"
        :index="entry.index"
      />
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import UiModal from "~/components/ui/UiModal/UiModal.vue";
import type { SkillGroupView } from "#shared/types/catalog";
import SkillsAllGroup from "./SkillsAllGroup.vue";

const props = defineProps<{
  groups: SkillGroupView[];
}>();

const open = defineModel<boolean>({ default: false });

const { t } = useI18n();

const entries = computed(() =>
  props.groups.map((group, index) => ({
    group,
    index: String(index + 1).padStart(2, "0"),
  })),
);
</script>

<style src="./SkillsAll.css" />

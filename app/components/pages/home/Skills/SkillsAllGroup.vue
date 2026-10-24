<template>
  <section
    class="home-skills-all-group"
    :aria-labelledby="titleId"
  >
    <h3
      :id="titleId"
      class="home-skills-all-title"
    >
      <span
        class="home-skills-all-index"
        aria-hidden="true"
      >
        {{ index }}
      </span>
      <span
        class="home-skills-all-name"
        :lang="lang"
        :data-atom-skip="skip"
      >
        {{ group.name }}
      </span>
      <span class="home-skills-all-count">{{ group.skills.length }}</span>
    </h3>
    <ul class="home-skills-all-list">
      <li
        v-for="skill in group.skills"
        :key="skill.id"
        class="home-skills-all-item"
      >
        <UiBadge
          class="home-skills-all-chip badge-ghost"
          :lang="lang"
          :data-atom-skip="skip"
        >
          {{ skill.name }}
        </UiBadge>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, useId } from "vue";
import UiBadge from "~/components/ui/UiBadge/UiBadge.vue";
import type { SkillGroupView } from "~/assets/api/types/catalog";

const props = defineProps<{
  group: SkillGroupView;
  index: string;
}>();

const titleId = useId();

const lang = computed(() => (props.group.terms ? "en" : undefined));
const skip = computed(() => (props.group.terms ? "" : undefined));
</script>

<style src="./SkillsAllGroup.css" />

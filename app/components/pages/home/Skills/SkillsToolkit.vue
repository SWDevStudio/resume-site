<template>
  <div
    class="home-skills-band"
    role="group"
    :aria-label="t('home.skills.toolkit')"
  >
    <div class="home-skills-band-inner container container-wide">
      <span
        class="home-skills-band-label"
        aria-hidden="true"
      >
        {{ t("home.skills.toolkit") }}
      </span>
      <p class="home-skills-toolkit">
        <span class="sr-only">{{ toolkitLabel }}</span>
        <span aria-hidden="true">
          <span class="home-skills-prompt">&gt;</span>
          <template
            v-for="item in toolkitStatic"
            :key="item"
          >
            <span class="home-skills-static">
              <span>{{ item }}</span>
              <span class="home-skills-separator">·</span>
            </span>
            <wbr />
          </template>
          <span class="home-skills-typing">
            <span
              v-for="item in toolkitTyped"
              :key="item.key"
              class="home-skills-type"
              :class="item.class"
              :style="item.style"
            >
              {{ item.text }}
            </span>
            <span class="home-skills-cursor" />
          </span>
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { SkillView } from "~/assets/api/types/catalog";
import { buildToolkit } from "./toolkit";

const props = defineProps<{
  skills: SkillView[];
}>();

const { t } = useI18n();

const toolkit = computed(() => buildToolkit(props.skills));
const toolkitStatic = computed(() => toolkit.value.static);
const toolkitTyped = computed(() => toolkit.value.typed);
const toolkitLabel = computed(() => toolkit.value.label);
</script>

<style src="./SkillsToolkit.css" />

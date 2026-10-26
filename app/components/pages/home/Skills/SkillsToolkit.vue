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
          <span
            ref="typing"
            class="home-skills-typing"
            :class="typingClass"
            :style="toolkitStyle"
          >
            <span class="home-skills-type-window">
              <span class="home-skills-type-strip">
                <span
                  v-for="item in toolkitTyped"
                  :key="item.key"
                  class="home-skills-type"
                  :class="item.class"
                >
                  {{ item.text }}
                </span>
              </span>
            </span>
            <span class="home-skills-cursor" />
          </span>
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import type { SkillView } from "~/assets/api/types/catalog";
import { useDecorMotion } from "~/composables/useDecorMotion";
import { buildToolkit } from "./toolkit";

const props = defineProps<{
  skills: SkillView[];
}>();

const { t } = useI18n();

const toolkit = computed(() => buildToolkit(props.skills));
const toolkitStatic = computed(() => toolkit.value.static);
const toolkitTyped = computed(() => toolkit.value.typed);
const toolkitLabel = computed(() => toolkit.value.label);
const toolkitStyle = computed(() => toolkit.value.style);

const typingLine = useTemplateRef<HTMLElement>("typing");
const { paused } = useDecorMotion(typingLine);
const typingClass = computed(() => ({ "decor-paused": paused.value }));
</script>

<style src="./SkillsToolkit.css" />

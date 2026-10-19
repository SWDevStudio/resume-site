<template>
  <section class="flex flex-col gap-12">
    <h1 class="font-head text-5xl">Плитки навыков</h1>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Навыки</h2>
      <div class="flex flex-wrap items-start gap-x-6 gap-y-10">
        <figure
          v-for="skill in skills"
          :key="skill"
          class="flex flex-col items-start gap-3"
        >
          <UiSkillTile :skill-name="skill" />
          <figcaption>
            <code class="text-xs text-brand-ink">skill-tile · SkillTile.{{ skill }}</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Смена навыка</h2>
      <figure class="flex flex-col items-start gap-6">
        <UiSkillTile :skill-name="current" />
        <div class="flex flex-wrap gap-3">
          <UiButton
            class="btn-primary btn-sm"
            type="button"
            @click="next"
          >
            Следующий
          </UiButton>
          <UiButton
            v-for="skill in skills"
            :key="skill"
            class="btn-xs"
            :class="{ 'btn-accent': skill === current }"
            type="button"
            @click="current = skill"
          >
            {{ SKILL_TILE_META[skill].label }}
          </UiButton>
        </div>
        <figcaption>
          <code class="text-xs text-brand-ink">
            skill-tile · :skill-name="SkillTile.{{ current }}"
          </code>
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { definePageMeta } from "#imports";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import UiSkillTile from "~/components/ui/UiSkillTile/UiSkillTile.vue";
import { SKILL_TILE_META, SkillTile } from "~/components/ui/UiSkillTile/skillTile";

definePageMeta({ title: "Плитки навыков" });

const skills = Object.values(SkillTile);
const current = ref(SkillTile.React);

function next() {
  current.value = skills[(skills.indexOf(current.value) + 1) % skills.length]!;
}
</script>

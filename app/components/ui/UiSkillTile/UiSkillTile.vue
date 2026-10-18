<template>
  <div class="skill-tile">
    <span
      class="skill-tile-frame"
      aria-hidden="true"
    />
    <span
      class="skill-tile-deco"
      aria-hidden="true"
    />
    <span
      v-for="layer in layers"
      :key="layer.id"
      class="skill-tile-layer"
      :class="{
        'skill-tile-enter': layer.phase === 'enter',
        'skill-tile-leave': layer.phase === 'leave',
        'skill-tile-full': SKILL_TILE_META[layer.skill].full,
        'skill-tile-mono': SKILL_TILE_META[layer.skill].mono,
      }"
      :aria-hidden="layer.phase === 'leave' ? 'true' : undefined"
      @animationend.self="finish(layer)"
    >
      <span class="skill-tile-badge">
        <img
          class="skill-tile-icon"
          :src="SKILL_TILE_META[layer.skill].icon"
          alt=""
        />
      </span>
      <span class="skill-tile-label">{{ SKILL_TILE_META[layer.skill].label }}</span>
    </span>
    <span
      v-if="swapping"
      :key="`fx-${lastId}`"
      class="skill-tile-fx"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { SKILL_TILE_META, type SkillTile } from "./skillTile";

interface Layer {
  id: number;
  skill: SkillTile;
  phase: "idle" | "enter" | "leave";
}

const props = defineProps<{
  skillName: SkillTile;
}>();

let lastId = 0;
const layers = ref<Layer[]>([{ id: lastId, skill: props.skillName, phase: "idle" }]);
const swapping = computed(() => layers.value.some((layer) => layer.phase === "leave"));

watch(
  () => props.skillName,
  (skill) => {
    lastId += 1;
    layers.value = [
      ...layers.value
        .filter((layer) => layer.phase !== "leave")
        .map((layer): Layer => ({ ...layer, phase: "leave" })),
      { id: lastId, skill, phase: "enter" },
    ];
  },
);

function finish(layer: Layer) {
  if (layer.phase === "leave") {
    layers.value = layers.value.filter((item) => item.id !== layer.id);
  }
}
</script>

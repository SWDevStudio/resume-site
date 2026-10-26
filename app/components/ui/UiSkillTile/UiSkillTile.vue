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
        'skill-tile-full': layer.full,
        'skill-tile-mono': layer.mono,
        'skill-tile-text': layer.textOnly,
      }"
      :aria-hidden="layer.phase === 'leave' ? 'true' : undefined"
      @animationend.self="finish(layer)"
    >
      <span
        v-if="layer.icon"
        class="skill-tile-badge"
      >
        <img
          class="skill-tile-icon"
          :src="layer.icon"
          alt=""
          loading="lazy"
          decoding="async"
        />
      </span>
      <span class="skill-tile-label">{{ layer.label }}</span>
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

interface TileContent {
  label: string;
  icon?: string;
  full?: boolean;
  mono?: boolean;
  textOnly: boolean;
}

interface Layer extends TileContent {
  id: number;
  phase: "idle" | "enter" | "leave";
}

const props = defineProps<{
  skillName?: SkillTile;
  label?: string;
}>();

const content = computed<TileContent>(() => {
  const meta = props.skillName ? SKILL_TILE_META[props.skillName] : undefined;
  return {
    ...meta,
    label: props.label ?? meta?.label ?? "",
    textOnly: !meta?.icon,
  };
});

let lastId = 0;
const layers = ref<Layer[]>([{ id: lastId, ...content.value, phase: "idle" }]);
const swapping = computed(() => layers.value.some((layer) => layer.phase === "leave"));

watch(content, (tile) => {
  lastId += 1;
  layers.value = [
    ...layers.value
      .filter((layer) => layer.phase !== "leave")
      .map((layer): Layer => ({ ...layer, phase: "leave" })),
    { id: lastId, ...tile, phase: "enter" },
  ];
});

function finish(layer: Layer) {
  if (layer.phase === "leave") {
    layers.value = layers.value.filter((item) => item.id !== layer.id);
  }
}
</script>

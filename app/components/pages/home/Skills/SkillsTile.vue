<template>
  <UiSkillTile :skill-name="skill" />
</template>

<script setup lang="ts">
import UiSkillTile from "~/components/ui/UiSkillTile/UiSkillTile.vue";
import type { SkillTile } from "~/components/ui/UiSkillTile/skillTile";
import { useSkillSwap } from "./useSkillSwap";

const props = defineProps<{
  skillName: SkillTile;
  swapName: SkillTile;
  phase: number;
  steps: number;
}>();

const { skill } = useSkillSwap(props.skillName, props.swapName, props.phase, props.steps);
</script>

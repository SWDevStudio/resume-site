<template>
  <article class="resume-project">
    <div class="resume-project-head">
      <h3 class="resume-project-title">
        <span class="resume-project-index">{{ project.index }}</span>
        <span
          class="resume-project-name"
          lang="en"
          data-atom-skip
        >
          {{ name }}
        </span>
      </h3>
      <span class="resume-project-link">
        <ResumeLink
          :href="project.link.href"
          :label="project.link.label"
        />
      </span>
    </div>
    <span class="resume-project-subtitle">{{ project.subtitle }}</span>
    <p class="resume-text">{{ project.description }}</p>
    <ResumeList
      class="resume-list-tight"
      :items="bullets"
    />
    <ul class="resume-project-tags">
      <li
        v-for="tag in project.tags"
        :key="tag"
        class="resume-project-tag"
      >
        {{ tag }}
      </li>
    </ul>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ResumeLink from "./ResumeLink.vue";
import ResumeList from "./ResumeList.vue";
import type { ResumeProject } from "#shared/types/resume";

const props = defineProps<{
  project: ResumeProject;
}>();

const name = computed(() => ` ${props.project.name}`);
const bullets = computed(() => [props.project.role, props.project.result]);
</script>

<style src="./ResumeProject.css" />

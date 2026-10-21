<template>
  <p
    v-if="job.field"
    class="resume-text"
  >
    {{ job.field }}
    <template v-if="site">
      ·
      <ResumeLink
        :href="site"
        :label="siteLabel"
      />
    </template>
  </p>
  <p class="resume-text">
    <b class="resume-list-lead">{{ labels.team }}:</b>
    {{ job.team }}
  </p>
  <div
    v-if="job.projects.length"
    class="resume-block"
  >
    <h4 class="resume-block-title">{{ labels.projects }}</h4>
    <ResumeList
      class="resume-list-tight"
      :items="job.projects"
    />
  </div>
  <div class="resume-block">
    <h4 class="resume-block-title">{{ labels.responsibilities }}</h4>
    <ResumeList
      class="resume-list-tight"
      :items="job.responsibilities"
    />
  </div>
  <div class="resume-block">
    <h4 class="resume-block-title">{{ labels.achievements }}</h4>
    <ResumeList
      class="resume-list-tight"
      :items="job.achievements"
    />
  </div>
  <div class="resume-block">
    <h4 class="resume-block-title">{{ labels.stack }}</h4>
    <p class="resume-text">
      <span
        lang="en"
        data-atom-skip
      >
        {{ stack }}
      </span>
      <span v-if="practices">{{ practices }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ResumeExperienceLabels, ResumeJob } from "#shared/types/resume";
import ResumeLink from "./ResumeLink.vue";
import ResumeList from "./ResumeList.vue";

const props = defineProps<{
  job: ResumeJob;
  labels: ResumeExperienceLabels;
}>();

const site = computed(() => (props.job.site ? `https://${props.job.site}` : undefined));
const siteLabel = computed(() => props.job.site ?? "");
const stack = computed(() => props.job.stack.join(", "));
const practices = computed(() =>
  props.job.practices.length ? `, ${props.job.practices.join(", ")}` : "",
);
</script>

<style src="./ResumeJobDetails.css" />

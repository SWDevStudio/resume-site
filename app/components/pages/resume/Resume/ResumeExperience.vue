<template>
  <p class="resume-text">{{ experience.total }}</p>
  <div class="resume-experience">
    <PageSection
      v-for="job in jobs"
      :id="job.id"
      :key="job.id"
      :name="job.name"
      :meta="job.meta"
    >
      <ResumeJobDetails
        :job="job"
        :labels="experience.labels"
      />
    </PageSection>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import PageSection from "~/components/pages/shared/PageSections/PageSection.vue";
import type { ResumeData } from "#shared/types/resume";
import ResumeJobDetails from "./ResumeJobDetails.vue";

const props = defineProps<{
  experience: ResumeData["experience"];
}>();

const jobs = computed(() =>
  props.experience.jobs.map((job) => ({
    ...job,
    name: `${job.company} — ${job.title}`,
    meta: `${job.period} · ${job.city}`,
  })),
);
</script>

<style src="./ResumeExperience.css" />

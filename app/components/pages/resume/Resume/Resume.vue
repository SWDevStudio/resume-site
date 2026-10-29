<template>
  <PageSections
    class="resume"
    :nav-title="t('resume.nav')"
    count-roots
  >
    <ResumeHeader :profile="data.profile" />
    <div class="resume-sections">
      <PageSection
        :id="data.summary.id"
        :name="data.summary.name"
        :label="data.summary.label"
        ruled
      >
        <ResumeParagraphs :paragraphs="data.summary.paragraphs" />
      </PageSection>
      <PageSection
        :id="data.skills.id"
        :name="data.skills.name"
        :label="data.skills.label"
        ruled
      >
        <ResumeSkills :skills="data.skills" />
      </PageSection>
      <PageSection
        :id="data.projects.id"
        :name="data.projects.name"
        :label="data.projects.label"
        ruled
      >
        <ResumeProjects :projects="data.projects" />
      </PageSection>
      <PageSection
        :id="data.experience.id"
        :name="data.experience.name"
        :label="data.experience.label"
        ruled
      >
        <ResumeExperience :experience="data.experience" />
      </PageSection>
      <PageSection
        v-if="hasCases"
        :id="data.cases.id"
        :name="data.cases.name"
        :label="data.cases.label"
        ruled
      >
        <ResumeCases :cases="data.cases" />
      </PageSection>
      <PageSection
        :id="data.education.id"
        :name="data.education.name"
        :label="data.education.label"
        ruled
      >
        <ResumeList
          class="resume-list-loose"
          :items="data.education.items"
        />
      </PageSection>
      <PageSection
        :id="data.additional.id"
        :name="data.additional.name"
        :label="data.additional.label"
        ruled
      >
        <ResumeList
          class="resume-list-loose"
          :items="data.additional.items"
        />
      </PageSection>
      <PageSection
        :id="data.ai.id"
        :name="data.ai.name"
        :label="data.ai.label"
        ruled
      >
        <ResumeParagraphs :paragraphs="data.ai.paragraphs" />
        <p
          v-if="aiLink"
          class="resume-text"
        >
          <ResumeLink
            :href="aiLink.href"
            :label="aiLink.label"
          />
        </p>
      </PageSection>
      <PageSection
        :id="data.references.id"
        :name="data.references.name"
        :label="data.references.label"
        ruled
      >
        <ResumeList
          class="resume-list-loose"
          :items="data.references.items"
        />
      </PageSection>
    </div>
    <ResumeFooter :copyright="data.footer.copyright" />
  </PageSections>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import PageSection from "~/components/pages/shared/PageSections/PageSection.vue";
import PageSections from "~/components/pages/shared/PageSections/PageSections.vue";
import type { ResumeData } from "~/assets/api/types/resume";
import ResumeCases from "./ResumeCases.vue";
import ResumeExperience from "./ResumeExperience.vue";
import ResumeFooter from "./ResumeFooter.vue";
import ResumeHeader from "./ResumeHeader.vue";
import ResumeLink from "./ResumeLink.vue";
import ResumeList from "./ResumeList.vue";
import ResumeParagraphs from "./ResumeParagraphs.vue";
import ResumeProjects from "./ResumeProjects.vue";
import ResumeSkills from "./ResumeSkills.vue";

const props = defineProps<{
  data: ResumeData;
}>();

const { t } = useI18n();

const hasCases = computed(() => props.data.cases.items.length > 0);
const aiLink = computed(() => props.data.ai.link);
</script>

<style src="./Resume.css" />

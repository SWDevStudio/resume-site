<template>
  <div class="home">
    <Hero />
    <About />
    <Skills
      v-if="skillGroups"
      :groups="skillGroups"
      data-atom-async="home-skills"
    />
    <Why />
    <Projects
      v-if="projects"
      :projects="favoriteProjects"
      data-atom-async="home-projects"
    />
    <Contact />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAsyncData, useSeoMeta } from "#imports";
import { useI18n } from "vue-i18n";
import { $api } from "~/assets/api";
import About from "~/components/pages/home/About/About.vue";
import Contact from "~/components/pages/home/Contact/Contact.vue";
import Hero from "~/components/pages/home/Hero/Hero.vue";
import Projects from "~/components/pages/home/Projects/Projects.vue";
import Skills from "~/components/pages/home/Skills/Skills.vue";
import Why from "~/components/pages/home/Why/Why.vue";

const { t } = useI18n();

const title = () => `${t("home.about.name")} — Fullstack developer`;

useSeoMeta({ title, ogTitle: title });

const { data: skillGroups } = await useAsyncData("home-skills", () => $api.skills.fetchGroups());
const { data: projects } = await useAsyncData("home-projects", () => $api.projects.fetchList());
const favoriteProjects = computed(
  () => projects.value?.filter((project) => project.isFavorite) ?? [],
);
</script>

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
      :projects="projects"
      data-atom-async="home-projects"
    />
    <Contact />
  </div>
</template>

<script setup lang="ts">
import { useAsyncData, useSeoMeta } from "#imports";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { $api } from "~/assets/api";
import { Route } from "~/assets/const";
import About from "~/components/pages/home/About/About.vue";
import Contact from "~/components/pages/home/Contact/Contact.vue";
import Hero from "~/components/pages/home/Hero/Hero.vue";
import Projects from "~/components/pages/home/Projects/Projects.vue";
import Skills from "~/components/pages/home/Skills/Skills.vue";
import Why from "~/components/pages/home/Why/Why.vue";
import { useLocale } from "~/composables/useLocale";
import { profilePageNode, useSiteUrls, useStructuredData } from "~/composables/useStructuredData";

const { t } = useI18n();
const { locale } = useLocale();
const site = useSiteUrls();

const { data: person } = await useAsyncData("home-person", () => $api.profile.fetchPerson());
const { data: skillGroups } = await useAsyncData("home-skills", () => $api.skills.fetchGroups());
const { data: projects } = await useAsyncData("home-projects", () => $api.projects.fetchList());

const name = computed(() => person.value?.name ?? "");
const title = () => t("seo.home.title", { name: name.value });

useSeoMeta({ title, ogTitle: title });

useStructuredData(() =>
  person.value ? [profilePageNode(person.value, site, site.page(Route.home), locale.value)] : [],
);
</script>

<template>
  <div
    id="intro"
    ref="root"
    class="projects-intro"
    role="note"
  >
    <div class="projects-intro-box">
      <span
        class="projects-intro-icon"
        aria-hidden="true"
      />
      <div class="projects-intro-body">
        <span class="projects-intro-title">{{ t("projects.page.intro.title") }}</span>
        <p class="projects-intro-text">{{ t("projects.page.intro.text") }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useSectionEntry } from "~/components/pages/shared/PageSections/usePageSections";

const { t } = useI18n();

const root = ref<HTMLElement | null>(null);
const entry = reactive({
  name: computed(() => t("projects.page.nav.intro")),
  id: "intro",
});
const { attach, detach } = useSectionEntry(entry);

onMounted(() => attach(root.value));
onBeforeUnmount(detach);
</script>

<style src="./ProjectsIntro.css" />

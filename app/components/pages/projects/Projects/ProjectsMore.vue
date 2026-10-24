<template>
  <p
    id="more"
    ref="root"
    class="projects-more"
  >
    {{ t("projects.page.more") }}
  </p>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useSectionEntry } from "~/components/pages/shared/PageSections/usePageSections";

const { t } = useI18n();

const root = ref<HTMLElement | null>(null);
const entry = reactive({
  name: computed(() => t("projects.page.nav.more")),
  id: "more",
});
const { attach, detach } = useSectionEntry(entry);

onMounted(() => attach(root.value));
onBeforeUnmount(detach);
</script>

<style src="./ProjectsMore.css" />

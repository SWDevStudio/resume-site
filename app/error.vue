<template>
  <div class="min-h-screen bg-base-100">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <ErrorPage
        :status="status"
        :kind="kind"
      />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { NuxtLayout, NuxtRouteAnnouncer } from "#components";
import type { NuxtError } from "#app";
import { useSeoMeta } from "#imports";
import { useI18n } from "vue-i18n";
import ErrorPage from "~/components/pages/error/ErrorPage/ErrorPage.vue";
import { useSiteHead } from "~/composables/useSiteHead";

const NOT_FOUND = 404;
const FALLBACK_STATUS = 500;

const props = defineProps<{
  error: NuxtError;
}>();

const status = Number(props.error?.status ?? props.error?.statusCode ?? FALLBACK_STATUS);
const kind = status === NOT_FOUND ? "notFound" : "generic";

const { t } = useI18n();

const title = () => `${t(`error.${kind}.title`)} ${t(`error.${kind}.titleAccent`)}`;
const description = () => t(`error.${kind}.text`);

useSiteHead();
useSeoMeta({ title, description, ogTitle: title, ogDescription: description, robots: "noindex" });
</script>

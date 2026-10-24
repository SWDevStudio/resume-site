<template>
  <section class="flex flex-col gap-12">
    <h1 class="font-head text-5xl">Карточки</h1>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Карточка проекта</h2>
      <div class="flex flex-wrap items-start gap-x-12 gap-y-10">
        <figure class="flex w-91.25 flex-col gap-3">
          <UiFolder
            class="min-h-142.5"
            :data="folder"
          >
            <template #actions>
              <a
                class="btn btn-link"
                href="#"
              >
                Read case
                <svg
                  class="h-3.25 w-4 text-primary-ink"
                  viewBox="0 0 18 14"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  aria-hidden="true"
                >
                  <path d="M5 2L1 7L5 12M13 2L17 7L13 12M10.5 1L7.5 13" />
                </svg>
              </a>
              <UiButton
                class="btn-primary btn-sm"
                type="button"
              >
                LIVE SITE
              </UiButton>
            </template>
          </UiFolder>
          <figcaption>
            <code class="text-xs text-brand-ink">UiFolder</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Панель навыков</h2>
      <div class="flex flex-wrap items-start gap-x-12 gap-y-10">
        <figure class="flex w-101 flex-col gap-3">
          <UiPanel :data="panel">
            <UiSkillTile
              v-for="skill in skills"
              :key="skill"
              :skill-name="skill"
            />
          </UiPanel>
          <figcaption>
            <code class="text-xs text-brand-ink">UiPanel</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Карточка преимущества</h2>
      <div class="flex flex-wrap items-start gap-x-12 gap-y-10">
        <figure class="w-101">
          <UiFeature :data="feature" />
          <figcaption class="mt-3">
            <code class="text-xs text-brand-ink">UiFeature</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Картинка в карточке</h2>
      <div class="flex flex-wrap items-start gap-x-12 gap-y-10">
        <figure class="flex w-78.25 flex-col gap-3">
          <UiCardMedia
            :src="sample"
            alt="Qwixit"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">UiCardMedia :src</code>
          </figcaption>
        </figure>
        <figure class="flex w-78.25 flex-col gap-3">
          <UiCardMedia>
            <div class="grid size-full place-items-center bg-base-300 text-sm">Любая разметка</div>
          </UiCardMedia>
          <figcaption>
            <code class="text-xs text-brand-ink">UiCardMedia slot</code>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { definePageMeta } from "#imports";
import type { FeatureData, FolderData, PanelData } from "~/components/ui/card/types";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import UiCardMedia from "~/components/ui/card/UiCardMedia/UiCardMedia.vue";
import sample from "~/components/ui/card/UiCardMedia/media/sample.svg";
import UiFeature from "~/components/ui/UiFeature/UiFeature.vue";
import UiFolder from "~/components/ui/UiFolder/UiFolder.vue";
import UiPanel from "~/components/ui/UiPanel/UiPanel.vue";
import UiSkillTile from "~/components/ui/UiSkillTile/UiSkillTile.vue";
import { SkillTile } from "~/components/ui/UiSkillTile/skillTile";

definePageMeta({ title: "Карточки" });

const folder: FolderData = {
  index: "01",
  title: "Qwixit",
  subtitle: "FASHION MARKETPLACE · US DELIVERY",
  text: "E-commerce platform for clothing, footwear and accessories from global brands.",
  tags: ["E-commerce", "Full-Stack", "Payments"],
  image: sample,
  imageAlt: "Qwixit",
};
const panel: PanelData = { index: "01", title: "Frontend" };
const feature: FeatureData = {
  index: "01",
  title: "Autonomy & business focus",
  label: "michael.dev",
  prompt:
    "I build digital products end to end with my own hands and ship them around their competitive advantages.",
};
const skills = [SkillTile.React, SkillTile.NextJs, SkillTile.Vue];
</script>

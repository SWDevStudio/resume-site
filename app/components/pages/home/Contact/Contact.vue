<template>
  <HomeSlide
    id="contact"
    class="home-contact"
  >
    <template #backdrop>
      <ContactDecor />
    </template>

    <div class="home-contact-main">
      <div class="home-contact-head">
        <span class="home-contact-label">{{ t("home.contact.label") }}</span>
        <h2 class="home-contact-title">
          {{ t("home.contact.titleTop") }}
          <span class="home-contact-accent">{{ t("home.contact.titleAccent") }}</span>
        </h2>
      </div>

      <div class="home-contact-columns">
        <ContactInfo />
        <ContactForm
          :key="formKey"
          :hydrate-on-visible="FORM_HYDRATION"
          @hydrated="onFormHydrated"
        />
      </div>

      <ContactProjects />
    </div>
  </HomeSlide>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useToggle } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import { defineLazyHydrationComponent } from "#imports";
import HomeSlide from "~/components/pages/home/HomeSlide/HomeSlide.vue";
import ContactDecor from "./ContactDecor.vue";
import ContactInfo from "./ContactInfo.vue";
import ContactProjects from "./ContactProjects.vue";

const ContactForm = defineLazyHydrationComponent(
  "visible",
  () => import("~/components/pages/home/Contact/ContactForm.vue"),
);

const FORM_HYDRATION: IntersectionObserverInit = { rootMargin: "50% 0px" };

const { t, locale } = useI18n();

const [formHydrated, toggleFormHydrated] = useToggle(false);
const formKey = ref(locale.value);

watch(locale, (value) => {
  if (!formHydrated.value) formKey.value = value;
});

function onFormHydrated() {
  toggleFormHydrated(true);
}
</script>

<style src="./Contact.css" />

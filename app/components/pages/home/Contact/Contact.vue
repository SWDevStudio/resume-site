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
        <ContactForm />
      </div>

      <ContactProjects />
    </div>
  </HomeSlide>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import HomeSlide from "~/components/pages/home/HomeSlide/HomeSlide.vue";
import ContactDecor from "./ContactDecor.vue";
import ContactForm from "./ContactForm.vue";
import ContactInfo from "./ContactInfo.vue";
import ContactProjects from "./ContactProjects.vue";

const { t } = useI18n();
</script>

<style src="./Contact.css" />

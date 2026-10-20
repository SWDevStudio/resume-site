<template>
  <div class="home-contact-info">
    <h3 class="home-contact-subtitle">{{ t("home.contact.info.title") }}</h3>
    <p class="home-contact-text">{{ t("home.contact.info.text") }}</p>

    <ul class="home-contact-channels">
      <li
        v-for="channel in items"
        :key="channel.key"
      >
        <a
          class="home-contact-channel"
          :href="channel.href"
          v-bind="channel.attrs"
        >
          <span
            class="home-contact-icon btn"
            aria-hidden="true"
          >
            <span class="btn-frame" />
            <UiIcon
              :name="channel.key"
              class="home-contact-icon-image"
            />
          </span>
          <span class="home-contact-channel-text">
            <span class="home-contact-channel-label">{{ channel.label }}</span>
            <span class="home-contact-channel-value">{{ channel.value }}</span>
          </span>
        </a>
      </li>
    </ul>

    <div class="home-contact-online">
      <span class="home-contact-channel-label">{{ t("home.contact.info.online") }}</span>
      <ContactSocials />
    </div>
  </div>
</template>

<script setup lang="ts">
import UiIcon from "~/components/ui/UiIcon/UiIcon.vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { channels } from "./contactChannels";
import ContactSocials from "./ContactSocials.vue";

const { t } = useI18n();

const items = computed(() =>
  channels.map((channel) => ({
    ...channel,
    label: t(`home.contact.channels.${channel.key}`),
  })),
);
</script>

<style src="./ContactInfo.css" />

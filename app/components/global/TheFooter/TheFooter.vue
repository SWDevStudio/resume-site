<template>
  <footer
    id="footer"
    class="the-footer"
  >
    <TheFooterDecor />

    <div class="the-footer-body container">
      <div class="the-footer-main">
        <div class="the-footer-row">
          <TheFooterBrand />
          <TheFooterNav />
          <ContactSocials class="the-footer-socials" />
        </div>

        <div
          class="the-footer-rule"
          aria-hidden="true"
        />

        <div class="the-footer-bottom">
          <span class="the-footer-copyright">{{ t("footer.copyright", { year }) }}</span>
          <TheFooterTop />
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import ContactSocials from "~/components/pages/home/Contact/ContactSocials.vue";
import TheFooterBrand from "./TheFooterBrand.vue";
import TheFooterDecor from "./TheFooterDecor.vue";
import TheFooterNav from "./TheFooterNav.vue";
import TheFooterTop from "./TheFooterTop.vue";

const { t } = useI18n();

const year = new Date().getFullYear();
</script>

<style src="./TheFooter.css" />

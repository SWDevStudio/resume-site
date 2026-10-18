import { computed, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { refreshNuxtData, useState } from "#imports";
import { LOCALES, type Locale } from "~/assets/const";
import { runAtomSwitch } from "~/utils";

export function useLocale() {
  const { locale: current, setLocale: switchRoute } = useI18n();
  const locale = computed(() => current.value as Locale);
  const switching = useState("atom-locale-switching", () => false);

  async function setLocale(target: Locale) {
    if (target === locale.value || switching.value) return;
    switching.value = true;
    try {
      await runAtomSwitch({
        now: async () => {
          await switchRoute(target);
          await nextTick();
        },
        refresh: async (key) => {
          await (key ? refreshNuxtData(key) : refreshNuxtData());
          await nextTick();
        },
      });
    } finally {
      switching.value = false;
    }
  }

  return {
    locale,
    locales: LOCALES,
    switching,
    setLocale,
  };
}

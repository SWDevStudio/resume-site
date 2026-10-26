import { computed, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { refreshNuxtData, useState } from "#imports";
import { LOCALES, type Locale } from "~/assets/const";

type AtomSwitch = typeof import("~/utils/atomMorph").runAtomSwitch;
type AtomSwitchSteps = Parameters<AtomSwitch>[0];

let atomSwitch: Promise<AtomSwitch> | undefined;

function loadAtomSwitch() {
  atomSwitch ??= import("~/utils/atomMorph")
    .then((module) => module.runAtomSwitch)
    .catch((error: unknown) => {
      atomSwitch = undefined;
      throw error;
    });
  return atomSwitch;
}

async function switchInstantly({ now, refresh }: AtomSwitchSteps) {
  await now();
  await refresh?.();
}

export function useLocale() {
  const { locale: current, setLocale: switchRoute } = useI18n();
  const locale = computed(() => current.value as Locale);
  const switching = useState("atom-locale-switching", () => false);

  function prepare() {
    loadAtomSwitch().catch(() => undefined);
  }

  async function setLocale(target: Locale) {
    if (target === locale.value || switching.value) return;
    switching.value = true;
    try {
      const run = await loadAtomSwitch().catch(() => switchInstantly);
      await run({
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
    prepare,
    setLocale,
  };
}

import type { RouteLocationNormalizedLoaded } from "vue-router";
import { defineNuxtPlugin, useRouter } from "#imports";
import { LOCALES } from "~/assets/const";

function interpolate(path: string, params: RouteLocationNormalizedLoaded["params"]): string {
  return path.replace(/:(\w+)(?:\([^)]*\))?[?*+]?/g, (_, name: string) => {
    const value = params[name];
    return Array.isArray(value) ? value.join("/") : String(value ?? "");
  });
}

export default defineNuxtPlugin(() => {
  useRouter()
    .getRoutes()
    .forEach((record) => {
      if (record.meta.key !== undefined) return;
      record.meta.key = (route) => {
        const path = interpolate(record.path, route.params);
        const [, first = "", ...rest] = path.split("/");
        return (LOCALES as readonly string[]).includes(first) ? `/${rest.join("/")}` : path;
      };
    });
});

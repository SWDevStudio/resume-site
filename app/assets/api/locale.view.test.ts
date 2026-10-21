import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE } from "~/assets/const";
import { resolveLocale } from "./locale";

describe("resolveLocale", () => {
  it("falls back to the default locale outside the Nuxt context", () => {
    expect(resolveLocale()).toBe(DEFAULT_LOCALE);
  });
});

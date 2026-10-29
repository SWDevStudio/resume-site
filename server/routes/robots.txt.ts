import { defineEventHandler, setResponseHeader } from "h3";
import { useSafeRuntimeConfig } from "#imports";
import { robotsTxt } from "../utils/sitemap";

export default defineEventHandler((event) => {
  setResponseHeader(event, "content-type", "text/plain; charset=utf-8");
  return robotsTxt(useSafeRuntimeConfig().public.i18n.baseUrl);
});

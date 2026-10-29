import { defineEventHandler, setResponseHeader } from "h3";
import { useSafeRuntimeConfig } from "#imports";
import { sitemapXml } from "../utils/sitemap";

export default defineEventHandler((event) => {
  setResponseHeader(event, "content-type", "application/xml; charset=utf-8");
  return sitemapXml(useSafeRuntimeConfig().public.i18n.baseUrl);
});

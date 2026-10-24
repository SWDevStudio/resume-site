import { readdirSync } from "node:fs";
import { defineUnlighthouseConfig } from "unlighthouse/config";

const LOCALES = ["ru", "en"];
const PAGES = ["", "/projects", "/blog", "/resume"];

const projectSlugs = readdirSync("app/assets/data/projects", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const postSlugs = readdirSync("app/assets/data/blog/posts")
  .filter((file) => file.endsWith(".ts"))
  .map((file) => file.replace(/\.ts$/, ""));

const paths = [
  ...PAGES,
  ...projectSlugs.map((slug) => `/projects/${slug}`),
  ...postSlugs.map((slug) => `/blog/${slug}`),
];

export default defineUnlighthouseConfig({
  site: "http://localhost:3000",
  urls: LOCALES.flatMap((locale) => paths.map((path) => `/${locale}${path}`)),
  scanner: {
    ignoreI18nPages: false,
    maxRoutes: 60,
    samples: 1,
  },
  puppeteerClusterOptions: {
    maxConcurrency: 2,
  },
  chrome: {
    useSystem: true,
  },
});

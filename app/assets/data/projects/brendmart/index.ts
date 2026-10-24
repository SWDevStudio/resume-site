import type { ProjectDefinition } from "../../../../../shared/types/catalog";

const project = {
  id: "brendmart",
  name: "Brendmart",
  tone: "secondary",
  url: "https://brendmart.com/",
  preview: "brendmart.svg",
  tags: ["e-commerce", "seo", "accounts"],
  stack: ["next-js", "type-script", "node-js", "postgre-sql"],
  isFavorite: true,
  text: {
    ru: {
      subtitle: "ИНТЕРНЕТ-МАГАЗИН · ЛИЧНЫЕ КАБИНЕТЫ",
      headline: "[headline result, e.g. from zero to 10k orders a month]",
      description:
        "Быстрый магазин, удобный для SEO, с личными кабинетами, историей заказов и удобным оформлением заказа.",
      previewAlt: "Превью сайта Brendmart",
      role: "Senior Frontend-разработчик: frontend-архитектура магазина (SSR + SPA, ~160k уникальных пользователей в месяц) и наставничество 2 разработчиков.",
      result:
        "Время загрузки основных страниц (каталог, карточка товара) снижено на ~37% по замерам Lighthouse.",
    },
    en: {
      subtitle: "ONLINE STORE · CUSTOMER ACCOUNTS",
      headline: "[headline result, e.g. from zero to 10k orders a month]",
      description:
        "A fast, SEO-friendly store with personal accounts, order history and a convenient checkout.",
      previewAlt: "Brendmart website preview",
      role: "Senior Frontend Developer: frontend architecture of the store (SSR + SPA, ~160k unique users per month) and mentoring of 2 developers.",
      result:
        "Load time of the main pages (catalog, product page) reduced by ~37% according to Lighthouse.",
    },
  },
} satisfies ProjectDefinition;

export default project;

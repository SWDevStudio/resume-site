import type { ProjectDefinition } from "../../../api/types/catalog";

const project = {
  id: "brendmart",
  name: "Brendmart",
  tone: "secondary",
  url: "https://brendmart.com/",
  preview: "brendmart/media/preview.webp",
  previewMobile: "brendmart/media/preview-mobile.webp",
  tags: ["e-commerce", "full-stack", "seo"],
  stack: [{ id: "nuxt", label: "Nuxt 4" }, "tailwind", "laravel", "postgre-sql"],
  caseStack: [
    { label: "Nuxt 4", own: true },
    { label: "Vue 3", own: true },
    { label: "Pinia", own: true },
    { label: "Nuxt i18n", own: true },
    { label: "Nuxt Icon", own: true },
    { label: "zod", own: true },
    { label: "VueUse", own: true },
    { label: "Tailwind CSS", own: true },
    { label: "daisyUI", own: true },
    { label: "Laravel", own: true },
    { label: "Go" },
    { label: "PostgreSQL" },
    { label: "Redis" },
    { label: "RabbitMQ" },
    { label: "S3 / MinIO" },
    { label: "ClickHouse" },
    { label: "Elasticsearch" },
    { label: "Docker" },
    { label: "Traefik" },
    { label: "Kubernetes" },
    { label: "Argo CD" },
    { label: "GitLab CI" },
    { label: "ELK" },
    { label: "Grafana" },
    { label: "Prometheus" },
  ],
  isFavorite: true,
  text: {
    ru: {
      subtitle: "ИНТЕРНЕТ-МАГАЗИН · ДОСТАВКА ИЗ ЕВРОПЫ",
      headline: "600+ заказов в месяц к моменту сдачи проекта",
      description:
        "Интернет-магазин одежды, обуви и аксессуаров мировых брендов из европейских магазинов с доставкой в Россию, Беларусь и Казахстан.",
      previewAlt: "Главная страница сайта Brendmart",
      role: "Fullstack-разработчик, один из двух в команде с junior frontend-разработчиком: дизайн и UI-кит, витрина на Nuxt с серверным рендером, клиентская часть админки, API для витрины на Laravel и ревью кода junior-разработчика.",
      result:
        "К сдаче магазин принимал больше 600 заказов в месяц, а в каталоге было больше 2 млн товаров.",
    },
    en: {
      subtitle: "ONLINE STORE · DELIVERY FROM EUROPE",
      headline: "600+ orders a month by the time of handover",
      description:
        "An online store of clothing, shoes and accessories by global brands from European stores, with delivery to Russia, Belarus and Kazakhstan.",
      previewAlt: "Home page of the Brendmart website",
      role: "Fullstack Developer, one of two on a team with a junior frontend developer: design and UI kit, a Nuxt storefront with server-side rendering, the client side of the admin panel, storefront API in Laravel and code review for the junior developer.",
      result:
        "By handover the store was taking more than 600 orders a month, and the catalog held more than 2 million products.",
    },
  },
} satisfies ProjectDefinition;

export default project;

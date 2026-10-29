import type { ProjectDefinition } from "../../../api/types/catalog";

const project = {
  id: "taobao",
  name: "Taobao.at",
  tone: "primary",
  url: "https://taobao.at/",
  preview: "taobao/media/preview.webp",
  previewMobile: "taobao/media/preview-mobile.webp",
  tags: ["e-commerce", "full-stack"],
  stack: [{ id: "nuxt", label: "Nuxt 4" }, "tailwind", "laravel", "postgre-sql"],
  caseStack: [
    { label: "Nuxt 4", own: true },
    { label: "Vue 3", own: true },
    { label: "TypeScript", own: true },
    { label: "Pinia", own: true },
    { label: "Nuxt i18n", own: true },
    { label: "Nuxt Icon", own: true },
    { label: "VueUse", own: true },
    { label: "Tailwind CSS", own: true },
    { label: "daisyUI", own: true },
    { label: "Vitest", own: true },
    { label: "Envoy" },
    { label: "Laravel", own: true },
    { label: "Go" },
    { label: "PostgreSQL", own: true },
    { label: "Redis", own: true },
    { label: "RabbitMQ", own: true },
    { label: "S3 / MinIO", own: true },
    { label: "ClickHouse" },
    { label: "Elasticsearch" },
    { label: "Docker", own: true },
    { label: "Traefik" },
    { label: "Kubernetes" },
    { label: "Argo CD" },
    { label: "GitLab CI" },
    { label: "ELK", own: true },
    { label: "Grafana", own: true },
    { label: "Prometheus" },
  ],
  isFavorite: false,
  text: {
    ru: {
      subtitle: "ВЫКУП ТОВАРОВ · ДОСТАВКА ИЗ КИТАЯ И ГОНКОНГА",
      headline: "600+ заказов в месяц к моменту сдачи",
      description:
        "Сервис заказа товаров из Китая и Гонконга с доставкой в Россию. Цены в рублях уже включают пошлины, комиссию и доставку.",
      previewAlt: "Главная страница сайта Taobao.at",
      role: "Fullstack-разработчик в команде из трёх разработчиков: дизайн сайта и UI-кит, витрина на Nuxt, клиентская часть админ-панели, API для витрины на Laravel.",
      result:
        "К моменту сдачи сервис принимал 600+ заказов в месяц, в каталоге было больше 2 млн товаров.",
    },
    en: {
      subtitle: "PURCHASE SERVICE · DELIVERY FROM CHINA AND HONG KONG",
      headline: "600+ orders a month by handover",
      description:
        "A service for ordering products from China and Hong Kong with delivery to Russia. Prices in rubles already include duties, the service fee and delivery.",
      previewAlt: "Home page of the Taobao.at website",
      role: "Fullstack Developer in a team of three developers: site design and the UI kit, the storefront in Nuxt, the client side of the admin panel, storefront API in Laravel.",
      result:
        "By handover the service was taking 600+ orders a month, and the catalog held more than 2 million products.",
    },
  },
} satisfies ProjectDefinition;

export default project;

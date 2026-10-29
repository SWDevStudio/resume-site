import type { ProjectDefinition } from "../../../api/types/catalog";

const project = {
  id: "pochtoy-prostobox",
  name: "Pochtoy & Prostobox",
  tone: "secondary",
  url: "https://pochtoy.com/",
  preview: "pochtoy-prostobox/media/preview.webp",
  previewMobile: "pochtoy-prostobox/media/preview-mobile.webp",
  tags: ["full-stack"],
  stack: [{ id: "vue", label: "Vue 3" }, "laravel", "type-script", "tailwind", "postgre-sql"],
  caseStack: [
    { label: "PHP", own: true },
    { label: "Laravel", own: true },
    { label: "nginx" },
    { label: "jQuery", own: true },
    { label: "Vue 3", own: true },
    { label: "TypeScript", own: true },
    { label: "JavaScript", own: true },
    { label: "Laravel Mix", own: true },
    { label: "Tailwind CSS", own: true },
    { label: "Bootstrap", own: true },
    { label: "Popper", own: true },
    { label: "Select2", own: true },
    { label: "Swiper", own: true },
    { label: "SweetAlert2", own: true },
    { label: "AirDatepicker", own: true },
    { label: "Fancybox", own: true },
    { label: "Choices", own: true },
    { label: "moment", own: true },
    { label: "lodash", own: true },
    { label: "axios", own: true },
    { label: "vee-validate", own: true },
    { label: "Dropzone", own: true },
    { label: "Vitest", own: true },
    { label: "Bunny CDN" },
    { label: "PostgreSQL", own: true },
    { label: "Redis", own: true },
  ],
  isFavorite: false,
  text: {
    ru: {
      subtitle: "ДОСТАВКА ИЗ США · ПОДДЕРЖКА И СКОРОСТЬ",
      headline: "Ускорение витрин двух брендов на одной платформе",
      description:
        "Сервис доставки покупок из американских магазинов: склад в беспошлинном Делавэре, выкуп товара, отправка в Россию, Казахстан, Беларусь и другие страны.",
      previewAlt: "Главная страница Pochtoy.com и мобильная версия главной Prostobox",
      role: "Fullstack-разработчик в команде из трёх разработчиков и PM: фронтенд витрины, запросы к базе данных для неё и ускорение загрузки страниц.",
      result:
        "Витрина получила пагинацию, ленивую загрузку картинок, отдельные скрипты и стили для каждой страницы и замер скорости у реальных пользователей. Модуль «Кешбэк за отзыв» мой: фронтенд и запросы.",
    },
    en: {
      subtitle: "DELIVERY FROM THE US · SUPPORT AND SPEED",
      headline: "Speeding up the storefronts of two brands on one platform",
      description:
        "A service that delivers purchases from US stores: a warehouse in tax-free Delaware, buying items on the customer's behalf, shipping to Russia, Kazakhstan, Belarus and other countries.",
      metaDescription:
        "A service delivering purchases from US stores: a tax-free Delaware warehouse, buying items for the customer, shipping to Russia, Kazakhstan, Belarus and more.",
      previewAlt: "Home page of Pochtoy.com and the mobile home page of Prostobox",
      role: "Fullstack Developer in a team of three developers and a PM: the storefront frontend, its database queries and faster page loading.",
      result:
        "The storefront got pagination, lazy-loaded images, separate scripts and styles for every page and speed tracking for real users. The Review Cashback module is mine: frontend and queries.",
    },
  },
} satisfies ProjectDefinition;

export default project;

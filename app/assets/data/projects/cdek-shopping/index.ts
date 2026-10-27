import type { ProjectDefinition } from "../../../api/types/catalog";

const project = {
  id: "cdek-shopping",
  name: "CDEK.Shopping",
  tone: "secondary",
  url: "https://cdek.shopping/",
  preview: "cdek-shopping/media/preview.webp",
  previewMobile: "cdek-shopping/media/preview-mobile.webp",
  tags: ["e-commerce", "accounts"],
  stack: [{ id: "vue", label: "Vue 2" }, "vuex", "java-script", "laravel", "jest"],
  caseStack: [
    { label: "JavaScript", own: true },
    { label: "jQuery", own: true },
    { label: "Vue 2", own: true },
    { label: "Vuex", own: true },
    { label: "SCSS", own: true },
    { label: "Webpack", own: true },
    { label: "Cypress", own: true },
    { label: "Jest", own: true },
    { label: "axios", own: true },
    { label: "portal-vue", own: true },
    { label: "Bootstrap", own: true },
    { label: "Popper", own: true },
    { label: "Owl Carousel", own: true },
    { label: "Slick", own: true },
    { label: "lightGallery", own: true },
    { label: "noUiSlider", own: true },
    { label: "jQuery Masked Input", own: true },
    { label: "Laravel", own: true },
    { label: "Blade", own: true },
    { label: "Sentry" },
    { label: "Diginetica" },
  ],
  isFavorite: false,
  text: {
    ru: {
      subtitle: "ЗАРУБЕЖНЫЙ ШОПИНГ · ЛИЧНЫЙ КАБИНЕТ",
      headline: "На 37% меньше регрессионных багов",
      description:
        "Сервис-агент группы СДЭК для заказа товаров зарубежных брендов из 14 стран с оплатой российской картой и ценами в рублях.",
      previewAlt: "Главная страница сайта CDEK.Shopping",
      role: "Middle frontend-разработчик в команде из 15 человек: весь фронтенд личного кабинета на Vue 2 и Vuex внутри Laravel + Blade, рефакторинг легаси на jQuery, задачи на Laravel.",
      result:
        "Новый сервис запустился сразу с интерактивным кабинетом без перезагрузок страниц. После рефакторинга легаси регрессионных багов стало на 37% меньше по отчётам QA.",
    },
    en: {
      subtitle: "SHOPPING FROM ABROAD · CUSTOMER ACCOUNT",
      headline: "37% fewer regression bugs",
      description:
        "A CDEK group agent service for ordering products of foreign brands from 14 countries, paid with a Russian card at prices in rubles.",
      previewAlt: "Home page of the CDEK.Shopping website",
      role: "Middle Frontend Developer in a team of 15: the entire frontend of the customer account in Vue 2 and Vuex inside Laravel + Blade, refactoring of the jQuery legacy code, Laravel tasks.",
      result:
        "The new service launched straight away with an interactive account that never reloads the page. After the legacy refactoring, regression bugs dropped by 37% according to QA reports.",
    },
  },
} satisfies ProjectDefinition;

export default project;

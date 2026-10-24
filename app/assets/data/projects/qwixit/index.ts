import type { ProjectDefinition } from "../../../api/types/catalog";

const project = {
  id: "qwixit",
  name: "Qwixit",
  tone: "primary",
  url: "https://qwixit.com/",
  preview: "qwixit/media/preview.webp",
  previewMobile: "qwixit/media/preview-mobile.webp",
  tags: ["e-commerce", "full-stack", "payments", "seo"],
  stack: [{ id: "vue", label: "Vue 3" }, "laravel", "kubernetes", "postgre-sql"],
  isFavorite: true,
  text: {
    ru: {
      subtitle: "ИНТЕРНЕТ-МАГАЗИН · ДОСТАВКА ИЗ США",
      headline: "300+ заказов в месяц через несколько месяцев после запуска",
      description:
        "Интернет-магазин оригинальных товаров из США с ценами в рублях и доставкой по России.",
      previewAlt: "Главная страница сайта Qwixit",
      role: "Fullstack-разработчик в команде из трёх разработчиков и PM: дизайн витрины и админки, frontend-архитектура и клиентская часть на Vue 3, API для витрины на Laravel.",
      result:
        "Через несколько месяцев после запуска магазин вышел на цель заказчика, 300+ заказов в месяц. К сдаче в каталоге было около миллиона товаров.",
    },
    en: {
      subtitle: "ONLINE STORE · DELIVERY FROM THE US",
      headline: "300+ orders a month a few months after launch",
      description:
        "An online store of genuine US products with prices in rubles and delivery across Russia.",
      previewAlt: "Home page of the Qwixit website",
      role: "Fullstack Developer in a team of three developers and a PM: design of the storefront and the admin panel, frontend architecture and the client side in Vue 3, storefront API in Laravel.",
      result:
        "A few months after launch the store reached the client's goal of 300+ orders a month. By handover the catalog held about a million products.",
    },
  },
} satisfies ProjectDefinition;

export default project;

import type { ProjectDefinition } from "../../../api/types/catalog";

const project = {
  id: "dobro",
  name: "Dobro.rf",
  tone: "secondary",
  url: null,
  preview: "dobro/media/preview.webp",
  previewMobile: "dobro/media/preview-mobile.webp",
  tags: ["payments", "accounts", "team-lead"],
  stack: [
    { id: "next-js", label: "Next.js 16" },
    { id: "react", label: "React 19" },
    "type-script",
    { id: "tailwind", label: "Tailwind 4" },
    "zustand",
    "vitest",
  ],
  caseStack: [
    { label: "Next.js 16", own: true },
    { label: "React 19", own: true },
    { label: "TypeScript", own: true },
    { label: "Tailwind CSS 4", own: true },
    { label: "Zustand", own: true },
    { label: "SWR", own: true },
    { label: "ofetch", own: true },
    { label: "openapi-typescript", own: true },
    { label: "react-hook-form", own: true },
    { label: "zod", own: true },
    { label: "maska", own: true },
    { label: "Vitest", own: true },
    { label: "React Testing Library", own: true },
    { label: "Storybook", own: true },
    { label: "autocannon", own: true },
    { label: "0x", own: true },
    { label: "prom-client", own: true },
    { label: "Husky", own: true },
    { label: "lint-staged", own: true },
    { label: "Lexical" },
    { label: "GSAP" },
    { label: "@use-gesture" },
    { label: "TanStack Virtual" },
    { label: "Docker", own: true },
    { label: "GitHub Actions" },
  ],
  isFavorite: true,
  text: {
    ru: {
      subtitle: "ПЛАТФОРМА ПОЖЕРТВОВАНИЙ · ЦИФРОВОЙ РУБЛЬ",
      headline: "В 13 раз больше запросов в секунду",
      description:
        "Платформа пожертвований с проверенными фондами, цифровым рублём и кабинетами НКО. Генеральный партнёр — Альфа-Банк.",
      previewAlt: "Главная страница платформы Добро.рф",
      role: "Тимлид фронтенд-разработки в команде из 15 человек: архитектура и стек фронтенда, задачи и ревью для ещё четырёх разработчиков, UI-кит, кабинеты НКО и доноров, оптимизация производительности.",
      result:
        "Сайт держит в 13 раз больше запросов: 340 → 4552 rps по 17 маршрутам, медиана ответа 919 → 69 мс. Lighthouse 100 по Accessibility, Best Practices и SEO, Performance 90+.",
    },
    en: {
      subtitle: "DONATION PLATFORM · DIGITAL RUBLE",
      headline: "13 times more requests per second",
      description:
        "A donation platform with verified charities, the digital ruble and accounts for non-profits. General partner: Alfa-Bank.",
      previewAlt: "Home page of the Dobro.rf platform",
      role: "Frontend Team Lead in a team of 15: frontend architecture and stack, tasks and code review for four more developers, the UI kit, the accounts of non-profits and donors, performance optimization.",
      result:
        "The site handles 13 times more requests: 340 → 4552 rps across 17 routes, median response 919 → 69 ms. Lighthouse 100 in Accessibility, Best Practices and SEO, Performance 90+.",
    },
  },
} satisfies ProjectDefinition;

export default project;

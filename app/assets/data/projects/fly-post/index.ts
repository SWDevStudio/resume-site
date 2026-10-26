import type { ProjectDefinition } from "../../../api/types/catalog";

const project = {
  id: "fly-post",
  name: "Fly Post",
  tone: "secondary",
  url: null,
  preview: "fly-post/media/preview.webp",
  previewMobile: "fly-post/media/preview-mobile.webp",
  tags: ["full-stack", "accounts"],
  stack: [{ id: "vue", label: "Vue 3" }, "type-script", "nest-js", "postgre-sql", "docker"],
  caseStack: [
    { label: "Vue 3", own: true },
    { label: "TypeScript", own: true },
    { label: "Vite", own: true },
    { label: "Pinia", own: true },
    { label: "Vue Router", own: true },
    { label: "Tailwind CSS", own: true },
    { label: "daisyUI", own: true },
    { label: "vue-i18n", own: true },
    { label: "Leaflet", own: true },
    { label: "Leaflet.markercluster", own: true },
    { label: "vee-validate", own: true },
    { label: "yup", own: true },
    { label: "date-fns", own: true },
    { label: "MSW", own: true },
    { label: "ky", own: true },
    { label: "maska", own: true },
    { label: "NestJS", own: true },
    { label: "Swagger", own: true },
    { label: "PostgreSQL", own: true },
    { label: "Docker", own: true },
    { label: "GitLab CI", own: true },
  ],
  isFavorite: false,
  text: {
    ru: {
      subtitle: "ПОПУТНАЯ ДОСТАВКА · ВНУТРЕННИЙ СЕРВИС",
      headline: "MVP за ~5 недель командой из трёх разработчиков",
      description:
        "Внутренний сервис, через который экипажи самолётов берут попутную почту на свой рейс и получают деньги за доставку.",
      previewAlt:
        "Профиль в Fly Post: таблица отправлений со статусами и карточка выбранного отправления",
      role: "Вёл проект как подрядчик: дизайн и UI-кит, архитектура, бэкенд на NestJS, фронтенд на Vue 3 вместе с двумя разработчиками и ревью их кода.",
      result:
        "Заказчик принял MVP, собранный примерно за 5 недель: фронтенд и бэкенд шли параллельно по контракту в Swagger.",
    },
    en: {
      subtitle: "PIGGYBACK DELIVERY · INTERNAL SERVICE",
      headline: "An MVP in ~5 weeks with a team of three developers",
      description:
        "An internal service where flight crews pick up mail for their own flight and get paid for delivering it.",
      previewAlt:
        "Profile in Fly Post: a table of shipments with statuses and the selected shipment's card",
      role: "Led the project as a contractor: design and the UI kit, architecture, the NestJS backend, the Vue 3 frontend together with two developers and reviews of their code.",
      result:
        "The client accepted the MVP built in about 5 weeks: the frontend and the backend went in parallel against a Swagger API contract.",
    },
  },
} satisfies ProjectDefinition;

export default project;

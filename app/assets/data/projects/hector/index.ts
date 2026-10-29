import type { ProjectDefinition } from "../../../api/types/catalog";

const project = {
  id: "hector",
  name: "Hector",
  tone: "primary",
  url: "https://hectorvip.com/",
  previewMobile: "hector/media/preview-mobile.webp",
  tags: ["mobile-app", "team-lead"],
  stack: [
    { id: "vue", label: "Vue 3" },
    { id: "capacitor", label: "Capacitor 8" },
    "type-script",
    "pinia",
    { id: "tailwind", label: "Tailwind 4" },
  ],
  caseStack: [
    { label: "Vue 3", own: true },
    { label: "TypeScript", own: true },
    { label: "Vite", own: true },
    { label: "Capacitor 8", own: true },
    { label: "Pinia", own: true },
    { label: "Vue Router", own: true },
    { label: "vue-i18n", own: true },
    { label: "VueUse", own: true },
    { label: "Tailwind CSS 4", own: true },
    { label: "vee-validate", own: true },
    { label: "zod", own: true },
    { label: "maska", own: true },
    { label: "Vitest", own: true },
    { label: "Vue Test Utils", own: true },
    { label: "Storybook", own: true },
    { label: "oxlint", own: true },
    { label: "ESLint", own: true },
    { label: "oxfmt", own: true },
    { label: "Husky", own: true },
    { label: "mise", own: true },
    { label: "Leaflet" },
    { label: "OpenStreetMap" },
    { label: "lottie-web" },
    { label: "View Transitions API" },
    { label: "miragejs" },
    { label: "Codemagic" },
    { label: "TestFlight" },
    { label: "BrowserStack" },
  ],
  isFavorite: true,
  text: {
    ru: {
      subtitle: "МОБИЛЬНОЕ ПРИЛОЖЕНИЕ · ЛИЧНАЯ ОХРАНА",
      headline: "Приложение для iOS и Android со сборкой iOS в облаке",
      description:
        "Приложение для заказа личной охраны и машины с водителем: live-трекинг команды на карте и кнопка SOS. Сервис работает в Европе и ОАЭ.",
      previewAlt:
        "Экраны приложения Hector: выбор охраны, live-трекинг команды, проверка заказа и экран SOS",
      role: "Frontend Team Lead в команде из 15 человек: архитектура и выбор Vue 3 с Capacitor, задачи и ревью для ещё четырёх разработчиков, стартовая настройка проекта, компоненты и первые экраны заказа. Приложение заказчику презентовал сам.",
      result:
        "Приложение доведено до демо-сборки для заказчика под iOS и Android, iOS собирается и тестируется в облаке: 26 экранов, около 1700 тест-кейсов.",
    },
    en: {
      subtitle: "MOBILE APP · PERSONAL PROTECTION",
      headline: "An iOS and Android app with the iOS build in the cloud",
      description:
        "An app for booking personal protection and a car with a driver: live tracking of the team on a map and an SOS button. The service operates in Europe and the UAE.",
      metaDescription:
        "An app for booking personal protection and a chauffeured car: live tracking of the team on a map and an SOS button. The service operates in Europe and the UAE.",
      previewAlt:
        "Screens of the Hector app: choosing protection, live tracking of the team, order review and the SOS screen",
      role: "Frontend Team Lead in a team of 15: architecture and the choice of Vue 3 with Capacitor, tasks and code review for four more developers, the initial project setup, components and the first order screens. I presented the app to the client myself.",
      result:
        "The app reached a demo build for the client on iOS and Android, with iOS built and tested in the cloud: 26 screens, about 1,700 test cases.",
    },
  },
} satisfies ProjectDefinition;

export default project;

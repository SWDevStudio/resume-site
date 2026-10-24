import type { ProjectDefinition } from "../../../../../shared/types/catalog";

const project = {
  id: "pine-ridge",
  name: "Pine Ridge",
  tone: "accent",
  url: null,
  preview: "pine-ridge.svg",
  tags: ["booking", "seo", "mobile-first"],
  stack: ["next-js", "type-script", "node-js", "postgre-sql"],
  isFavorite: true,
  text: {
    ru: {
      subtitle: "САЙТ С БРОНИРОВАНИЕМ · ГЛЭМПИНГ-КУРОРТ",
      headline: "[headline result, e.g. from zero to 10k orders a month]",
      description:
        "Сайт в подходе mobile-first: онлайн-бронирование, календарь доступности и быстро загружающиеся галереи.",
      previewAlt: "Превью сайта Pine Ridge",
      role: "[Ваша роль и объём работ в проекте]",
      result: "[Измеримый результат: скорость, конверсия, выручка]",
    },
    en: {
      subtitle: "BOOKING SITE · GLAMPING RESORT",
      headline: "[headline result, e.g. from zero to 10k orders a month]",
      description:
        "A mobile-first site with online booking, availability calendar and fast-loading galleries.",
      previewAlt: "Pine Ridge website preview",
      role: "[Your role and scope on the project]",
      result: "[Measurable result: speed, conversion, revenue]",
    },
  },
} satisfies ProjectDefinition;

export default project;

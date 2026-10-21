import type { ProjectDefinition } from "../../../../../shared/types/catalog";

const project = {
  id: "qwixit",
  name: "Qwixit",
  tone: "primary",
  url: "https://qwixit.com/",
  preview: "qwixit.svg",
  tags: ["e-commerce", "full-stack", "payments", "seo"],
  stack: ["next-js", "type-script", "node-js", "postgre-sql"],
  isFavorite: true,
  text: {
    ru: {
      subtitle: "МАРКЕТПЛЕЙС ОДЕЖДЫ · ДОСТАВКА ИЗ США",
      description:
        "Платформа электронной коммерции для одежды, обуви и аксессуаров глобальных брендов с доставкой по России.",
      previewAlt: "Превью сайта Qwixit",
      role: "[Ваша роль и объём работ в проекте]",
      result: "[Измеримый результат: скорость, конверсия, выручка]",
    },
    en: {
      subtitle: "FASHION MARKETPLACE · US DELIVERY",
      description:
        "E-commerce platform for clothing, footwear and accessories from global brands, delivered across Russia.",
      previewAlt: "Qwixit website preview",
      role: "[Your role and scope on the project]",
      result: "[Measurable result: speed, conversion, revenue]",
    },
  },
} satisfies ProjectDefinition;

export default project;

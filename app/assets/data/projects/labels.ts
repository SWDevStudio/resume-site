import type { ByLocale, ProjectsText } from "../../api/types/catalog";

export const projectLabels = {
  ru: {
    linkPlaceholder: "[ссылка]",
    tags: {
      "e-commerce": "E-commerce",
      "full-stack": "Full-Stack",
      payments: "Платежи",
      seo: "SEO",
      accounts: "Кабинеты",
      "mobile-first": "Mobile first",
      "mobile-app": "Мобильное приложение",
      "team-lead": "Тимлид",
    },
  },
  en: {
    linkPlaceholder: "[link]",
    tags: {
      "e-commerce": "E-commerce",
      "full-stack": "Full-Stack",
      payments: "Payments",
      seo: "SEO",
      accounts: "Accounts",
      "mobile-first": "Mobile first",
      "mobile-app": "Mobile app",
      "team-lead": "Team Lead",
    },
  },
} satisfies ByLocale<Omit<ProjectsText, "items">>;

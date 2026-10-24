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
      booking: "Бронирование",
      "mobile-first": "Mobile first",
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
      booking: "Booking",
      "mobile-first": "Mobile first",
    },
  },
} satisfies ByLocale<Omit<ProjectsText, "items">>;

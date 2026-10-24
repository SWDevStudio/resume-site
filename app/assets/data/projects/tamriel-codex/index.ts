import type { ProjectDefinition } from "../../../api/types/catalog";

const project = {
  id: "tamriel-codex",
  name: "Tamriel Codex",
  tone: "accent",
  url: null,
  preview: "tamriel-codex/media/preview.webp",
  previewMobile: "tamriel-codex/media/preview-mobile.webp",
  tags: ["mobile-first"],
  stack: [{ id: "vue", label: "Vue 3" }, "type-script", "capacitor", "tailwind", "pinia"],
  caseStack: [
    { label: "Vue 3", own: true },
    { label: "TypeScript", own: true },
    { label: "Vite", own: true },
    { label: "Pinia", own: true },
    { label: "Vue Router", own: true },
    { label: "VueUse", own: true },
    { label: "vee-validate", own: true },
    { label: "Tailwind CSS", own: true },
    { label: "daisyUI", own: true },
    { label: "Iconify", own: true },
    { label: "Capacitor", own: true },
    { label: "Electron", own: true },
    { label: "electron-builder", own: true },
    { label: "SQLite", own: true },
    { label: "jeep-sqlite", own: true },
    { label: "sql.js", own: true },
    { label: "qrcode", own: true },
    { label: "qr-scanner", own: true },
    { label: "marked", own: true },
    { label: "pdfjs-dist", own: true },
    { label: "mammoth", own: true },
    { label: "sharp", own: true },
    { label: "node-html-parser", own: true },
    { label: "vue-tsc", own: true },
    { label: "ESLint", own: true },
    { label: "oxlint", own: true },
    { label: "oxfmt", own: true },
    { label: "Playwright", own: true },
  ],
  isFavorite: false,
  text: {
    ru: {
      subtitle: "ОФЛАЙН-СПРАВОЧНИК · РОЛЕВАЯ ИГРА",
      headline: "Офлайн-справочник для Android и Windows за 10 дней, к дате игры",
      description:
        "Справочник и записная книжка игрока для полигонной ролевой игры по миру The Elder Scrolls: правила, лор и новости с быстрым поиском, свои заметки и обмен ими через QR без интернета.",
      previewAlt: "Главный экран приложения Tamriel Codex",
      role: "Единственный разработчик, проект под ключ: интерфейс, локальная база, сборки под Android и Windows, выгрузка данных игры из группы VK и обмен заметками через QR.",
      result:
        "На игре приложением пользовалась фракция Альдмерский доминион, заметками игроки обменивались через QR без интернета. Нужное в правилах и лоре находилось за секунды, а не в стопке бумаги.",
    },
    en: {
      subtitle: "OFFLINE HANDBOOK · LARP",
      headline: "An offline handbook for Android and Windows in 10 days, ready by game day",
      description:
        "A handbook and player's notebook for a live-action role-playing game set in The Elder Scrolls world: rules, lore and news with fast search, personal notes and sharing them by QR without internet.",
      previewAlt: "Home screen of the Tamriel Codex app",
      role: "Sole developer, end to end: the interface, the local database, the Android and Windows builds, exporting the game data from the VK group and sharing notes by QR.",
      result:
        "At the game the Aldmeri Dominion faction used the app, and players shared notes by QR without internet. Anything in the rules and lore took seconds to find instead of digging through a stack of paper.",
    },
  },
} satisfies ProjectDefinition;

export default project;

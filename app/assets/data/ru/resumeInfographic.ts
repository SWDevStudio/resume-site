import type { ResumeInfographicFile } from "../../api/types/catalog";
import { SOCIAL } from "../../const/social";
import {
  INFOGRAPHIC_CHANGES as CHANGE,
  INFOGRAPHIC_HEADLINE,
  INFOGRAPHIC_JOBS as JOB,
  INFOGRAPHIC_NOTES as NOTE,
  INFOGRAPHIC_PROJECTS as PROJECT,
  INFOGRAPHIC_ROLE_LABELS,
  INFOGRAPHIC_STACK,
  INFOGRAPHIC_STATS as STAT,
  INFOGRAPHIC_TARGETS as TARGET,
  INFOGRAPHIC_TIMELINE,
} from "../canon/resumeInfographic";

const resumeInfographic = {
  headline: INFOGRAPHIC_HEADLINE,
  contacts: [
    {
      id: "telegram",
      label: "telegram",
      value: SOCIAL.telegram.value,
      href: SOCIAL.telegram.href,
    },
    {
      id: "email",
      label: "email",
      value: SOCIAL.email.value,
      href: SOCIAL.email.href,
    },
    {
      id: "linkedin",
      label: "linkedin",
      value: "Михаил Малахов",
      href: SOCIAL.linkedin.href,
    },
    {
      id: "location",
      label: "локация",
      value: "Россия, готов к переезду",
    },
  ],
  summary: {
    title: "ОБО МНЕ",
    paragraphs: [
      "Fullstack-разработчик и тимлид, 7+ лет в коммерческой разработке. Frontend на Vue.js, Nuxt, React и Next.js (SPA + SSR), backend на Laravel, NestJS и Express.",
      "С 2024 года работаю с AI-агентами: пишу правила архитектуры, skills и конвейеры субагентов, в которых тесты пишутся до кода. Сейчас веду frontend-команду из 4 человек на dobro.ru и мобильном приложении Hector.",
    ],
  },
  experience: {
    title: "ОПЫТ",
    total: "Общий опыт: 7 лет 6 месяцев",
    present: "н. в.",
    roles: INFOGRAPHIC_ROLE_LABELS,
    timeline: INFOGRAPHIC_TIMELINE,
    jobs: [
      {
        ...JOB.freedom,
        company: "Freedom International Group",
        team: "5 FE (4 в подчинении) · 4 BE · 2 QA · PM",
      },
      { ...JOB.freelance, company: "Фриланс · Fly Post", team: "2 FE, собрал команду и вёл её" },
      { ...JOB.brendmart, company: "Brendmart", team: "2 fullstack · 1 junior FE" },
      { ...JOB.pochtoy, company: "Pochtoy.com LLC", team: "3 fullstack · PM" },
      { ...JOB.cdekMarket, company: "Сдэк.Маркет", team: "4 FE · 8 BE · 2 QA · дизайнер" },
      { ...JOB.toTheMoon, company: "To The Moon Mobile Ltd", team: "2 FE · 2 BE · PM" },
      { ...JOB.amigoweb, company: "Amigoweb", team: "2 FE · 1 BE · 1 QA · PM" },
    ],
  },
  stack: {
    title: "СТЕК",
    groups: INFOGRAPHIC_STACK,
  },
  projects: {
    title: "ПРОЕКТЫ",
    main: [
      {
        ...PROJECT.dobro,
        name: "dobro.ru",
        meta: [
          "Freedom International Group",
          { job: JOB.freedom.id },
          "платформа благотворительных сборов",
        ],
        points: [
          "Низкий rps давал корневой layout: запросы авторизации и шапки не кешировались, все 39 маршрутов рендерились динамически. Авторизацию перенёс в клиент, публичные запросы кешируются с тегами, 17 маршрутов стали статикой, 2 — ISR.",
          "Справочник фильтров на 130 КБ грузится клиентом, а не уходит в RSC-payload. 109 изображений переведены в WebP.",
          "На ревью нашёл ISR-страницу с пустой оболочкой: useSearchParams() уводил её в клиентский рендер, в HTML оставалось 659 символов текста из 2398.",
        ],
        metrics: [
          { ...CHANGE.dobroRps, label: "rps, 17 маршрутов" },
          { ...CHANGE.dobroLatency, label: "медиана ответа, мс" },
          { ...CHANGE.dobroHtml, label: "HTML каталога, КБ" },
          { ...CHANGE.dobroImages, label: "картинки в сборке, МБ" },
          NOTE.dobro,
        ],
      },
      {
        ...PROJECT.hector,
        name: "Hector",
        meta: ["Freedom International Group", "2026", "мобильное приложение"],
        points: [
          "Демо для заказчика под iOS и Android из одного кода, экраны клиента и агента.",
          "Сборка iOS вынесена в Codemagic: команда без Mac получает сборку под симулятор и подписанный .ipa в TestFlight.",
        ],
        metrics: [
          { ...STAT.hectorScreens, label: "экранов" },
          { ...STAT.hectorComponents, label: "переиспользуемых компонентов" },
          { ...STAT.hectorTests, label: "тест-кейсов в 177 файлах" },
        ],
      },
      {
        ...PROJECT.brendmart,
        name: "brendmart.com, taobao.at",
        meta: ["Brendmart", { job: JOB.brendmart.id }, "интернет-магазины"],
        points: [
          "Предложил Nuxt: витрина стала отдельным SSR-приложением на публичном API бэкенда и расширяется без правок в бэкенде.",
          "Витрина taobao.at собирает страницы по JSON-дереву от бэкенда: структуру меняют без релиза. UI-кит прошёл axe-core по WCAG 2.2 AA.",
          "Тесты: компонентные на Vitest, визуальные по эталонным скриншотам, E2E на Playwright от каталога до заказа.",
        ],
        metrics: [
          {
            ...STAT.brendmartLaunch,
            unit: " мес",
            label: "от начала разработки до запуска brendmart.com",
          },
          { ...STAT.brendmartOrders, label: "заказов в месяц к сдаче" },
          { ...STAT.brendmartProducts, unit: " млн", label: "товаров в каталоге" },
          { ...STAT.brendmartUsers, label: "уникальных пользователей в месяц" },
        ],
      },
      {
        ...PROJECT.qwixit,
        name: "Qwixit, pochtoy.com",
        meta: ["Pochtoy.com LLC", { job: JOB.pochtoy.id }, "e-commerce и доставка"],
        points: [
          "Qwixit запущен примерно за 3 месяца. Для SEO рендер карточек товаров вынесен на сервер: поисковик видит H1, цену и schema.org (Product, BreadcrumbList).",
          "Новые модули pochtoy.com (калькулятор доставки, «Кешбэк за отзыв») — изолированные виджеты на Vue 3 + TypeScript внутри Blade-шаблонов.",
          "Скрипт perf-rum.js снимает TTFB, FCP, LCP, INP и CLS у 25% реальных визитов по каждой странице.",
        ],
        metrics: [
          { ...CHANGE.pochtoyBundle, label: "бандл главной pochtoy, КБ" },
          {
            ...TARGET.qwixitOrders,
            label: "заказов/мес Qwixit, через 2,5 мес",
            targetLabel: "цель",
          },
          { ...STAT.pochtoyParcels, label: "посылок в неделю без сбоев" },
        ],
      },
    ],
    more: [
      {
        ...PROJECT.flyPost,
        name: "Fly Post",
        meta: [
          "Фриланс",
          { job: JOB.freelance.id },
          "сервис попутной почты для экипажей самолётов",
        ],
        points: [
          "Контракт API в Swagger и mock-сервер на MSW: frontend верстал, не дожидаясь API, бэкенд шёл параллельно.",
          "Набрал и вёл команду из 2 frontend-разработчиков: задачи в git issues, код-стайл, code review.",
          "Подтверждение номера через Telegram-бота вместо платных SMS.",
        ],
        metrics: [
          { ...STAT.flyPostMvp, unit: " нед", label: "от старта до сдачи MVP" },
          { ...STAT.flyPostTeam, label: "frontend-разработчика в команде" },
        ],
      },
      {
        ...PROJECT.cdekMarket,
        name: "Сдэк.Маркет",
        meta: [{ job: JOB.cdekMarket.id }, "личный кабинет продавца"],
        points: [
          "Подключил Vue 2 и с нуля сделал SPA кабинета: 5 разделов без перезагрузок внутри MPA через Blade. После этого команда решила переписать проект на Nuxt.",
          "Покрыл jQuery-код E2E-тестами на Cypress и визуальными эталонами, затем разбил файлы по 6000+ строк на модули с юнит-тестами на Jest.",
          "Вместе с дизайнером собрал UI-kit кабинета из 16 базовых компонентов.",
        ],
        metrics: [
          { ...CHANGE.cdekRegressions, label: "регрессионные баги, по QA" },
          { ...CHANGE.cdekLoadTime, label: "время загрузки, Lighthouse" },
          NOTE.cdekMarket,
        ],
      },
    ],
    earlier: [
      {
        ...PROJECT.toTheMoon,
        name: "To The Moon Mobile Ltd",
        meta: [{ job: JOB.toTheMoon.id }, "внутренние сервисы оператора связи"],
        points: [
          "Внутренние дашборды на React: таблицы данных с пользовательскими фильтрами.",
          "Эндпоинты API на Express и запросы к PostgreSQL под эти дашборды.",
        ],
        metrics: [],
      },
      {
        ...PROJECT.amigoweb,
        name: "Amigoweb",
        meta: [{ job: JOB.amigoweb.id }, "заказная разработка"],
        points: [
          "Переиспользуемые UI-компоненты вместо дублирующейся разметки: новые страницы собирались из готовых блоков.",
          "Адаптивная и кроссбраузерная вёрстка.",
        ],
        metrics: [],
      },
    ],
  },
  products: {
    title: "СОБСТВЕННЫЕ ПРОДУКТЫ",
    items: [
      {
        ...PROJECT.someday,
        name: "Someday",
        meta: ["с 10.2025", "драйверы для игровых устройств ролевой игры"],
        points: [
          "11 библиотек драйверов, на них собраны 6 прошивок устройств.",
          "На игре 2026 года около 30 игроков прошли квесты локации, устройство живёт 18–20 часов от двух 18650.",
        ],
        metrics: [],
      },
      {
        ...PROJECT.tamrielCodex,
        name: "Tamriel Codex",
        meta: ["10 дней", "офлайн-справочник игрока"],
        points: [
          "Android и Windows из одного кода, локальная база на SQLite, поиск по 11 разделам.",
          "Обмен заметками через QR без интернета. Релиз к дате игры.",
        ],
        metrics: [],
      },
    ],
  },
  ai: {
    title: "AI В РАЗРАБОТКЕ",
    text: "Idodom, 3D-конструктор мебели (FastAPI, three.js), собран конвейером агентов Claude Code за неделю. Мои — ТЗ для агентов, устройство конвейера и решения. Тесты пишет отдельный агент до кода, этап принимает один проверяющий.",
    metrics: [
      { ...STAT.aiTasks, label: "задач" },
      { ...STAT.aiHours, unit: " ч", label: "работы агентов" },
      { ...STAT.aiLines, label: "строк кода" },
      { ...STAT.aiTokens, label: "токенов на задачу" },
    ],
  },
  facts: [
    {
      id: "education",
      title: "ОБРАЗОВАНИЕ",
      lines: ["РГСУ, 2023"],
      note: "Информационные системы и технологии в экономической сфере",
    },
    {
      id: "languages",
      title: "ЯЗЫКИ",
      lines: ["Русский — родной", "Английский — A2, свободно читаю документацию"],
    },
    {
      id: "format",
      title: "ФОРМАТ",
      lines: ["Удалённо, гибрид, офис"],
      note: "Постоянная работа, подработка",
    },
  ],
} satisfies ResumeInfographicFile;

export default resumeInfographic;

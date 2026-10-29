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
      value: "Mikhail Malakhov",
      href: SOCIAL.linkedin.href,
    },
    {
      id: "location",
      label: "location",
      value: "Russia, willing to relocate",
    },
  ],
  summary: {
    title: "SUMMARY",
    paragraphs: [
      "Fullstack developer and team lead with 7+ years of commercial experience. Frontend on Vue.js, Nuxt, React and Next.js (SPA + SSR), backend on Laravel, NestJS and Express.",
      "Since 2024 I have worked with AI agents: I write architecture rules, skills and subagent pipelines where tests are written before code. Currently leading a frontend team of 4 on dobro.ru and the Hector mobile app.",
    ],
  },
  experience: {
    title: "EXPERIENCE",
    total: "Total experience: 7 years 6 months",
    present: "present",
    roles: INFOGRAPHIC_ROLE_LABELS,
    timeline: INFOGRAPHIC_TIMELINE,
    jobs: [
      {
        ...JOB.freedom,
        company: "Freedom International Group",
        team: "5 FE (4 direct reports) · 4 BE · 2 QA · PM",
      },
      { ...JOB.freelance, company: "Freelance · Fly Post", team: "2 FE, hired and led the team" },
      { ...JOB.brendmart, company: "Brendmart", team: "2 fullstack · 1 junior FE" },
      { ...JOB.pochtoy, company: "Pochtoy.com LLC", team: "3 fullstack · PM" },
      { ...JOB.cdekMarket, company: "CDEK.Market", team: "4 FE · 8 BE · 2 QA · designer" },
      { ...JOB.toTheMoon, company: "To The Moon Mobile Ltd", team: "2 FE · 2 BE · PM" },
      { ...JOB.amigoweb, company: "Amigoweb", team: "2 FE · 1 BE · 1 QA · PM" },
    ],
  },
  stack: {
    title: "STACK",
    groups: INFOGRAPHIC_STACK,
  },
  projects: {
    title: "PROJECTS",
    main: [
      {
        ...PROJECT.dobro,
        name: "dobro.ru",
        meta: [
          "Freedom International Group",
          { job: JOB.freedom.id },
          "charity fundraising platform",
        ],
        points: [
          "Low rps came from the root layout: auth and header requests were not cached, so all 39 routes rendered dynamically. Moved auth to the client, public requests are cached with tags, 17 routes became static and 2 ISR.",
          "The 130 KB filter dictionary is loaded by the client instead of going into the RSC payload. 109 images converted to WebP.",
          "While reviewing, caught an ISR page serving an empty shell: useSearchParams() pushed it into client-side rendering, leaving 659 of 2,398 characters of text in the HTML.",
        ],
        metrics: [
          { ...CHANGE.dobroRps, label: "rps, 17 routes" },
          { ...CHANGE.dobroLatency, label: "median response, ms" },
          { ...CHANGE.dobroHtml, label: "catalog HTML, KB" },
          { ...CHANGE.dobroImages, label: "images in the build, MB" },
          NOTE.dobro,
        ],
      },
      {
        ...PROJECT.hector,
        name: "Hector",
        meta: ["Freedom International Group", "2026", "mobile app"],
        points: [
          "Client demo for iOS and Android from a single codebase, screens for the client and the agent.",
          "iOS builds moved to Codemagic: a team without Macs gets a simulator build and a signed .ipa in TestFlight.",
        ],
        metrics: [
          { ...STAT.hectorScreens, label: "screens" },
          { ...STAT.hectorComponents, label: "reusable components" },
          { ...STAT.hectorTests, label: "test cases in 177 files" },
        ],
      },
      {
        ...PROJECT.brendmart,
        name: "brendmart.com, taobao.at",
        meta: ["Brendmart", { job: JOB.brendmart.id }, "online stores"],
        points: [
          "Proposed Nuxt: the storefront became a separate SSR app on the backend's public API and is extended without backend changes.",
          "The taobao.at storefront builds pages from a JSON tree sent by the backend: structure changes without a release. The UI kit passed axe-core against WCAG 2.2 AA.",
          "Tests: Vitest component tests, visual tests against reference screenshots, Playwright E2E from catalog to order.",
        ],
        metrics: [
          {
            ...STAT.brendmartLaunch,
            unit: " mo",
            label: "from the start of development to the brendmart.com launch",
          },
          { ...STAT.brendmartOrders, label: "orders/month at handover" },
          { ...STAT.brendmartProducts, unit: "M", label: "products in the catalog" },
          { ...STAT.brendmartUsers, label: "unique users per month" },
        ],
      },
      {
        ...PROJECT.qwixit,
        name: "Qwixit, pochtoy.com",
        meta: ["Pochtoy.com LLC", { job: JOB.pochtoy.id }, "e-commerce and delivery"],
        points: [
          "Launched Qwixit in about 3 months. For SEO, product card rendering moved to the server: search engines see the H1, price and schema.org (Product, BreadcrumbList).",
          "New pochtoy.com modules (shipping calculator, “Cashback for a review”) are isolated Vue 3 + TypeScript widgets inside Blade templates.",
          "The perf-rum.js script records TTFB, FCP, LCP, INP and CLS for 25% of real visits on every page.",
        ],
        metrics: [
          { ...CHANGE.pochtoyBundle, label: "pochtoy home bundle, KB" },
          {
            ...TARGET.qwixitOrders,
            label: "Qwixit orders/month, 2.5 mo after launch",
            targetLabel: "target",
          },
          { ...STAT.pochtoyParcels, label: "parcels a week without failures" },
        ],
      },
    ],
    more: [
      {
        ...PROJECT.flyPost,
        name: "Fly Post",
        meta: [
          "Freelance",
          { job: JOB.freelance.id },
          "mail-on-the-way service for aircraft crews",
        ],
        points: [
          "API contract in Swagger and an MSW mock server: frontend built the UI without waiting for the API while the backend progressed in parallel.",
          "Hired and led a team of 2 frontend developers: tasks in git issues, code style, code review.",
          "Phone verification via a Telegram bot instead of paid SMS.",
        ],
        metrics: [
          { ...STAT.flyPostMvp, unit: " wk", label: "from start to MVP delivery" },
          { ...STAT.flyPostTeam, label: "frontend developers on the team" },
        ],
      },
      {
        ...PROJECT.cdekMarket,
        name: "CDEK.Market",
        meta: [{ job: JOB.cdekMarket.id }, "seller account"],
        points: [
          "Adopted Vue 2 and built the account SPA from scratch: 5 sections without page reloads inside the MPA via Blade. After that the team decided to rewrite the project on Nuxt.",
          "Covered jQuery code with Cypress E2E tests and visual references, then split 6,000+ line files into modules with Jest unit tests.",
          "Built a 16-component UI kit for the account together with the designer.",
        ],
        metrics: [
          { ...CHANGE.cdekRegressions, label: "regression bugs, per QA" },
          { ...CHANGE.cdekLoadTime, label: "load time, Lighthouse" },
          NOTE.cdekMarket,
        ],
      },
    ],
    earlier: [
      {
        ...PROJECT.toTheMoon,
        name: "To The Moon Mobile Ltd",
        meta: [{ job: JOB.toTheMoon.id }, "internal services of a mobile carrier"],
        points: [
          "Internal React dashboards: data tables with user filters.",
          "Express API endpoints and PostgreSQL queries for these dashboards.",
        ],
        metrics: [],
      },
      {
        ...PROJECT.amigoweb,
        name: "Amigoweb",
        meta: [{ job: JOB.amigoweb.id }, "contract development"],
        points: [
          "Reusable UI components instead of duplicated markup: new pages were assembled from ready-made blocks.",
          "Responsive and cross-browser layout.",
        ],
        metrics: [],
      },
    ],
  },
  products: {
    title: "OWN PRODUCTS",
    items: [
      {
        ...PROJECT.someday,
        name: "Someday",
        meta: ["since 10.2025", "drivers for LARP game devices"],
        points: [
          "11 driver libraries power 6 device firmwares.",
          "At the 2026 game about 30 players completed the location's quests; a device runs 18–20 hours on two 18650 batteries.",
        ],
        metrics: [],
      },
      {
        ...PROJECT.tamrielCodex,
        name: "Tamriel Codex",
        meta: ["10 days", "offline player reference"],
        points: [
          "Android and Windows from a single codebase, local SQLite database, search across 11 sections.",
          "Note sharing via QR without internet. Released right on the game date.",
        ],
        metrics: [],
      },
    ],
  },
  ai: {
    title: "AI IN DEVELOPMENT",
    text: "Idodom, a 3D furniture configurator (FastAPI, three.js), built in a week with a pipeline of Claude Code agents. My part: specs for the agents, the pipeline design and the decisions. A separate agent writes tests before the code, and each stage is accepted by a single reviewer.",
    metrics: [
      { ...STAT.aiTasks, label: "tasks" },
      { ...STAT.aiHours, unit: " h", label: "of agent work" },
      { ...STAT.aiLines, label: "lines of code" },
      { ...STAT.aiTokens, label: "tokens per task" },
    ],
  },
  facts: [
    {
      id: "education",
      title: "EDUCATION",
      lines: ["RSSU, 2023"],
      note: "Information Systems and Technologies in Economics",
    },
    {
      id: "languages",
      title: "LANGUAGES",
      lines: ["Russian — native", "English — A2, read technical documentation fluently"],
    },
    {
      id: "format",
      title: "WORK FORMAT",
      lines: ["Remote, hybrid, on-site"],
      note: "Full-time, part-time",
    },
  ],
} satisfies ResumeInfographicFile;

export default resumeInfographic;

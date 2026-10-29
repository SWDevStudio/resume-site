import type {
  InfographicChange,
  InfographicJob,
  InfographicNote,
  InfographicProject,
  InfographicRole,
  InfographicStackGroup,
  InfographicStat,
  InfographicTarget,
  InfographicTimeline,
} from "../../api/types/resumeInfographic";

export const INFOGRAPHIC_HEADLINE = "Fullstack Developer · Frontend Team Lead";

export const INFOGRAPHIC_ROLE_LABELS = {
  frontend: "Frontend",
  fullstack: "Fullstack",
  lead: "Lead",
} satisfies Record<InfographicRole, string>;

export const INFOGRAPHIC_TIMELINE = {
  from: 2019,
  to: 2026,
  now: { year: 2026, month: 10 },
} satisfies InfographicTimeline;

type JobCanon = Pick<InfographicJob, "id" | "title" | "role" | "start" | "end">;

export const INFOGRAPHIC_JOBS = {
  freedom: {
    id: "freedom",
    title: "Frontend Team Lead",
    role: "lead",
    start: { year: 2026, month: 3 },
    end: null,
  },
  freelance: {
    id: "freelance",
    title: "Fullstack",
    role: "fullstack",
    start: { year: 2025, month: 3 },
    end: { year: 2025, month: 4 },
  },
  brendmart: {
    id: "brendmart",
    title: "Fullstack",
    role: "fullstack",
    start: { year: 2025, month: 1 },
    end: { year: 2026, month: 3 },
  },
  pochtoy: {
    id: "pochtoy",
    title: "Fullstack",
    role: "fullstack",
    start: { year: 2023, month: 10 },
    end: { year: 2025, month: 1 },
  },
  cdekMarket: {
    id: "cdek-market",
    title: "Middle Frontend",
    role: "frontend",
    start: { year: 2021, month: 10 },
    end: { year: 2023, month: 10 },
  },
  toTheMoon: {
    id: "to-the-moon",
    title: "Fullstack",
    role: "fullstack",
    start: { year: 2021, month: 4 },
    end: { year: 2021, month: 10 },
  },
  amigoweb: {
    id: "amigoweb",
    title: "Junior Frontend",
    role: "frontend",
    start: { year: 2019, month: 4 },
    end: { year: 2021, month: 4 },
  },
} satisfies Record<string, JobCanon>;

export const INFOGRAPHIC_STACK = [
  {
    name: "Frontend",
    items: [
      "Vue 3",
      "Nuxt 3/4",
      "React 19",
      "Next.js 16 (App Router)",
      "TypeScript",
      "Pinia",
      "Zustand",
      "Tailwind CSS 4",
    ],
  },
  { name: "Backend", items: ["Laravel", "NestJS", "Node.js", "Express", "PostgreSQL", "Docker"] },
  {
    name: "Testing",
    items: ["Vitest", "Testing Library", "Cypress", "Playwright", "Storybook", "Lighthouse"],
  },
  { name: "Mobile", items: ["Capacitor", "Electron", "Codemagic"] },
  { name: "AI", items: ["Claude Code", "Codex", "skills", "MCP"] },
] satisfies InfographicStackGroup[];

type ProjectCanon = Pick<InfographicProject, "id" | "stack">;

export const INFOGRAPHIC_PROJECTS = {
  dobro: { id: "dobro", stack: ["Next.js 16", "React 19", "Zustand", "SWR"] },
  hector: { id: "hector", stack: ["Vue 3", "Capacitor", "Codemagic"] },
  brendmart: { id: "brendmart", stack: ["Nuxt 3/4", "Laravel", "Tailwind", "daisyUI"] },
  qwixit: { id: "qwixit", stack: ["Vue 3", "TypeScript", "Laravel", "Blade"] },
  flyPost: { id: "fly-post", stack: ["Vue 3", "NestJS", "PostgreSQL", "Docker", "GitLab CI"] },
  cdekMarket: { id: "cdek-market", stack: ["Vue 2", "Vuex", "Cypress", "Jest", "Blade"] },
  toTheMoon: { id: "to-the-moon", stack: ["React", "Node.js", "Express", "PostgreSQL"] },
  amigoweb: { id: "amigoweb", stack: ["Vue 2", "Nuxt 2", "JavaScript"] },
  someday: { id: "someday", stack: ["C++", "ESP32", "FreeRTOS", "PlatformIO"] },
  tamrielCodex: { id: "tamriel-codex", stack: ["Vue 3", "Capacitor", "Electron", "SQLite"] },
} satisfies Record<string, ProjectCanon>;

type ChangeCanon = Omit<InfographicChange, "label">;
type TargetCanon = Omit<InfographicTarget, "label" | "targetLabel">;
type StatCanon = Omit<InfographicStat, "label">;

export const INFOGRAPHIC_CHANGES = {
  dobroRps: { kind: "change", before: 340, after: 4552, show: "values" },
  dobroLatency: { kind: "change", before: 919, after: 69, show: "values" },
  dobroHtml: { kind: "change", before: 254, after: 169, show: "values" },
  dobroImages: { kind: "change", before: 13, after: 1.4, show: "values" },
  pochtoyBundle: { kind: "change", before: 930, after: 700, show: "values", approx: true },
  cdekRegressions: { kind: "change", before: 100, after: 63, show: "delta" },
  cdekLoadTime: { kind: "change", before: 100, after: 73, show: "delta" },
} satisfies Record<string, ChangeCanon>;

export const INFOGRAPHIC_TARGETS = {
  qwixitOrders: { kind: "target", max: 500, target: 300, from: 300, to: 500 },
} satisfies Record<string, TargetCanon>;

export const INFOGRAPHIC_STATS = {
  hectorScreens: { kind: "stat", value: 26 },
  hectorComponents: { kind: "stat", value: 55 },
  hectorTests: { kind: "stat", value: 1700, approx: true },
  brendmartLaunch: { kind: "stat", value: 4, approx: true },
  brendmartOrders: { kind: "stat", value: 600, plus: true },
  brendmartProducts: { kind: "stat", value: 2, plus: true },
  brendmartUsers: { kind: "stat", value: 160, unit: "k", approx: true },
  pochtoyParcels: { kind: "stat", value: 7000, plus: true },
  flyPostMvp: { kind: "stat", value: 5, approx: true },
  flyPostTeam: { kind: "stat", value: 2 },
  aiTasks: { kind: "stat", value: 197 },
  aiHours: { kind: "stat", value: 71 },
  aiLines: { kind: "stat", value: 38, unit: "k", approx: true },
  aiTokens: { kind: "stat", value: -35, unit: "%", accent: true },
} satisfies Record<string, StatCanon>;

export const INFOGRAPHIC_NOTES = {
  dobro: {
    kind: "note",
    lines: [
      "autocannon, prod build",
      "Lighthouse, 37 pages: A11y 100 · BP 100 · SEO 100 · Perf 90+",
    ],
  },
  cdekMarket: { kind: "note", lines: ["LCP ≤ 2.5 s · INP ≤ 200 ms · CLS ≤ 0.1"] },
} satisfies Record<string, InfographicNote>;

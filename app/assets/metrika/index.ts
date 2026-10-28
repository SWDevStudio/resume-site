import { MetrikaGoal, type MetrikaGoalId } from "./goals";

const TAG_URL = "https://mc.yandex.ru/metrika/tag.js";

interface PendingHit {
  url: string;
  referer: string;
}

interface PendingGoal {
  goal: MetrikaGoalId;
  params?: YandexMetrikaGoalParams;
}

let counter: number | null = null;
let pending: PendingHit | null = null;
const pendingGoals: PendingGoal[] = [];

function createQueue(): YandexMetrika {
  const queue: unknown[][] = [];
  const enqueue = (...args: unknown[]) => {
    queue.push(args);
  };
  return Object.assign(enqueue, { a: queue, l: Date.now() });
}

function sendGoal(id: number, { goal, params }: PendingGoal) {
  window.ym?.(id, "reachGoal", goal, params);
}

function reachGoal(goal: MetrikaGoalId, params?: YandexMetrikaGoalParams) {
  const id = counter;
  if (id === null) return;
  if (pending) {
    pendingGoals.push({ goal, params });
    return;
  }
  setTimeout(() => sendGoal(id, { goal, params }), 0);
}

function init(id: number) {
  counter = id;
  window.ym ||= createQueue();
  window.ym(id, "init", {
    ssr: true,
    webvisor: true,
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    referrer: document.referrer,
    url: location.href,
  });
}

function loadTag() {
  if (counter === null) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `${TAG_URL}?id=${counter}`;
  document.head.append(script);
}

function navigate(url: string, referer: string) {
  pending = url === referer ? null : { url, referer };
}

function hit() {
  const id = counter;
  if (id === null || !pending) return;
  const { url, referer } = pending;
  pending = null;
  const goals = pendingGoals.splice(0);
  setTimeout(() => {
    window.ym?.(id, "hit", url, { referer, title: document.title });
    goals.forEach((goal) => sendGoal(id, goal));
  }, 0);
}

const skills = {
  openAll() {
    reachGoal(MetrikaGoal.skillsOpen);
  },
};

const projects = {
  viewSection() {
    reachGoal(MetrikaGoal.portfolioView);
  },
  viewList() {
    reachGoal(MetrikaGoal.projectsPage);
  },
  viewCase(slug: string) {
    reachGoal(MetrikaGoal.projectView, { slug });
  },
};

export const $metrika = { init, loadTag, navigate, hit, skills, projects };

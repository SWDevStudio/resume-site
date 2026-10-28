declare global {
  interface YandexMetrikaInitOptions {
    ssr?: boolean;
    webvisor?: boolean;
    clickmap?: boolean;
    trackLinks?: boolean;
    accurateTrackBounce?: boolean;
    referrer?: string;
    url?: string;
  }

  interface YandexMetrikaHitOptions {
    referer?: string;
    title?: string;
  }

  type YandexMetrikaGoalParams = Record<string, unknown>;

  interface YandexMetrika {
    (counter: number, method: "init", options: YandexMetrikaInitOptions): void;
    (counter: number, method: "hit", url: string, options?: YandexMetrikaHitOptions): void;
    (counter: number, method: "reachGoal", goal: string, params?: YandexMetrikaGoalParams): void;
    a?: unknown[][];
    l?: number;
  }

  interface Window {
    ym?: YandexMetrika;
  }
}

export {};

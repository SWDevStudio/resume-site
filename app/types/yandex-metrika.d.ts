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

  interface YandexMetrika {
    (counter: number, method: "init", options: YandexMetrikaInitOptions): void;
    (counter: number, method: "hit", url: string, options?: YandexMetrikaHitOptions): void;
    a?: unknown[][];
    l?: number;
  }

  interface Window {
    ym?: YandexMetrika;
  }
}

export {};

import { consola } from "consola";

const logger = consola.withTag("assistant");

export interface FailureLog {
  add(stage: string, failures: string[]): void;
  flush(): void;
}

export function createFailureLog(): FailureLog {
  const entries: string[] = [];
  return {
    add(stage, failures) {
      entries.push(...failures.map((failure) => `${stage}: ${failure}`));
    },
    flush() {
      if (entries.length > 0) logger.warn(entries.join("; "));
    },
  };
}

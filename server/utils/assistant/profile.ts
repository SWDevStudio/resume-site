import type { AssistantLanguage } from "./contract";

export interface DeveloperProfile {
  name: string;
  text: string;
}

export type ProfileSource = (
  language: AssistantLanguage,
) => DeveloperProfile | Promise<DeveloperProfile>;

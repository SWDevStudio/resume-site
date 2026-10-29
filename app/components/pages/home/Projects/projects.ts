import type { Tone } from "~/assets/api/types/catalog";

export interface ProjectToneClasses {
  cardClass:
    "home-projects-card-primary" | "home-projects-card-secondary" | "home-projects-card-accent";
  dotClass:
    "home-projects-dot-primary" | "home-projects-dot-secondary" | "home-projects-dot-accent";
  button: "btn-primary" | "btn-secondary" | "btn-accent";
}

export const projectTones: Record<Tone, ProjectToneClasses> = {
  primary: {
    cardClass: "home-projects-card-primary",
    dotClass: "home-projects-dot-primary",
    button: "btn-primary",
  },
  secondary: {
    cardClass: "home-projects-card-secondary",
    dotClass: "home-projects-dot-secondary",
    button: "btn-secondary",
  },
  accent: {
    cardClass: "home-projects-card-accent",
    dotClass: "home-projects-dot-accent",
    button: "btn-accent",
  },
};

const TONE_CYCLE: Tone[] = ["primary", "secondary", "accent"];

export function cycleTones(count: number): Tone[] {
  const tones = Array.from({ length: count }, (_, index) => TONE_CYCLE[index % TONE_CYCLE.length]!);
  const first = tones[0];
  const previous = tones.at(-2);
  if (count > 2 && tones.at(-1) === first) {
    tones[count - 1] = TONE_CYCLE.find((tone) => tone !== first && tone !== previous)!;
  }
  return tones;
}

import "./pageTone.css";

export type PageTone = "primary" | "secondary" | "accent";

export function pageToneClass(tone: PageTone) {
  return ["page-tone", `page-tone-${tone}`];
}

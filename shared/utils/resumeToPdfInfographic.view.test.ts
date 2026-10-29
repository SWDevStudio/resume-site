import { describe, expect, it } from "vitest";
import { LOCALES } from "~/assets/const";
import { buildResume, buildResumeInfographic } from "../../app/assets/api/mock/build";
import { staticSources } from "../../app/assets/api/mock/sources.static";
import type { CanvasRect, Content } from "pdfmake/interfaces";
import type {
  InfographicProject,
  InfographicRole,
  ResumeInfographic,
} from "../../app/assets/api/types/resumeInfographic";
import enInfographic from "../../app/assets/data/en/resumeInfographic";
import ruInfographic from "../../app/assets/data/ru/resumeInfographic";
import { resumeToPdf } from "./resumeToPdf";
import {
  PDF_INFOGRAPHIC_FONTS,
  PDF_INFOGRAPHIC_PALETTE,
  resumeToPdfInfographic,
} from "./resumeToPdfInfographic";
import { RESUME_PDF_VARIANT, resumePdfDocument, type ResumePdfInput } from "./resumePdfVariant";

type Locale = (typeof LOCALES)[number];

const sources = staticSources();

const entries = LOCALES.map((locale) => ({
  locale,
  data: buildResumeInfographic(sources, locale),
}));

const ROLE_COLOR: Record<InfographicRole, string> = {
  frontend: PDF_INFOGRAPHIC_PALETTE.before,
  fullstack: PDF_INFOGRAPHIC_PALETTE.fullstack,
  lead: PDF_INFOGRAPHIC_PALETTE.accent,
};

const HIDDEN_KEYS = new Set(["id", "kind", "show", "role", "href", "job"]);

const COLOR_KEYS = new Set(["color", "lineColor", "markerColor"]);

function strings(value: unknown, key = ""): string[] {
  if (typeof value === "string") return HIDDEN_KEYS.has(key) || !value.trim() ? [] : [value];
  if (Array.isArray(value)) return value.flatMap((item) => strings(item, key));
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([name, child]) => strings(child, name));
  }
  return [];
}

function inline(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(inline).join("");
  if (value !== null && typeof value === "object" && "text" in value) return inline(value.text);
  return "";
}

function collect(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collect);
  if (value !== null && typeof value === "object") {
    const values = Object.values(value).flatMap(collect);
    return "text" in value && Array.isArray(value.text) ? [inline(value.text), ...values] : values;
  }
  return [];
}

function textOf(value: unknown) {
  return collect(value).join("\n");
}

function nodes(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (value === null || typeof value !== "object") return [];
  return [value as Record<string, unknown>, ...Object.values(value).flatMap(nodes)];
}

function rects(value: unknown): CanvasRect[] {
  return nodes(value)
    .flatMap((node) => (Array.isArray(node.canvas) ? (node.canvas as CanvasRect[]) : []))
    .filter((element) => element.type === "rect");
}

function colors(value: unknown): string[] {
  return nodes(value).flatMap((node) =>
    Object.entries(node)
      .filter(([key, child]) => COLOR_KEYS.has(key) && typeof child === "string")
      .map(([, child]) => child as string),
  );
}

function pages(content: Content[]) {
  const starts = content.flatMap((node, index) =>
    (node as { pageBreak?: string }).pageBreak === "before" ? [index] : [],
  );
  return [0, ...starts].map((start, index) => content.slice(start, starts[index] ?? undefined));
}

function blockOf(content: Content[], project: InfographicProject) {
  return nodes(content).find(
    (node) =>
      node.unbreakable === true &&
      textOf(node).includes(project.name) &&
      textOf(node).includes(project.points[0]!),
  );
}

function paths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) return value.flatMap((item) => paths(item, `${prefix}[]`));
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => paths(child, `${prefix}.${key}`));
  }
  return [`${prefix}:${value === null ? "null" : typeof value}`];
}

function input(locale: Locale, calls: string[] = []): ResumePdfInput {
  return {
    locale,
    siteUrl: `https://example.com/${locale}/resume`,
    resume: () => {
      calls.push("resume");
      return buildResume(sources, locale);
    },
    infographic: () => {
      calls.push("infographic");
      return buildResumeInfographic(sources, locale);
    },
  };
}

describe("resume infographic data", () => {
  it("keeps the same shape of the Russian and the English file", () => {
    expect([...new Set(paths(ruInfographic))].sort()).toEqual(
      [...new Set(paths(enInfographic))].sort(),
    );
  });

  it.each(entries)(
    "takes the name and the article link of $locale from the resume",
    ({ locale, data }) => {
      const resume = buildResume(sources, locale);

      expect(data.name).toBe(`${resume.profile.firstName} ${resume.profile.lastName}`);
      expect(data.ai.link).toEqual(resume.ai.link);
    },
  );

  it.each(entries)(
    "keeps the jobs of $locale in the ids and the order of the resume",
    ({ locale, data }) => {
      const resume = buildResume(sources, locale);

      expect(data.experience.jobs.map((job) => job.id)).toEqual(
        resume.experience.jobs.map((job) => job.id),
      );
    },
  );
});

describe.each(entries)("resumeToPdfInfographic of $locale", ({ locale, data }) => {
  const definition = resumeToPdfInfographic(data, locale);
  const content = definition.content as Content[];
  const text = textOf(content);
  const [first = [], second = [], third = []] = pages(content);

  it("describes an A4 document with the Plex fonts and without a footer", () => {
    expect(definition.pageSize).toBe("A4");
    expect(definition.defaultStyle).toMatchObject({ font: PDF_INFOGRAPHIC_FONTS.sans });
    expect(definition.language).toBe(locale === "ru" ? "ru-RU" : "en-US");
    expect(definition.info).toMatchObject({ title: `${data.name} — ${data.headline}` });
    expect(definition.footer).toBeUndefined();
    expect(definition.header).toBeUndefined();
  });

  it("splits the content into three pages that start with a page break", () => {
    expect(pages(content)).toHaveLength(3);
    expect(textOf(first)).toContain(data.name);
    expect(textOf(first)).toContain(data.experience.total);
    expect(textOf(second)).toContain(`${data.name} · 2`);
    expect(textOf(third)).toContain(`${data.name} · 3`);
    for (const fact of data.facts) expect(textOf(third)).toContain(fact.title);
  });

  it("puts the main projects on the second page in the order of the timeline", () => {
    const own = textOf(second);
    const names = data.projects.main.map((project) => project.name);

    expect(names).toEqual([
      "dobro.ru",
      "Hector",
      "brendmart.com, taobao.at",
      "Qwixit, pochtoy.com",
    ]);
    const positions = names.map((name) => own.indexOf(name));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    for (const project of [...data.projects.more, ...data.projects.earlier]) {
      expect(own).not.toContain(project.points[0]);
    }
  });

  it("puts the other projects, the own products and the AI section on the third page", () => {
    const own = textOf(third);

    for (const project of [
      ...data.projects.more,
      ...data.projects.earlier,
      ...data.products.items,
    ]) {
      expect(own).toContain(project.name);
    }
    expect(own).toContain(data.products.title);
    expect(own).toContain(data.ai.text);
  });

  it("keeps every project in one unbreakable block", () => {
    for (const project of [
      ...data.projects.main,
      ...data.projects.more,
      ...data.projects.earlier,
      ...data.products.items,
    ]) {
      expect(blockOf(content, project), project.name).toBeDefined();
    }
  });

  it("draws a bar chart for every change and every target of a project", () => {
    for (const project of [...data.projects.main, ...data.projects.more]) {
      const charts = project.metrics.filter(
        (metric) => metric.kind === "change" || metric.kind === "target",
      );
      const accent = rects(blockOf(content, project)).filter(
        (element) => element.color === PDF_INFOGRAPHIC_PALETTE.accent,
      );

      expect(accent, project.name).toHaveLength(charts.length);
    }
    expect(rects(blockOf(content, data.projects.main[0]!)).length).toBeGreaterThan(0);
  });

  it("draws no chart for a project without metrics", () => {
    for (const project of [...data.projects.earlier, ...data.products.items]) {
      expect(project.metrics).toEqual([]);
      expect(rects(blockOf(content, project))).toEqual([]);
    }
  });

  it("draws a bar for every job in the color of its role, later jobs further right", () => {
    const bars = rects(first).filter(
      (element) => element.h === 6 && element.color !== PDF_INFOGRAPHIC_PALETTE.track,
    );
    const starts = bars.map((element) => element.x);

    expect(bars.map((element) => element.color)).toEqual(
      data.experience.jobs.map((job) => ROLE_COLOR[job.role]),
    );
    expect(starts).toEqual([...starts].sort((a, b) => b - a));
    for (const bar of bars) expect(bar.w).toBeGreaterThan(0);
  });

  it("writes the period of a job from its dates", () => {
    const present = locale === "ru" ? "н. в." : "present";

    expect(text).toContain(`Frontend Team Lead · 03.2026 — ${present}`);
    expect(text).toContain("Fullstack · 03 — 04.2025");
    expect(text).toContain("Fullstack · 01.2025 — 03.2026");
  });

  it("writes the values of the metrics in the format of the language", () => {
    const decimal = locale === "ru" ? "1,4" : "1.4";

    expect(text).toContain("340 → 4552");
    expect(text).toContain(`13 → ${decimal}`);
    expect(text).toContain("930 → ~700");
    expect(text).toContain("−37%");
    expect(text).toContain("−27%");
    expect(text).toContain("300–500");
    expect(text).toContain("~160k");
    expect(text).toContain("7000+");
    expect(text).toContain("−35%");
  });

  it("uses only the colors of the palette", () => {
    const palette: string[] = Object.values(PDF_INFOGRAPHIC_PALETTE);

    expect(colors(content).filter((color) => !palette.includes(color))).toEqual([]);
  });

  it("does not lose a single text of the data", () => {
    const missing = strings(data).filter((item) => !text.includes(item));

    expect(missing).toEqual([]);
  });

  it("makes the contacts and the article clickable", () => {
    const links = nodes(content).flatMap((node) =>
      typeof node.link === "string" ? [node.link] : [],
    );

    expect(links).toEqual(
      expect.arrayContaining([
        ...data.contacts.flatMap((contact) => (contact.href ? [contact.href] : [])),
        data.ai.link!.href,
      ]),
    );
  });
});

describe("resumePdfDocument", () => {
  it("builds the infographic while the constant is set to it", () => {
    expect(RESUME_PDF_VARIANT).toBe("infographic");
  });

  it.each(LOCALES)("follows the constant for %s", (locale) => {
    expect(resumePdfDocument(input(locale))).toEqual(
      resumePdfDocument(input(locale), RESUME_PDF_VARIANT),
    );
  });

  it.each(LOCALES)("builds the infographic generator for %s", (locale) => {
    const calls: string[] = [];
    const data: ResumeInfographic = buildResumeInfographic(sources, locale);

    expect(resumePdfDocument(input(locale, calls), "infographic")).toEqual(
      resumeToPdfInfographic(data, locale),
    );
    expect(calls).toEqual(["infographic"]);
  });

  it.each(LOCALES)("builds the text generator for %s", (locale) => {
    const calls: string[] = [];

    expect(resumePdfDocument(input(locale, calls), "text")).toEqual(
      resumeToPdf(buildResume(sources, locale), locale, `https://example.com/${locale}/resume`),
    );
    expect(calls).toEqual(["resume"]);
  });
});

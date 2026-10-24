import { describe, expect, it } from "vitest";
import { LOCALES } from "~/assets/const";
import { buildProjects, buildResume, buildSkillGroups } from "../../app/assets/api/mock/build";
import { staticSources } from "../../app/assets/api/mock/sources.static";
import type { ProjectView, SkillGroupView } from "../../app/assets/api/types/catalog";
import type { ResumeData } from "../../app/assets/api/types/resume";
import { resumeToMarkdown } from "./resumeToMarkdown";
import { resumeToPdf } from "./resumeToPdf";

const files: Record<(typeof LOCALES)[number], ResumeData> = {
  en: buildResume(staticSources("en"), "en"),
  ru: buildResume(staticSources("ru"), "ru"),
};

const en = files.en;
const ru = files.ru;

const entries = LOCALES.map((locale) => ({ locale, data: files[locale] }));

const groupsOf = (locale: (typeof LOCALES)[number]): SkillGroupView[] =>
  buildSkillGroups(staticSources(locale), locale);

const projectsOf = (locale: (typeof LOCALES)[number]): ProjectView[] =>
  buildProjects(staticSources(locale), locale);

const SKIPPED_KEYS = new Set(["id", "index"]);

function strings(value: unknown, key = ""): string[] {
  if (typeof value === "string") {
    if (SKIPPED_KEYS.has(key)) return [];
    if (key === "label" && /^\d{2} — /.test(value)) return [];
    return value.trim() ? [value] : [];
  }
  if (Array.isArray(value)) return value.flatMap((item) => strings(item, key));
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([name, child]) => strings(child, name));
  }
  return [];
}

function collect(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collect);
  if (value !== null && typeof value === "object") return Object.values(value).flatMap(collect);
  return [];
}

function headings(markdown: string, level: number) {
  const prefix = `${"#".repeat(level)} `;
  return markdown
    .split("\n")
    .filter((line) => line.startsWith(prefix))
    .map((line) => line.slice(prefix.length));
}

describe.each(entries)("resumeToMarkdown of $locale", ({ locale, data }) => {
  const markdown = resumeToMarkdown(data);
  const plain = markdown.replaceAll("\\", "");

  it("names every group and every skill of the registry of the skills", () => {
    for (const group of groupsOf(locale)) {
      expect(plain).toContain(group.name);
      for (const skill of group.skills) expect(plain).toContain(skill.name);
    }
  });

  it("writes one line for every group with its skills in the order of the registry", () => {
    for (const group of groupsOf(locale)) {
      expect(plain).toContain(
        `- **${group.name}:** ${group.skills.map((skill) => skill.name).join(", ")}`,
      );
    }
  });

  it("starts with the name as the only first level heading and ends with a line break", () => {
    expect(headings(markdown, 1)).toEqual([`${data.profile.firstName} ${data.profile.lastName}`]);
    expect(markdown.startsWith(`# ${data.profile.firstName} ${data.profile.lastName}\n`)).toBe(
      true,
    );
    expect(markdown.endsWith("\n")).toBe(true);
    expect(markdown.endsWith("\n\n")).toBe(false);
  });

  it("has a second level heading for every section in the order of the page", () => {
    expect(headings(markdown, 2)).toEqual([
      data.summary.name,
      data.skills.name,
      data.projects.name,
      data.experience.name,
      data.education.name,
      data.additional.name,
      data.ai.name,
      data.personal.name,
      data.references.name,
    ]);
  });

  it("has a heading for every job and every project", () => {
    expect(headings(markdown, 3)).toEqual(
      [
        ...data.projects.items.map((item) => item.name),
        ...data.experience.jobs.map((job) => job.company),
        ...data.personal.items.map((item) => item.name),
      ].map((name) => expect.stringContaining(name)),
    );
    expect(headings(markdown, 4)).toHaveLength(
      data.experience.jobs.reduce((sum, job) => sum + (job.projects.length ? 4 : 3), 0),
    );
  });

  it("names every company, title, skill, project and contact from the JSON", () => {
    for (const job of data.experience.jobs) {
      expect(plain).toContain(job.company);
      expect(plain).toContain(job.title);
    }
    for (const group of data.skills.groups) {
      expect(plain).toContain(group.name);
      for (const skill of group.skills) expect(plain).toContain(skill.name);
    }
    for (const item of data.projects.items) expect(plain).toContain(item.name);
    for (const contact of data.profile.contacts) expect(plain).toContain(contact.value);
  });

  it("writes the name, subtitle, description, role, result, tags and link of every project of the catalog", () => {
    for (const project of projectsOf(locale)) {
      expect(plain).toContain(`### ${project.name} — `);
      if (project.host) expect(plain).toContain(`[${project.host}](${project.url})`);
      expect(plain).toContain(`*${project.subtitle}*`);
      expect(plain).toContain(project.description);
      expect(plain).toContain(project.role);
      expect(plain).toContain(project.result);
      expect(plain).toContain(project.tags.join(", "));
    }
  });

  it("does not lose a single text of the JSON", () => {
    const missing = strings(data).filter((text) => !plain.includes(text));

    expect(missing).toEqual([]);
  });

  it("writes the links of the contacts and the sites as Markdown links", () => {
    expect(markdown).toContain("[@kotaroSWQ](https://t.me/kotaroSWQ)");
    expect(markdown).toContain("[swdevstudio@gmail.com](mailto:swdevstudio@gmail.com)");
    expect(markdown).toContain("[brendmart.com](https://brendmart.com/)");
    expect(markdown).toContain("[freedomgroupint.com](https://freedomgroupint.com)");
  });

  it("escapes the Markdown characters of the text but not the underscores", () => {
    const changed = resumeToMarkdown({
      ...data,
      footer: { copyright: "a*b_c`d[e]f\\g" },
    });

    expect(changed).toContain("a\\*b_c\\`d\\[e\\]f\\\\g");
  });
});

describe("resumeToMarkdown", () => {
  it("is built from the data of the language, not from a template of one language", () => {
    const english = resumeToMarkdown(en);
    const russian = resumeToMarkdown(ru);

    expect(english).toContain("Michael Malakhov");
    expect(english).not.toContain("Михаил");
    expect(russian).toContain("Михаил Малахов");
    expect(russian).not.toContain("Michael Malakhov");
    expect(russian).toContain(ru.experience.labels.responsibilities);
  });

  it("shows a changed text of the JSON without touching the code", () => {
    const changed: ResumeData = structuredClone(en);
    changed.experience.jobs[0]!.company = "Test Company LLC";
    changed.skills.groups[0]!.skills.push({ id: "qwixit-test", name: "Qwixit Test Skill" });

    const markdown = resumeToMarkdown(changed);

    expect(markdown).toContain("### Test Company LLC — ");
    expect(markdown).toContain("Qwixit Test Skill");
  });
});

describe.each(entries)("resumeToPdf of $locale", ({ locale, data }) => {
  const definition = resumeToPdf(data, locale);
  const text = collect(definition.content).join("\n");

  it("names every group and every skill of the registry of the skills", () => {
    for (const group of groupsOf(locale)) {
      expect(text).toContain(group.name);
      for (const skill of group.skills) expect(text).toContain(skill.name);
    }
  });

  it("writes the index, name, subtitle, description, role, result, tags and link of every project of the catalog", () => {
    for (const project of projectsOf(locale)) {
      expect(text).toContain(project.index);
      expect(text).toContain(project.name);
      if (project.url) expect(text).toContain(project.url);
      expect(text).toContain(project.subtitle);
      expect(text).toContain(project.description);
      expect(text).toContain(project.role);
      expect(text).toContain(project.result);
      expect(text).toContain(project.tags.join(", "));
    }
  });

  it("describes an A4 page with the Roboto font that has the Cyrillic letters", () => {
    expect(definition.pageSize).toBe("A4");
    expect(definition.defaultStyle).toMatchObject({ font: "Roboto" });
    expect(definition.language).toBe(locale === "ru" ? "ru-RU" : "en-US");
    expect(definition.info).toMatchObject({
      title: `${data.profile.firstName} ${data.profile.lastName} — ${data.profile.role}`,
    });
  });

  it("does not lose a single text of the JSON", () => {
    const missing = strings(data).filter(
      (item) => !text.includes(item) && item !== data.footer.copyright,
    );

    expect(missing).toEqual([]);
  });

  it("makes the links of the contacts, the sites and the projects clickable", () => {
    const hrefs = collect(
      JSON.parse(JSON.stringify(definition.content), (key, value: unknown) =>
        key === "link" ? value : typeof value === "object" ? value : undefined,
      ),
    );

    expect(hrefs).toEqual(
      expect.arrayContaining([
        "https://t.me/kotaroSWQ",
        "mailto:swdevstudio@gmail.com",
        "https://brendmart.com/",
        "https://freedomgroupint.com",
      ]),
    );
  });

  it("puts the copyright and the page numbers into the footer", () => {
    const footer = definition.footer as (page: number, pages: number) => { text: string };

    expect(footer(2, 5).text).toBe(`${data.footer.copyright}  ·  2 / 5`);
  });

  it("keeps a section heading together with the first block under it", () => {
    const content = definition.content as {
      stack?: { text?: string }[];
      unbreakable?: boolean;
    }[];
    const heads = content.filter((node) => node.stack?.[0]?.text === data.skills.name);

    expect(heads).toHaveLength(1);
    expect(heads[0]!.unbreakable).toBe(true);
    expect(heads[0]!.stack!.length).toBeGreaterThan(2);
  });
});

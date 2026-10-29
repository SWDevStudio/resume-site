import { describe, expect, it } from "vitest";
import { LOCALES } from "~/assets/const";
import { buildProjects, buildResume, buildSkillGroups } from "../../app/assets/api/mock/build";
import { staticSources } from "../../app/assets/api/mock/sources.static";
import type { Content } from "pdfmake/interfaces";
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

const siteUrl = (locale: string) => `https://example.com/${locale}/resume`;

const groupsOf = (locale: (typeof LOCALES)[number]): SkillGroupView[] =>
  buildSkillGroups(staticSources(locale), locale);

const projectsOf = (locale: (typeof LOCALES)[number]): ProjectView[] =>
  buildProjects(staticSources(locale), locale).filter((project) => project.isFavorite);

const otherProjectsOf = (locale: (typeof LOCALES)[number]): ProjectView[] =>
  buildProjects(staticSources(locale), locale).filter((project) => !project.isFavorite);

const SKIPPED_KEYS = new Set(["id", "index"]);

function strings(value: unknown, key = ""): string[] {
  if (typeof value === "string") {
    if (SKIPPED_KEYS.has(key)) return [];
    if (key === "label" && /^\d{2} — /.test(value)) return [];
    return value.trim() ? [value] : [];
  }
  if (Array.isArray(value)) return value.flatMap((item) => strings(item, key));
  if (value !== null && typeof value === "object") {
    if (key === "link" && "href" in value && !value.href) return [];
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
  const linked = resumeToMarkdown(data, siteUrl(locale));
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

  it("starts with the line of the latest version when the site address is known", () => {
    const url = siteUrl(locale);

    expect(
      linked.startsWith(
        `*${data.footer.latestVersion}: [${url}](${url})*\n\n# ${data.profile.firstName} ${data.profile.lastName}\n`,
      ),
    ).toBe(true);
    expect(linked.slice(linked.indexOf("\n\n") + 2)).toBe(markdown);
    expect(markdown).not.toContain(data.footer.latestVersion);
  });

  it("has a second level heading for every section in the order of the page", () => {
    expect(headings(markdown, 2)).toEqual([
      data.summary.name,
      data.skills.name,
      data.projects.name,
      data.experience.name,
      data.cases.name,
      data.education.name,
      data.additional.name,
      data.ai.name,
      data.references.name,
    ]);
  });

  it("has a heading for every job, every project and every own product", () => {
    expect(headings(markdown, 3)).toEqual(
      [
        ...data.projects.items.map((item) => item.name),
        ...data.experience.jobs.map((job) => job.company),
        ...data.cases.items.map((item) => item.name),
      ].map((name) => expect.stringContaining(name)),
    );
    expect(headings(markdown, 4)).toHaveLength(
      data.experience.jobs.reduce((sum, job) => sum + (job.projects.length ? 4 : 3), 0),
    );
  });

  it("writes the period, role, points and stack of every own product", () => {
    expect(data.cases.items.length).toBeGreaterThan(0);
    for (const entry of data.cases.items) {
      const start = plain.indexOf(`### ${entry.name}\n`);
      const block = plain.slice(start, plain.indexOf("\n#", start + 1));

      expect(start).toBeGreaterThan(plain.indexOf(`## ${data.cases.name}\n`));
      expect(block).toContain(`*${[entry.period, entry.role].filter(Boolean).join(" · ")}*`);
      expect(block).toContain(entry.description);
      for (const point of entry.points) expect(block).toContain(`- ${point}`);
      expect(block).toContain(entry.stack.join(", "));
    }
  });

  it("writes the period of a job without a city", () => {
    for (const job of data.experience.jobs) {
      expect(plain).toContain(`*${job.period} (${job.duration})*`);
    }
  });

  it("puts the link of the AI section under its paragraphs", () => {
    const link = data.ai.link!;
    const ai = plain.slice(
      plain.indexOf(`## ${data.ai.name}`),
      plain.indexOf(`## ${data.references.name}`),
    );

    expect(ai).toContain(`[${link.label}](${link.href})`);
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

  it("writes the name, subtitle, description, role, result, tags and link of every favorite project", () => {
    for (const project of otherProjectsOf(locale)) {
      expect(plain).not.toContain(`### ${project.name} — `);
    }
    for (const project of projectsOf(locale)) {
      if (project.url) {
        expect(plain).toContain(`### ${project.name} — `);
        if (project.host) expect(plain).toContain(`[${project.host}](${project.url})`);
      } else {
        expect(plain).toContain(`### ${project.name}\n`);
        expect(plain).not.toContain(`### ${project.name} — `);
      }
      expect(plain).toContain(`*${project.subtitle}*`);
      expect(plain).toContain(project.description);
      expect(plain).toContain(project.role);
      expect(plain).toContain(project.result);
      expect(plain).toContain(project.tags.join(", "));
    }
  });

  it("writes only the name in the heading of a project without a site", () => {
    const unlinked = data.projects.items.filter((project) => !project.link.href);

    expect(unlinked.length).toBeGreaterThan(0);
    for (const project of unlinked) {
      expect(markdown).toContain(`\n### ${project.name}\n`);
      expect(markdown).not.toContain(`### ${project.name} — `);
      expect(plain).not.toContain(project.link.label);
    }
  });

  it("does not lose a single text of the JSON", () => {
    const full = linked.replaceAll("\\", "");
    const missing = strings(data).filter((text) => !full.includes(text));

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
      footer: { ...data.footer, copyright: "a*b_c`d[e]f\\g" },
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
  const linked = resumeToPdf(data, locale, siteUrl(locale));
  const linkedText = collect(linked.content).join("\n");

  it("names every group and every skill of the registry of the skills", () => {
    for (const group of groupsOf(locale)) {
      expect(text).toContain(group.name);
      for (const skill of group.skills) expect(text).toContain(skill.name);
    }
  });

  it("writes the index, name, subtitle, description, role, result, tags and link of every favorite project", () => {
    for (const project of otherProjectsOf(locale)) expect(text).not.toContain(project.subtitle);
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

  it("writes only the index and the name in the headline of a project without a site", () => {
    const unlinked = data.projects.items.filter((project) => !project.link.href);
    const headlines: { text?: unknown; style?: string }[][] = [];
    JSON.parse(JSON.stringify(definition.content), (_key, value: unknown) => {
      const parts = (value as { text?: unknown } | null)?.text;
      if (Array.isArray(parts) && parts.some((part) => part?.style === "itemTitle")) {
        headlines.push(parts);
      }
      return value;
    });

    expect(unlinked.length).toBeGreaterThan(0);
    for (const project of unlinked) {
      const headline = headlines.find((parts) => parts.some((part) => part.text === project.name));

      expect(headline?.map((part) => part.text)).toEqual([`${project.index}  `, project.name]);
      expect(text).not.toContain(project.link.label);
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
      (item) => !linkedText.includes(item) && item !== data.footer.copyright,
    );

    expect(missing).toEqual([]);
  });

  it("starts with a clickable line of the latest version only when the site address is known", () => {
    const url = siteUrl(locale);
    const [first, second] = linked.content as Content[];
    const name = `${data.profile.firstName} ${data.profile.lastName}`;

    expect((first as { text: { text: string }[] }).text.map((part) => part.text).join("")).toBe(
      `${data.footer.latestVersion}: ${url}`,
    );
    expect(JSON.stringify(first)).toContain(`"link":"${url}"`);
    expect(second).toMatchObject({ text: name });
    expect((definition.content as Content[])[0]).toMatchObject({ text: name });
    expect(text).not.toContain(data.footer.latestVersion);
  });

  it("writes the own products after the experience with their points and stack", () => {
    expect(text.indexOf(data.cases.name)).toBeGreaterThan(text.indexOf(data.experience.name));
    expect(text.indexOf(data.cases.name)).toBeLessThan(text.indexOf(data.education.name));
    for (const entry of data.cases.items) {
      expect(text).toContain(entry.name);
      if (entry.period) expect(text).toContain(entry.period);
      if (entry.role) expect(text).toContain(entry.role);
      for (const point of entry.points) expect(text).toContain(point);
      expect(text).toContain(entry.stack.join(", "));
    }
  });

  it("writes the duration of a job without a city", () => {
    const values = collect(definition.content);

    for (const job of data.experience.jobs) expect(values).toContain(job.duration);
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
        data.ai.link!.href,
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

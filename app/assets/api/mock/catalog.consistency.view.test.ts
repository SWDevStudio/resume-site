import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_LOCALE, LOCALES, Route, type Locale } from "~/assets/const";
import { projects as canonFile, projectsText } from "~/assets/data/projects";
import { resolveProjectImage } from "~/components/pages/shared/projectImage";
import type { ProjectCanon, ProjectsText, ResumeFile } from "~/assets/api/types/catalog";
import type {
  ProjectBlock,
  ProjectCaseCoverData,
  ProjectCaseHeaderData,
  ProjectCaseMetaData,
  ProjectCaseNextData,
} from "~/assets/api/types/projectCase";
import { buildCase, buildProjects, buildResume } from "~/assets/api/mock/build";
import { $api } from "~/assets/api";
import { staticSources } from "~/assets/api/mock/sources.static";

const state = vi.hoisted(() => ({ locale: "ru" }));

vi.mock("~/assets/api/locale", () => ({ resolveLocale: () => state.locale }));

beforeEach(() => {
  state.locale = "ru";
});

const canon = canonFile as ProjectCanon[];

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const CYRILLIC = /[Ѐ-ӿ]/;

const PROJECT_CANON_KEYS = ["id", "isFavorite", "name", "preview", "stack", "tags", "tone", "url"];
const PROJECT_CANON_OPTIONAL_KEYS = ["caseStack", "previewMobile"];
const PROJECT_TEXT_KEYS = ["description", "headline", "previewAlt", "result", "role", "subtitle"];
const CATALOG = [
  "qwixit",
  "brendmart",
  "taobao",
  "pochtoy-prostobox",
  "cdek-shopping",
  "fly-post",
  "tamriel-codex",
  "someday",
];
const TEXT_KEYS = [
  "subtitle",
  "description",
  "previewAlt",
  "role",
  "result",
  "headline",
  "title",
  "city",
  "field",
  "text",
];

const resumeFiles = import.meta.glob<ResumeFile>("../../data/*/resume.ts", {
  eager: true,
  import: "default",
});

function byLocale<T>(files: Record<string, T>) {
  return Object.entries(files).map(([path, data]) => ({
    locale: /\/data\/([^/]+)\//.exec(path)![1]!,
    data,
  }));
}

const caseModules = import.meta.glob<ProjectBlock[]>("../../data/projects/*/{ru,en}.ts", {
  eager: true,
  import: "default",
});

const texts = Object.entries(projectsText).map(([locale, data]) => ({ locale, data }));
const resumes = byLocale(resumeFiles);
const allCaseFiles = Object.entries(caseModules).map(([path, blocks]) => ({
  locale: /\/(ru|en)\.ts$/.exec(path)![1]!,
  slug: /\/projects\/([^/]+)\//.exec(path)![1]!,
  blocks,
}));
const caseFiles = allCaseFiles.filter((file) => canon.some((project) => project.id === file.slug));

const GENERATED = ["ProjectCaseHeader", "ProjectCaseCover", "ProjectCaseMeta", "ProjectCaseNext"];
const MERGED = [...GENERATED, "ProjectCaseCta"];

function chapterIds(blocks: ProjectBlock[]): string[] {
  return blocks.flatMap((block) =>
    block.component === "ProjectCaseChapter"
      ? [
          String(block.data.id),
          ...chapterIds((block.data.blocks as ProjectBlock[] | undefined) ?? []),
        ]
      : [],
  );
}

function dataOf<T>(blocks: ProjectBlock[], component: string) {
  return blocks.find((block) => block.component === component)!.data as unknown as T;
}

function keysOf(value: object) {
  return Object.keys(value).sort();
}

function leafPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) return value.flatMap((item) => leafPaths(item, `${prefix}[]`));
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => leafPaths(child, `${prefix}.${key}`));
  }
  return [`${prefix}:${value === null ? "null" : typeof value}`];
}

function allStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(allStrings);
  if (value !== null && typeof value === "object") return Object.values(value).flatMap(allStrings);
  return [];
}

function allKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(allKeys);
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => [key, ...allKeys(child)]);
  }
  return [];
}

describe("the canon of the projects", () => {
  it("has unique kebab-case ids", () => {
    const ids = canon.map((project) => project.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(ID);
  });

  it.each(canon)("keeps only the facts of $id in the right shape", (project) => {
    const keys = keysOf(project);

    expect(keys.filter((key) => !PROJECT_CANON_OPTIONAL_KEYS.includes(key))).toEqual(
      PROJECT_CANON_KEYS,
    );
    expect(typeof project.isFavorite).toBe("boolean");
    if (project.previewMobile !== undefined) {
      expect(resolveProjectImage(project.previewMobile)).not.toBe(project.previewMobile);
    }
    expect(["primary", "secondary", "accent"]).toContain(project.tone);
    expect(project.url === null || project.url.startsWith("https://")).toBe(true);
    expect(resolveProjectImage(project.preview)).not.toBe(project.preview);
    for (const tag of project.tags) expect(tag).toMatch(ID);
    for (const ref of project.stack) {
      expect(typeof ref === "string" ? ref : ref.id).toMatch(ID);
      if (typeof ref !== "string") expect(ref.label.length).toBeGreaterThan(0);
    }
    for (const item of project.caseStack ?? []) {
      expect(["label", "own"]).toEqual(expect.arrayContaining(keysOf(item)));
      expect(item.label.trim().length).toBeGreaterThan(0);
      if (item.own !== undefined) expect(typeof item.own).toBe("boolean");
    }
  });

  it("keeps the order that sets the index and the next project", () => {
    expect(canon.map((project) => project.id)).toEqual(CATALOG);
    expect(canon[0]!.tags).toHaveLength(4);
    expect(canon[0]!.tags[3]).toBe("seo");
  });

  it("holds no text in a natural language", () => {
    expect(allStrings(canon).filter((value) => CYRILLIC.test(value))).toEqual([]);
    expect(allKeys(canon).filter((key) => TEXT_KEYS.includes(key))).toEqual([]);
  });
});

describe("the text of the projects", () => {
  it("has the Russian file that the other languages fall back to", () => {
    expect(texts.map((file) => file.locale)).toContain(DEFAULT_LOCALE);
  });

  it("has a file only for a known locale", () => {
    for (const file of texts) expect(LOCALES as readonly string[]).toContain(file.locale);
  });

  describe.each(texts)("the file of $locale", ({ data }) => {
    it("describes exactly the projects of the canon", () => {
      expect(keysOf(data.items)).toEqual(canon.map((project) => project.id).sort());
    });

    it("keeps only the text of a project and no facts", () => {
      for (const item of Object.values(data.items)) expect(keysOf(item)).toEqual(PROJECT_TEXT_KEYS);
      expect(keysOf(data)).toEqual(["items", "linkPlaceholder", "tags"]);
    });

    it("labels every tag the canon uses and keeps no unused one", () => {
      const used = [...new Set(canon.flatMap((project) => project.tags))].sort();

      expect(keysOf(data.tags)).toEqual(used);
      for (const label of Object.values(data.tags)) expect(label.length).toBeGreaterThan(0);
    });
  });

  it("keeps the same schema in every language", () => {
    const base = texts.find((file) => file.locale === DEFAULT_LOCALE)!;
    const schema = (data: ProjectsText) => [...new Set(leafPaths(data))].sort();
    const keys = (data: ProjectsText) =>
      Object.fromEntries(Object.entries(data.items).map(([id, item]) => [id, keysOf(item)]));

    for (const file of texts) {
      expect(schema(file.data)).toEqual(schema(base.data));
      expect(keys(file.data)).toEqual(keys(base.data));
      expect(keysOf(file.data.tags)).toEqual(keysOf(base.data.tags));
    }
  });
});

describe("the resume files and the canon", () => {
  it.each(resumes)(
    "keeps only the head of the projects section in the file of $locale",
    ({ data }) => {
      expect(keysOf(data.projects)).toEqual(["id", "label", "name"]);
      expect(allKeys(data.projects)).not.toContain("items");
    },
  );

  it("has the same ids of jobs in every language", () => {
    const ids = (data: ResumeFile) => data.experience.jobs.map((job) => job.id);
    const base = resumes.find((file) => file.locale === DEFAULT_LOCALE)!;

    for (const file of resumes) expect(ids(file.data)).toEqual(ids(base.data));
  });
});

describe.each(LOCALES)("the projects built for %s", (locale: Locale) => {
  const list = buildProjects(staticSources(locale), locale);
  const text = texts.find((file) => file.locale === locale)!.data;

  it("follows the canon in the order, the index and the facts", () => {
    expect(list.map((project) => project.id)).toEqual(canon.map((project) => project.id));
    list.forEach((project, position) => {
      expect(project.index).toBe(String(position + 1).padStart(2, "0"));
      expect(project.name).toBe(canon[position]!.name);
      expect(project.url).toBe(canon[position]!.url);
      expect(project.tone).toBe(canon[position]!.tone);
      expect(project.preview).toBe(canon[position]!.preview);
    });
  });

  it("takes the text of the project and the labels of its tags from the file of the locale", () => {
    list.forEach((project, position) => {
      const item = text.items[project.id]!;

      expect(project.subtitle).toBe(item.subtitle);
      expect(project.description).toBe(item.description);
      expect(project.previewAlt).toBe(item.previewAlt);
      expect(project.tags).toEqual(canon[position]!.tags.map((tag) => text.tags[tag]));
    });
  });

  it("gives Qwixit four tags with SEO the fourth, of which a card shows the first three", () => {
    const qwixit = list.find((project) => project.id === "qwixit")!;

    expect(qwixit.tags).toHaveLength(4);
    expect(qwixit.tags[3]).toBe(text.tags.seo);
    expect(qwixit.tags.slice(0, 3)).toEqual([
      text.tags["e-commerce"],
      text.tags["full-stack"],
      text.tags.payments,
    ]);
    expect(qwixit.tags.slice(0, 3)).not.toContain(text.tags.seo);
  });

  it("derives the projects of the resume from the same list, text of the card included", () => {
    const items = buildResume(staticSources(locale), locale).projects.items;
    expect(items).toHaveLength(list.length);
    list.forEach((project, position) => {
      const item = items[position]!;

      expect(item.id).toBe(project.id);
      expect(item.name).toBe(project.name);
      expect(item.index).toBe(project.index);
      expect(item.link.href).toBe(project.url);
      expect(item.link.label).toBe(project.host ?? text.linkPlaceholder);
      expect(item.subtitle).toBe(project.subtitle);
      expect(item.description).toBe(project.description);
      expect(item.role).toBe(project.role);
      expect(item.result).toBe(project.result);
      expect(item.tags).toEqual(project.tags);
      expect(item.tags).toEqual(canon[position]!.tags.map((tag) => text.tags[tag]));
    });
  });

  it("gives the resume the four tags of Qwixit and the placeholder instead of a missing link", () => {
    const items = buildResume(staticSources(locale), locale).projects.items;
    const tamrielCodex = items.find((item) => item.id === "tamriel-codex")!;

    expect(items.find((item) => item.id === "qwixit")!.tags).toHaveLength(4);
    expect(tamrielCodex.link).toEqual({ label: text.linkPlaceholder, href: null });
  });

  it("resolves every stack entry", () => {
    list.forEach((project, position) => {
      expect(project.stack).toHaveLength(canon[position]!.stack.length);
      for (const name of project.stack) expect(name.length).toBeGreaterThan(0);
    });
  });
});

describe("the files of the cases", () => {
  it("has a file of every project of the canon in the Russian layer", () => {
    const slugs = caseFiles
      .filter((file) => file.locale === DEFAULT_LOCALE)
      .map((file) => file.slug)
      .sort();

    expect(slugs).toEqual(canon.map((project) => project.id).sort());
    for (const file of allCaseFiles) expect(LOCALES as readonly string[]).toContain(file.locale);
  });

  it.each(caseFiles)("keeps no fact of the project in the file of $slug in $locale", (file) => {
    const components = file.blocks.map((block) => block.component);

    for (const component of GENERATED) {
      expect(components.filter((item) => item === component)).toHaveLength(1);
    }
    for (const block of file.blocks) expect(keysOf(block)).toEqual(["component", "data"]);
    for (const component of GENERATED) {
      expect(dataOf(file.blocks, component)).toEqual({});
    }
    expect(components.at(-1)).toBe("ProjectCaseNext");
  });

  it("keeps the same chapters in every language of a project", () => {
    for (const project of canon) {
      const base = caseFiles.find(
        (file) => file.locale === DEFAULT_LOCALE && file.slug === project.id,
      )!;

      for (const file of caseFiles.filter((item) => item.slug === project.id)) {
        expect(chapterIds(file.blocks)).toEqual(chapterIds(base.blocks));
        expect(file.blocks.map((block) => block.component)).toEqual(
          base.blocks.map((block) => block.component),
        );
      }
    }
  });
});

describe.each(LOCALES)("the cases built for %s", (locale: Locale) => {
  const text = texts.find((file) => file.locale === locale)!.data;

  beforeEach(() => {
    state.locale = locale;
  });

  it.each(canon.map((project) => project.id))(
    "builds the header, the cover, the meta and the next block of %s from the canon and the text",
    async (id) => {
      const position = canon.findIndex((project) => project.id === id);
      const project = canon[position]!;
      const following = canon[(position + 1) % canon.length]!;
      const blocks = (await $api.projects.fetchCase(id))!;

      expect(dataOf<ProjectCaseHeaderData>(blocks, "ProjectCaseHeader")).toEqual({
        index: String(position + 1).padStart(2, "0"),
        subtitle: text.items[id]!.subtitle,
        name: project.name,
        headline: text.items[id]!.headline,
        url: project.url,
        tone: project.tone,
      });
      expect(dataOf<ProjectCaseCoverData>(blocks, "ProjectCaseCover")).toEqual({
        image: project.preview,
        imageMobile: project.previewMobile ?? null,
        imageAlt: text.items[id]!.previewAlt,
      });
      expect(dataOf<ProjectCaseMetaData>(blocks, "ProjectCaseMeta")).toEqual({
        tags: project.tags.map((tag) => text.tags[tag]),
        stack: project.caseStack ?? [],
      });
      expect(dataOf<ProjectCaseNextData>(blocks, "ProjectCaseNext")).toEqual({
        slug: following.id,
        name: following.name,
        index: String(((position + 1) % canon.length) + 1).padStart(2, "0"),
        tone: following.tone,
      });
    },
  );

  it("gives Qwixit four tags in the meta of its case", async () => {
    const meta = dataOf<ProjectCaseMetaData>(
      (await $api.projects.fetchCase("qwixit"))!,
      "ProjectCaseMeta",
    );

    expect(meta.tags).toHaveLength(4);
    expect(meta.tags[3]).toBe(text.tags.seo);
  });

  it("keeps the order of the blocks of the file and the chapters untouched", async () => {
    for (const project of canon) {
      const blocks = (await $api.projects.fetchCase(project.id))!;
      const file = (caseFiles.find((item) => item.locale === locale && item.slug === project.id) ??
        caseFiles.find((item) => item.locale === DEFAULT_LOCALE && item.slug === project.id))!;

      expect(blocks.map((block) => block.component)).toEqual(
        file.blocks.map((block) => block.component),
      );
      expect(blocks.filter((block) => !MERGED.includes(block.component))).toEqual(
        file.blocks.filter((block) => !MERGED.includes(block.component)),
      );
    }
  });

  it("resolves every link of the projects to a case page that exists", async () => {
    for (const project of canon) {
      expect(Route.project(project.id)).toBe(`/projects/${project.id}`);
      expect(await $api.projects.fetchCase(project.id)).not.toBeNull();
    }
    expect(await $api.projects.fetchCase("nope")).toBeNull();
    expect(await $api.projects.fetchCase("../en/resume")).toBeNull();
    expect(await $api.projects.fetchCase("../projects/qwixit")).toBeNull();
  });

  it("points from the next block to a project that has a case, in a circle", async () => {
    const visited: string[] = [];
    let slug = canon[0]!.id;

    for (let step = 0; step < canon.length; step += 1) {
      visited.push(slug);
      const blocks = (await $api.projects.fetchCase(slug))!;
      slug = dataOf<ProjectCaseNextData>(blocks, "ProjectCaseNext").slug;
      expect(await $api.projects.fetchCase(slug)).not.toBeNull();
    }

    expect(visited).toEqual(canon.map((project) => project.id));
    expect(slug).toBe(canon[0]!.id);
  });
});

describe("the changes in one place", () => {
  it("reach the project list built from a renamed canon", () => {
    const sources = staticSources();
    const renamed = structuredClone(sources.projects);
    renamed[0]!.name = "Renamed";

    expect(buildProjects({ ...sources, projects: renamed }, "ru")[0]!.name).toBe("Renamed");
    expect(buildProjects(sources, "ru")[0]!.name).toBe("Qwixit");
  });

  it("reach the header and the next block of the cases built from a renamed canon", () => {
    const sources = staticSources();
    const renamed = structuredClone(sources.projects);
    renamed[0]!.name = "Renamed";
    const blocks = (id: string) => {
      const file = caseFiles.find((item) => item.locale === DEFAULT_LOCALE && item.slug === id)!;
      return buildCase(id, { ...sources, projects: renamed }, file.blocks, "ru")!;
    };

    expect(dataOf<ProjectCaseHeaderData>(blocks("qwixit"), "ProjectCaseHeader").name).toBe(
      "Renamed",
    );
    expect(dataOf<ProjectCaseNextData>(blocks(canon.at(-1)!.id), "ProjectCaseNext").name).toBe(
      "Renamed",
    );
  });
});

const builders = import.meta.glob<string>(["./build/*.ts", "./sources.static.ts"], {
  eager: true,
  import: "default",
  query: "?raw",
});

describe("the builders that the server imports", () => {
  const files = Object.entries(builders).filter(([path]) => !path.endsWith(".test.ts"));

  it("finds the builders", () => {
    expect(files.length).toBeGreaterThanOrEqual(7);
  });

  it.each(files)("%s uses only relative imports and nothing of Nuxt or Vite", (_, source) => {
    expect(source).not.toMatch(/from\s+["']~\//);
    expect(source).not.toMatch(/from\s+["']#/);
    expect(source).not.toContain("import.meta");
    expect(source).not.toMatch(/\.vue["']/);
  });
});

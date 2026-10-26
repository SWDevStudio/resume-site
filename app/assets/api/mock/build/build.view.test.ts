import { describe, expect, it } from "vitest";
import type { Locale } from "~/assets/const";
import type {
  ByLocale,
  ProjectCanon,
  ProjectsSources,
  ResumeFile,
  ResumeSources,
  SkillsCanon,
  SkillsSources,
  SkillsText,
} from "../../types/catalog";
import type { ProjectBlock } from "../../types/projectCase";
import type { ImageAsset } from "../../types/media";
import {
  buildCase,
  buildProjects,
  buildResume,
  buildSkillGroups,
  buildSkillRegistry,
  resolveStack,
} from "./index";

const canon: ProjectCanon[] = [
  {
    isFavorite: true,
    id: "alpha",
    name: "Alpha",
    tone: "primary",
    url: "https://alpha.example.com/path",
    preview: "alpha/media/preview.svg",
    tags: ["one", "two"],
    stack: ["react", { id: "next-js", label: "Next.js 16" }],
    caseStack: [{ label: "React", own: true }, { label: "Next.js 16" }],
  },
  {
    isFavorite: false,
    id: "beta",
    name: "Beta",
    tone: "accent",
    url: null,
    preview: "beta/media/preview.svg",
    tags: ["two"],
    stack: [],
  },
];

const alphaPreview: ImageAsset = {
  src: "alpha/media/preview.svg",
  width: 0,
  height: 0,
  variants: [],
};

const sources: ProjectsSources = {
  projects: canon,
  registry: { react: { name: "React" }, "next-js": { name: "Next.js" } },
  projectsText: {
    ru: {
      linkPlaceholder: "[ссылка]",
      tags: { one: "Один", two: "Два" },
      items: {
        alpha: {
          subtitle: "А",
          headline: "Х1",
          description: "А1",
          previewAlt: "Ал",
          role: "Р1",
          result: "Е1",
        },
        beta: {
          subtitle: "Б",
          headline: "Х2",
          description: "Б1",
          previewAlt: "Бе",
          role: "Р2",
          result: "Е2",
        },
      },
    },
    en: {
      linkPlaceholder: "[link]",
      tags: { one: "One" },
      items: {
        alpha: {
          subtitle: "A",
          headline: "H1",
          description: "A1",
          previewAlt: "Al",
          role: "R1",
          result: "E1",
        },
      },
    },
  },
};

describe("buildProjects", () => {
  it("keeps the order of the canon and derives the index and the host", () => {
    const list = buildProjects(sources, "ru");

    expect(list.map((project) => project.id)).toEqual(["alpha", "beta"]);
    expect(list.map((project) => project.index)).toEqual(["01", "02"]);
    expect(list.map((project) => project.host)).toEqual(["alpha.example.com", null]);
    expect(list[0]).toMatchObject({
      name: "Alpha",
      tone: "primary",
      url: "https://alpha.example.com/path",
      preview: alphaPreview,
      previewMobile: null,
      subtitle: "А",
      headline: "Х1",
      description: "А1",
      previewAlt: "Ал",
      tags: ["Один", "Два"],
      stack: ["React", "Next.js 16"],
      role: "Р1",
      result: "Е1",
    });
  });

  it("takes the images from the media resolver and keeps the path for an unknown one", () => {
    const shot: ImageAsset = {
      src: "/_nuxt/preview.webp",
      width: 1440,
      height: 900,
      variants: [
        { src: "/_nuxt/preview-480.webp", width: 480 },
        { src: "/_nuxt/preview.webp", width: 1440 },
      ],
    };
    const list = buildProjects(
      {
        ...sources,
        media: (path) => (path === "alpha/media/preview.svg" ? shot : undefined),
      },
      "ru",
    );

    expect(list.map((project) => project.preview)).toEqual([
      shot,
      { src: "beta/media/preview.svg", width: 0, height: 0, variants: [] },
    ]);
  });

  it("takes the text of the locale and falls back to the Russian one entity by entity", () => {
    const list = buildProjects(sources, "en");

    expect(list[0]).toMatchObject({ subtitle: "A", headline: "H1", tags: ["One", "Два"] });
    expect(list[1]).toMatchObject({ subtitle: "Б", headline: "Х2", tags: ["Два"] });
  });

  it("falls back to the Russian text for a locale with no file at all", () => {
    expect(buildProjects(sources, "de" as Locale)).toEqual(buildProjects(sources, "ru"));
  });

  it("throws on a project without text in every locale", () => {
    const broken: ProjectsSources = {
      ...sources,
      projects: [...canon, { ...canon[1]!, id: "gamma" }],
    };

    expect(() => buildProjects(broken, "ru")).toThrow('Project "gamma" has no text');
  });

  it("throws on a tag without a label in every locale", () => {
    const broken: ProjectsSources = {
      ...sources,
      projects: [{ ...canon[0]!, tags: ["one", "lost"] }],
    };

    expect(() => buildProjects(broken, "en")).toThrow('Tag "lost" of project "alpha"');
  });

  it("does not change the canon", () => {
    const before = structuredClone(sources);
    buildProjects(sources, "en");

    expect(sources).toEqual(before);
  });
});

describe("buildCase", () => {
  const chapter: ProjectBlock = {
    component: "ProjectCaseChapter",
    data: { id: "about", name: "About", blocks: [] },
  };
  const blocks: ProjectBlock[] = [
    { component: "ProjectCaseHeader", data: {} },
    { component: "ProjectCaseCover", data: {} },
    { component: "ProjectCaseMeta", data: {} },
    chapter,
    { component: "ProjectCaseNext", data: {} },
  ];

  it("fills the header, the cover, the meta and the next block from the canon and the text", () => {
    expect(buildCase("alpha", sources, blocks, "ru")).toEqual([
      {
        component: "ProjectCaseHeader",
        data: {
          index: "01",
          subtitle: "А",
          name: "Alpha",
          headline: "Х1",
          url: "https://alpha.example.com/path",
          tone: "primary",
        },
      },
      {
        component: "ProjectCaseCover",
        data: { image: alphaPreview, imageMobile: null, imageAlt: "Ал" },
      },
      {
        component: "ProjectCaseMeta",
        data: {
          tags: ["Один", "Два"],
          stack: [{ label: "React", own: true }, { label: "Next.js 16" }],
        },
      },
      chapter,
      {
        component: "ProjectCaseNext",
        data: { slug: "beta", name: "Beta", index: "02", tone: "accent" },
      },
    ]);
  });

  it("points the next block of the last project back to the first one", () => {
    const next = buildCase("beta", sources, blocks, "ru")!.at(-1)!;

    expect(next.data).toEqual({ slug: "alpha", name: "Alpha", index: "01", tone: "primary" });
  });

  it("gives the meta an empty stack when the project has no case stack", () => {
    expect(buildCase("beta", sources, blocks, "ru")![2]!.data).toEqual({
      tags: ["Два"],
      stack: [],
    });
  });

  it("builds the text of the locale and falls back to the Russian one", () => {
    const header = buildCase("alpha", sources, blocks, "en")![0]!;
    const meta = buildCase("alpha", sources, blocks, "en")![2]!;

    expect(header.data).toMatchObject({ subtitle: "A", headline: "H1" });
    expect(meta.data).toMatchObject({ tags: ["One", "Два"] });
  });

  it("lets the generated data win over the data of the file and keeps the rest", () => {
    const own: ProjectBlock[] = [
      { component: "ProjectCaseHeader", data: { headline: "H", name: "Own", extra: 1 } },
    ];

    expect(buildCase("alpha", sources, own, "ru")![0]!.data).toMatchObject({
      name: "Alpha",
      headline: "Х1",
      extra: 1,
    });
  });

  it("does not change the blocks of the file", () => {
    const before = structuredClone(blocks);
    buildCase("alpha", sources, blocks, "ru");

    expect(blocks).toEqual(before);
  });

  it("gives null when there is no file or no such project", () => {
    expect(buildCase("alpha", sources, null, "ru")).toBeNull();
    expect(buildCase("nope", sources, blocks, "ru")).toBeNull();
  });
});

describe("resolveStack", () => {
  it("takes the label of an object and the name of an id", () => {
    expect(
      resolveStack(["react", { id: "x", label: "Own" }], { react: { name: "React" } }),
    ).toEqual(["React", "Own"]);
  });

  it("prefers the label of the registry to its name", () => {
    expect(resolveStack(["vue"], { vue: { name: "Vue.js (long)", label: "Vue" } })).toEqual([
      "Vue",
    ]);
  });

  it("throws on an id that is not in the registry", () => {
    expect(() => resolveStack(["lost"], {})).toThrow('"lost"');
  });
});

const skillsCanon: SkillsCanon = {
  groups: [
    {
      id: "tech",
      kind: "tech",
      skills: [
        { id: "vue", kind: "tech", label: "Vue" },
        { id: "react", kind: "tech" },
      ],
    },
    { id: "soft", kind: "soft", skills: [{ id: "leadership", kind: "soft" }] },
  ],
};

const skillsText: ByLocale<SkillsText> = {
  ru: {
    groups: { tech: "Tech", soft: "Мягкие навыки" },
    skills: { vue: "Vue.js (long)", react: "React", leadership: "Лидерство" },
  },
  en: {
    groups: { soft: "Soft skills" },
    skills: { leadership: "Leadership" },
  },
};

const skillsSources: SkillsSources = { skills: skillsCanon, skillsText };

const resumes = {
  ru: {
    profile: { lastName: "ру" },
    skills: { id: "skills", label: "02", name: "Навыки" },
    projects: { id: "projects", label: "03", name: "Проекты" },
  },
  en: {
    profile: { lastName: "en" },
    skills: { id: "skills", label: "02", name: "Skills" },
    projects: { id: "projects", label: "03", name: "Projects" },
  },
} as unknown as Record<Locale, ResumeFile>;

const resumeSources: ResumeSources = { ...sources, ...skillsSources, resume: resumes };

describe("buildSkillGroups", () => {
  it("keeps the order of the canon and takes the flag terms from the kind of the group", () => {
    const groups = buildSkillGroups(skillsSources, "ru");

    expect(groups.map((group) => group.id)).toEqual(["tech", "soft"]);
    expect(groups.map((group) => group.terms)).toEqual([true, false]);
    expect(groups[0]!.skills.map((skill) => skill.id)).toEqual(["vue", "react"]);
  });

  it("takes the label of the canon and the name for a skill without a label", () => {
    expect(buildSkillGroups(skillsSources, "ru")[0]!.skills).toEqual([
      { id: "vue", name: "Vue.js (long)", label: "Vue" },
      { id: "react", name: "React", label: "React" },
    ]);
  });

  it("takes the text of the locale and falls back to the Russian one entity by entity", () => {
    const groups = buildSkillGroups(skillsSources, "en");

    expect(groups.map((group) => group.name)).toEqual(["Tech", "Soft skills"]);
    expect(groups[0]!.skills.map((skill) => skill.name)).toEqual(["Vue.js (long)", "React"]);
    expect(groups[1]!.skills.map((skill) => skill.name)).toEqual(["Leadership"]);
  });

  it("falls back to the Russian text for a locale with no file at all", () => {
    expect(buildSkillGroups(skillsSources, "de" as Locale)).toEqual(
      buildSkillGroups(skillsSources, "ru"),
    );
  });

  it("throws on a skill or a group without a name in every locale", () => {
    const noSkillName: SkillsSources = {
      ...skillsSources,
      skillsText: { ru: { groups: {}, skills: {} } },
    };
    const noGroupName: SkillsSources = {
      ...skillsSources,
      skillsText: { ru: { groups: {}, skills: skillsText.ru!.skills } },
    };

    expect(() => buildSkillGroups(noGroupName, "en")).toThrow('Skill group "tech" has no name');
    expect(() => buildSkillGroups(noSkillName, "en")).toThrow("has no name");
  });

  it("does not change the canon", () => {
    const before = structuredClone(skillsSources);
    buildSkillGroups(skillsSources, "en");

    expect(skillsSources).toEqual(before);
  });
});

describe("buildSkillRegistry", () => {
  it("lists every skill of the groups by id", () => {
    expect(buildSkillRegistry(skillsSources, "ru")).toEqual({
      vue: { name: "Vue.js (long)", label: "Vue" },
      react: { name: "React" },
      leadership: { name: "Лидерство" },
    });
  });

  it("takes the name of the locale with the Russian fallback", () => {
    expect(buildSkillRegistry(skillsSources, "en").leadership).toEqual({ name: "Leadership" });
    expect(buildSkillRegistry(skillsSources, "en").react).toEqual({ name: "React" });
  });

  it("gives resolveStack the short label of a skill and the name of one without a label", () => {
    expect(resolveStack(["vue", "react"], buildSkillRegistry(skillsSources, "en"))).toEqual([
      "Vue",
      "React",
    ]);
  });

  it("throws on a skill without a name", () => {
    const broken: SkillsSources = { ...skillsSources, skillsText: {} };

    expect(() => buildSkillRegistry(broken, "ru")).toThrow('Skill "vue" has no name');
  });
});

describe("buildResume", () => {
  it("takes the file of the locale", () => {
    expect(buildResume(resumeSources, "en").profile.lastName).toBe("en");
    expect(buildResume(resumeSources, "ru").profile.lastName).toBe("ру");
  });

  it("falls back to the Russian file", () => {
    const onlyRu: ResumeSources = { ...resumeSources, resume: { ru: resumes.ru } };

    expect(buildResume(onlyRu, "en").profile.lastName).toBe("ру");
  });

  it("throws when even the Russian file is missing", () => {
    const none: ResumeSources = { ...resumeSources, resume: {} };

    expect(() => buildResume(none, "en")).toThrow("missing");
  });

  it("fills the skill groups from the skills sources and leaves no label in them", () => {
    expect(buildResume(resumeSources, "en").skills).toEqual({
      id: "skills",
      label: "02",
      name: "Skills",
      groups: [
        {
          id: "tech",
          name: "Tech",
          terms: true,
          skills: [
            { id: "vue", name: "Vue.js (long)" },
            { id: "react", name: "React" },
          ],
        },
        {
          id: "soft",
          name: "Soft skills",
          terms: false,
          skills: [{ id: "leadership", name: "Leadership" }],
        },
      ],
    });
  });

  it("keeps the head of the projects section and fills the items from the project list", () => {
    expect(buildResume(resumeSources, "ru").projects).toEqual({
      id: "projects",
      label: "03",
      name: "Проекты",
      items: [
        {
          id: "alpha",
          index: "01",
          name: "Alpha",
          link: { label: "alpha.example.com", href: "https://alpha.example.com/path" },
          subtitle: "А",
          description: "А1",
          role: "Р1",
          result: "Е1",
          tags: ["Один", "Два"],
        },
        {
          id: "beta",
          index: "02",
          name: "Beta",
          link: { label: "[ссылка]", href: null },
          subtitle: "Б",
          description: "Б1",
          role: "Р2",
          result: "Е2",
          tags: ["Два"],
        },
      ],
    });
  });

  it("takes the placeholder of the link from the locale and the Russian one when it has none", () => {
    const items = buildResume(resumeSources, "en").projects.items;
    const noPlaceholder: ResumeSources = {
      ...resumeSources,
      projectsText: {
        ru: sources.projectsText.ru,
        en: { ...sources.projectsText.en!, linkPlaceholder: undefined as unknown as string },
      },
    };

    expect(items[0]!.link.label).toBe("alpha.example.com");
    expect(items[1]!.link).toEqual({ label: "[link]", href: null });
    expect(buildResume(noPlaceholder, "en").projects.items[1]!.link.label).toBe("[ссылка]");
  });

  it("does not change the file of the resume", () => {
    const before = structuredClone(resumeSources);
    buildResume(resumeSources, "en");

    expect(resumeSources).toEqual(before);
  });
});

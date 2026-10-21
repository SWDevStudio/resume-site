import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "~/assets/const";
import { projects as canonProjectsFile } from "~/assets/data/projects";
import canonSkillsFile from "~/assets/data/canon/skills";
import { skillTileId } from "~/components/pages/home/Skills/skillIds";
import { skillPanelSources } from "~/components/pages/home/Skills/skillPanels";
import { buildToolkit } from "~/components/pages/home/Skills/toolkit";
import { SKILL_TILE_META, SkillTile } from "~/components/ui/UiSkillTile/skillTile";
import type { ProjectCanon, SkillsCanon, SkillsText } from "#shared/types/catalog";
import {
  buildResume,
  buildSkillGroups,
  buildSkillRegistry,
  resolveStack,
} from "#shared/mock/build";
import { $api } from "~/assets/api";
import { staticSources } from "#shared/mock/sources.static";

const state = vi.hoisted(() => ({ locale: "ru" }));

vi.mock("~/assets/api/locale", () => ({ resolveLocale: () => state.locale }));

beforeEach(() => {
  state.locale = "ru";
});

const canon = canonSkillsFile as SkillsCanon;
const projects = canonProjectsFile as ProjectCanon[];

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const CYRILLIC = /[Ѐ-ӿ]/;
const ASCII = /^[\x20-\x7e]+$/;
const GROUPS = ["frontend", "backend", "lead", "additional"];
const TOOLKIT_SIZE = 35;

const textFiles = import.meta.glob<SkillsText>(
  ["../../app/assets/data/*/skills.ts", "!../../app/assets/data/canon/**"],
  {
    eager: true,
    import: "default",
  },
);

const texts = Object.entries(textFiles).map(([path, data]) => ({
  locale: /\/data\/([^/]+)\//.exec(path)![1]!,
  data,
}));

function keysOf(value: object) {
  return Object.keys(value).sort();
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

const allSkills = canon.groups.flatMap((group) => group.skills);
const registryIds = allSkills.map((skill) => skill.id);
const groupedIds = registryIds;
const stackIds = [
  ...new Set(
    projects.flatMap((project) =>
      project.stack.map((ref) => (typeof ref === "string" ? ref : ref.id)),
    ),
  ),
];

describe("the canon of the skills", () => {
  it("has the four groups in the order of the page", () => {
    expect(canon.groups.map((group) => group.id)).toEqual(GROUPS);
    for (const group of canon.groups) expect(group.skills.length).toBeGreaterThan(0);
  });

  it("has unique kebab case ids of the skills and of the groups", () => {
    expect(new Set(registryIds).size).toBe(registryIds.length);
    for (const id of [...registryIds, ...canon.groups.map((group) => group.id)]) {
      expect(id).toMatch(ID);
    }
  });

  it("lists a skill in one group at most and only skills of the registry", () => {
    expect(new Set(groupedIds).size).toBe(groupedIds.length);
    for (const id of groupedIds) expect(registryIds).toContain(id);
  });

  it("keeps only the language free facts: id, kind and a short label", () => {
    for (const skill of allSkills) {
      expect(Object.keys(skill).every((key) => ["id", "kind", "label"].includes(key))).toBe(true);
      expect(["tech", "soft"]).toContain(skill.kind);
      if (skill.label !== undefined) {
        expect(skill.kind).toBe("tech");
        expect(skill.label.length).toBeGreaterThan(0);
        expect(skill.label).toMatch(ASCII);
      }
    }
    for (const group of canon.groups) {
      expect(keysOf(group)).toEqual(["id", "kind", "skills"]);
      expect(["tech", "soft"]).toContain(group.kind);
    }
    expect(allStrings(canon).filter((value) => CYRILLIC.test(value))).toEqual([]);
    expect(allKeys(canon).filter((key) => ["name", "title", "text"].includes(key))).toEqual([]);
  });

  it("keeps every skill of the stack of a project in the registry", () => {
    for (const id of stackIds) expect(registryIds).toContain(id);
  });

  it("keeps no skill that neither a group nor a stack of a project uses", () => {
    const unused = registryIds.filter((id) => !groupedIds.includes(id) && !stackIds.includes(id));

    expect(unused).toEqual([]);
  });

  it("writes an object into a stack only where the label differs from the name", () => {
    const names = buildSkillRegistry(staticSources(DEFAULT_LOCALE), DEFAULT_LOCALE);

    for (const project of projects) {
      for (const ref of project.stack) {
        if (typeof ref === "string") continue;
        const entry = names[ref.id]!;
        expect(ref.label).not.toBe(entry.label ?? entry.name);
      }
    }
  });
});

describe("the text of the skills", () => {
  it("has the Russian file that the other languages fall back to", () => {
    expect(texts.map((file) => file.locale)).toContain(DEFAULT_LOCALE);
  });

  it("has a file only for a known locale", () => {
    for (const file of texts) expect(LOCALES as readonly string[]).toContain(file.locale);
  });

  describe.each(texts)("the file of $locale", ({ data }) => {
    it("names exactly the skills and the groups of the canon", () => {
      expect(keysOf(data)).toEqual(["groups", "skills"]);
      expect(keysOf(data.skills)).toEqual([...registryIds].sort());
      expect(keysOf(data.groups)).toEqual(canon.groups.map((group) => group.id).sort());
      for (const name of [...Object.values(data.skills), ...Object.values(data.groups)]) {
        expect(name.trim().length).toBeGreaterThan(0);
      }
    });

    it("keeps the names of the technologies in English", () => {
      for (const skill of allSkills.filter((item) => item.kind === "tech")) {
        expect(data.skills[skill.id]).toMatch(ASCII);
      }
      for (const group of canon.groups.filter((item) => item.kind === "tech")) {
        expect(data.groups[group.id]).toMatch(ASCII);
      }
    });
  });

  it("keeps the same ids in every language and the same name for a technology", () => {
    const base = texts.find((file) => file.locale === DEFAULT_LOCALE)!.data;

    for (const file of texts) {
      expect(keysOf(file.data.skills)).toEqual(keysOf(base.skills));
      expect(keysOf(file.data.groups)).toEqual(keysOf(base.groups));
      for (const skill of allSkills.filter((item) => item.kind === "tech")) {
        expect(file.data.skills[skill.id]).toBe(base.skills[skill.id]);
      }
      for (const group of canon.groups.filter((item) => item.kind === "tech")) {
        expect(file.data.groups[group.id]).toBe(base.groups[group.id]);
      }
    }
  });
});

describe.each(LOCALES)("the skills built for %s", (locale: Locale) => {
  const sources = staticSources(locale);
  const groups = buildSkillGroups(sources, locale);
  const text = texts.find((file) => file.locale === locale)!.data;

  it("shows every skill of every group of the canon in its place", () => {
    expect(groups.map((group) => group.id)).toEqual(canon.groups.map((group) => group.id));
    groups.forEach((group, position) => {
      const source = canon.groups[position]!;

      expect(group.name).toBe(text.groups[source.id]);
      expect(group.terms).toBe(source.kind === "tech");
      expect(group.skills.map((skill) => skill.id)).toEqual(source.skills.map((skill) => skill.id));
    });
  });

  it("takes the name from the text and the label from the canon or the name", () => {
    for (const skill of groups.flatMap((group) => group.skills)) {
      const source = allSkills.find((item) => item.id === skill.id)!;

      expect(skill.name).toBe(text.skills[skill.id]);
      expect(skill.label).toBe(source.label ?? skill.name);
    }
  });

  it("shows every skill of the canon that has a group and no other", () => {
    const shown = groups.flatMap((group) => group.skills.map((skill) => skill.id));

    expect([...shown].sort()).toEqual([...groupedIds].sort());
    expect(new Set(shown).size).toBe(shown.length);
    for (const id of registryIds.filter((item) => !groupedIds.includes(item))) {
      expect(shown).not.toContain(id);
    }
  });

  it("puts into the resume the groups of the registry and no label", () => {
    const resume = buildResume(sources, locale);

    expect(resume.skills.groups).toEqual(
      groups.map((group) => ({
        id: group.id,
        name: group.name,
        terms: group.terms,
        skills: group.skills.map((skill) => ({ id: skill.id, name: skill.name })),
      })),
    );
    expect(allKeys(resume.skills.groups)).not.toContain("label");
  });

  it("resolves the stack of every project to the names of the registry", () => {
    const registry = buildSkillRegistry(sources, locale);

    for (const project of projects) {
      const names = resolveStack(project.stack, registry);

      expect(names).toHaveLength(project.stack.length);
      names.forEach((name, position) => {
        const ref = project.stack[position]!;
        const entry = registry[typeof ref === "string" ? ref : ref.id]!;

        expect(name).toBe(typeof ref === "string" ? (entry.label ?? entry.name) : ref.label);
      });
    }
  });

  it("gives the registry an entry for each skill of the canon", () => {
    const registry = buildSkillRegistry(sources, locale);

    expect(keysOf(registry)).toEqual([...registryIds].sort());
    for (const id of registryIds) expect(registry[id]!.name).toBe(text.skills[id]);
  });
});

describe("the tiles and the toolkit of the home slide", () => {
  const groups = buildSkillGroups(staticSources(DEFAULT_LOCALE), DEFAULT_LOCALE);
  const flat = groups.flatMap((group) => group.skills);

  it("has a skill in the registry for every tile, with the label the tile shows", () => {
    for (const tile of Object.values(SkillTile)) {
      const skill = flat.find((item) => item.id === skillTileId(tile));

      expect(skill, tile).toBeDefined();
      expect(SKILL_TILE_META[tile].label).toBe(skill!.label);
    }
  });

  it("has a skill in the registry for every tile of the panels and for its swap", () => {
    for (const panel of skillPanelSources) {
      const own = groups.find((group) => group.id === panel.key)!.skills.map((skill) => skill.id);

      for (const tile of panel.tiles) {
        expect(own).toContain(skillTileId(tile.skill));
        expect(flat.map((skill) => skill.id)).toContain(skillTileId(tile.swap));
      }
    }
  });

  it("takes the whole toolkit from the first skills of the additional group", () => {
    const additional = groups.find((group) => group.id === "additional")!.skills;
    const toolkit = buildToolkit(additional);

    expect(additional.length).toBeGreaterThanOrEqual(TOOLKIT_SIZE);
    expect([...toolkit.static, ...toolkit.typed.map((item) => item.text)]).toEqual(
      additional.slice(0, TOOLKIT_SIZE).map((skill) => skill.name),
    );
  });
});

describe("a change in one place", () => {
  it("reaches the groups, the registry and the resume built from a renamed text", () => {
    const sources = staticSources("en");
    const renamed = structuredClone(sources.skillsText);
    renamed.en!.skills["type-script"] = "TypeScript 6";
    const changed = { ...sources, skillsText: renamed };

    expect(buildSkillRegistry(changed, "en")["type-script"]!.name).toBe("TypeScript 6");
    expect(
      buildSkillGroups(changed, "en").flatMap((group) => group.skills.map((skill) => skill.name)),
    ).toContain("TypeScript 6");
    expect(
      buildResume(changed, "en").skills.groups.flatMap((group) =>
        group.skills.map((skill) => skill.name),
      ),
    ).toContain("TypeScript 6");
    expect(buildSkillRegistry(sources, "en")["type-script"]!.name).toBe("TypeScript");
  });
});

describe("$api.skills.fetchGroups", () => {
  it.each(LOCALES)("gives the groups built from the canon in %s", async (locale) => {
    state.locale = locale;

    expect(await $api.skills.fetchGroups()).toEqual(
      buildSkillGroups(staticSources(locale), locale),
    );
  });
});

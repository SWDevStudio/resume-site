import { describe, expect, it } from "vitest";
import { buildProjects, buildResume, buildSkillGroups } from "~/assets/api/mock/build";
import { staticSources } from "~/assets/api/mock/sources.static";
import { projects as canonProjects } from "~/assets/data/projects";
import { skillPanelSources } from "~/components/pages/home/Skills/skillPanels";
import { skillTileId } from "~/components/pages/home/Skills/skillIds";
import { buildToolkit } from "~/components/pages/home/Skills/toolkit";
import { SkillTile } from "~/components/ui/UiSkillTile/skillTile";
import type { ResumeData } from "~/assets/api/types/resume";

const files: Record<"en" | "ru", ResumeData> = {
  en: buildResume(staticSources("en"), "en"),
  ru: buildResume(staticSources("ru"), "ru"),
};

const en = files.en;

function kebab(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

const tileIds = new Set(Object.keys(SkillTile).map((key) => kebab(key)));

describe.each(Object.entries(files) as ["en" | "ru", ResumeData][])(
  "ids of the %s data",
  (locale, data) => {
    const groups = buildSkillGroups(staticSources(locale), locale);

    it("lists only the favorite projects of the canon in its order with their names and indexes", () => {
      const favorites = canonProjects.filter((item) => item.isFavorite);
      const indexes = new Map(
        canonProjects.map((item, position) => [item.id, String(position + 1).padStart(2, "0")]),
      );

      expect(favorites.length).toBeLessThan(canonProjects.length);
      expect(data.projects.items.map((item) => item.id)).toEqual(favorites.map((item) => item.id));
      expect(data.projects.items.map((item) => item.name)).toEqual(
        favorites.map((item) => item.name),
      );
      expect(data.projects.items.map((item) => item.index)).toEqual(
        favorites.map((item) => indexes.get(item.id)),
      );
    });

    it("derives the texts and tags of the projects from the list of the cards", () => {
      const projects = buildProjects(staticSources(locale), locale).filter(
        (project) => project.isFavorite,
      );

      expect(data.projects.items).toHaveLength(projects.length);
      projects.forEach((project, position) => {
        const item = data.projects.items[position]!;

        expect(item.subtitle).toBe(project.subtitle);
        expect(item.description).toBe(project.description);
        expect(item.role).toBe(project.role);
        expect(item.result).toBe(project.result);
        expect(item.tags).toEqual(project.tags);
        expect(item.link.href).toBe(project.url);
      });
    });

    it("gives every skill a unique kebab case id", () => {
      const ids = groups.flatMap((group) => group.skills.map((skill) => skill.id));

      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    });

    it("builds the skills of the resume from the skill groups and nothing else", () => {
      expect(data.skills.groups).toEqual(
        groups.map((group) => ({
          id: group.id,
          name: group.name,
          terms: group.terms,
          skills: group.skills.map((skill) => ({ id: skill.id, name: skill.name })),
        })),
      );
    });

    it("takes the id of a technology from the home tiles and the home toolkit", () => {
      const ids = groups
        .filter((group) => group.terms)
        .flatMap((group) => group.skills.map((skill) => skill.id));
      const core = [
        "react",
        "next-js",
        "vue",
        "nuxt",
        "type-script",
        "tailwind",
        "java-script",
        "node-js",
        "postgre-sql",
        "docker",
        "vite",
        "webpack",
        "git",
        "git-lab",
        "jira",
        "vitest",
      ];

      for (const id of core) {
        expect(ids).toContain(id);
        expect(tileIds.has(id)).toBe(true);
      }
      for (const id of ["zustand", "pinia", "claude-code", "codex", "gemini", "mcp", "clinic-js"]) {
        expect(ids).toContain(id);
      }
    });

    it("has a skill in the data for every tile of the home panels and for its swap", () => {
      const ids = new Set(groups.flatMap((group) => group.skills.map((skill) => skill.id)));

      for (const panel of skillPanelSources) {
        const own = groups.find((group) => group.id === panel.key)!.skills.map((skill) => skill.id);

        for (const tile of panel.tiles) {
          expect(own).toContain(skillTileId(tile.skill));
          expect(ids.has(skillTileId(tile.swap))).toBe(true);
          expect(tileIds.has(skillTileId(tile.skill))).toBe(true);
          expect(tileIds.has(skillTileId(tile.swap))).toBe(true);
        }
      }
    });

    it("keeps the 33 additional skills at the lengths the typing keyframes of the home toolkit are built for", () => {
      const additional = groups.find((group) => group.id === "additional")!.skills;
      const toolkit = buildToolkit(additional);

      expect(toolkit.static).toEqual(["Vite", "Webpack", "Git", "GitHub", "GitLab", "Figma"]);
      expect(additional).toHaveLength(33);
      expect(toolkit.typed.map((item) => item.text.length)).toEqual([
        5, 6, 4, 5, 10, 9, 4, 11, 5, 6, 3, 14, 7, 3, 14, 5, 4, 15, 3, 9, 7, 9, 9, 10, 10, 14, 9,
      ]);
      expect(toolkit.typed[0]!.text).toBe("Redux");
      expect(toolkit.typed.at(-1)!.text).toBe("AI agents");
    });

    it("keeps the names of the technologies in English", () => {
      for (const group of groups.filter((item) => item.terms)) {
        expect(group.name).toMatch(/^[\x20-\x7e]+$/);
        for (const skill of group.skills) expect(skill.name).toMatch(/^[\x20-\x7e]+$/);
      }
      for (const job of data.experience.jobs) {
        for (const item of job.stack) expect(item).toMatch(/^[\x20-\x7e]+$/);
      }
      for (const entry of data.cases.items) {
        expect(entry.name).toMatch(/^[\x20-\x7e]+$/);
        for (const item of entry.stack) expect(item).toMatch(/^[\x20-\x7e]+$/);
      }
      expect(data.profile).not.toHaveProperty("stack");
    });
  },
);

describe("the resume against the other pages", () => {
  it("names the first technology groups like the home panels", () => {
    const names = en.skills.groups.map((group) => group.id);

    expect(names.slice(0, 2)).toEqual(["frontend", "backend"]);
  });

  it("has a job titled after the Brendmart project of the portfolio", () => {
    const job = en.experience.jobs.find((item) => item.id === "brendmart")!;
    const project = en.projects.items.find((item) => item.id === "brendmart")!;

    expect(job.company).toBe(project.name);
    expect(project.link.href).toBe(`https://${job.site}/`);
  });
});

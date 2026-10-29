import { beforeEach, describe, expect, it, vi } from "vitest";
import { LOCALES, type Locale } from "~/assets/const";
import enResume from "~/assets/data/en/resume";
import ruResume from "~/assets/data/ru/resume";
import { projects as catalog } from "~/assets/data/projects";
import { $api } from "./index";
import { buildProjects, buildResume, buildSkillGroups } from "~/assets/api/mock/build";
import { loadProjectMedia } from "~/assets/api/mock/media";
import { staticSources } from "~/assets/api/mock/sources.static";

const state = vi.hoisted(() => ({ locale: "ru" }));

vi.mock("./locale", () => ({ resolveLocale: () => state.locale }));

beforeEach(() => {
  state.locale = "ru";
});

describe("$api.profile.fetchResume", () => {
  it("loads the data of the locale the api resolves itself", async () => {
    const withSkills = (resume: { skills: object; projects: object }) => ({
      ...resume,
      skills: expect.objectContaining({ ...resume.skills, groups: expect.any(Array) }),
      projects: expect.objectContaining({ ...resume.projects, items: expect.any(Array) }),
    });

    expect(await $api.profile.fetchResume()).toEqual(withSkills(ruResume));
    state.locale = "en";
    expect(await $api.profile.fetchResume()).toEqual(withSkills(enResume));
    expect((await $api.profile.fetchResume()).profile.lastName).toBe("Malakhov");
    state.locale = "ru";
    expect((await $api.profile.fetchResume()).profile.lastName).toBe("Малахов");
  });

  it("takes no locale from the caller", () => {
    expect($api.profile.fetchResume.length).toBe(0);
    expect($api.projects.fetchList.length).toBe(0);
    expect($api.skills.fetchGroups.length).toBe(0);
    expect($api.projects.fetchCase.length).toBe(1);
  });

  it("loads lazily and returns a promise", () => {
    expect($api.profile.fetchResume()).toBeInstanceOf(Promise);
    expect($api.projects.fetchList()).toBeInstanceOf(Promise);
    expect($api.skills.fetchGroups()).toBeInstanceOf(Promise);
  });
});

describe.each(LOCALES)("the client and the server build the same data in %s", (locale: Locale) => {
  it("gives the page the same resume, project list and skill groups as the server builders", async () => {
    state.locale = locale;
    const sources = { ...staticSources(locale), media: await loadProjectMedia() };

    expect(await $api.profile.fetchResume()).toEqual(buildResume(sources, locale));
    expect(await $api.projects.fetchList()).toEqual(buildProjects(sources, locale));
    expect(await $api.skills.fetchGroups()).toEqual(buildSkillGroups(sources, locale));
  });
});

describe("$api.projects.fetchList", () => {
  it("returns the projects in the language of the locale", async () => {
    const ru = await $api.projects.fetchList();
    state.locale = "en";
    const en = await $api.projects.fetchList();

    expect(ru.map((project) => project.id)).toEqual(en.map((project) => project.id));
    expect(ru.map((project) => project.id)).toEqual(catalog.map((project) => project.id));
    expect(ru[0]!.id).toBe("dobro");
    expect(ru[0]!.subtitle).toBe("ПЛАТФОРМА ПОЖЕРТВОВАНИЙ · ЦИФРОВОЙ РУБЛЬ");
    expect(en[0]!.subtitle).toBe("DONATION PLATFORM · DIGITAL RUBLE");
    expect(ru[0]!.name).toBe(en[0]!.name);
  });
});

describe("$api.skills.fetchGroups", () => {
  it("returns the groups in the language of the locale", async () => {
    const ru = await $api.skills.fetchGroups();
    state.locale = "en";
    const en = await $api.skills.fetchGroups();

    expect(ru.map((group) => group.id)).toEqual(["frontend", "backend", "lead", "additional"]);
    expect(en.map((group) => group.id)).toEqual(ru.map((group) => group.id));
    expect(ru.find((group) => group.id === "lead")!.name).toBe("Лидерство и soft skills");
    expect(en.find((group) => group.id === "lead")!.name).toBe("Lead & soft skills");
    expect(ru.find((group) => group.id === "frontend")!.name).toBe("Frontend");
  });

  it("gives the same groups to the home slide and to the resume", async () => {
    for (const locale of LOCALES) {
      state.locale = locale;
      const groups = await $api.skills.fetchGroups();
      const resume = await $api.profile.fetchResume();

      expect(resume.skills.groups).toEqual(
        groups.map((group) => ({
          id: group.id,
          name: group.name,
          terms: group.terms,
          skills: group.skills.map((skill) => ({ id: skill.id, name: skill.name })),
        })),
      );
    }
  });

  it("resolves the stack of every project from the registry of the skills and the labels of the canon", async () => {
    for (const locale of LOCALES) {
      state.locale = locale;
      const groups = await $api.skills.fetchGroups();
      const skills = groups.flatMap((group) => group.skills);
      const list = await $api.projects.fetchList();

      expect(list.flatMap((project) => project.stack).length).toBeGreaterThan(0);
      for (const project of list) {
        const refs = catalog.find((item) => item.id === project.id)!.stack;

        expect(project.stack).toHaveLength(refs.length);
        refs.forEach((ref, index) => {
          if (typeof ref !== "string") {
            expect(project.stack[index]).toBe(ref.label);
            return;
          }
          const skill = skills.find((item) => item.id === ref);

          expect(skill, `${project.id}: ${ref}`).toBeDefined();
          expect(project.stack[index]).toBe(skill!.label ?? skill!.name);
        });
      }
    }
  });

  it("takes the label of an object reference of the stack as it is", async () => {
    const dobro = (await $api.projects.fetchList()).find((project) => project.id === "dobro")!;

    expect(dobro.stack).toEqual(expect.arrayContaining(["Next.js 16", "React 19"]));
  });
});

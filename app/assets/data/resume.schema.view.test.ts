import { describe, expect, it } from "vitest";
import { SOCIAL } from "~/assets/const";
import type { ResumeFile } from "~/assets/api/types/catalog";

const files = import.meta.glob<ResumeFile>("./*/resume.ts", { eager: true, import: "default" });

function leaf(value: unknown) {
  if (value === null) return "null";
  return typeof value;
}

function paths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) return value.flatMap((item) => paths(item, `${prefix}[]`));
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => {
      const path = `${prefix}.${key}`;
      return typeof child === "object" && child !== null
        ? paths(child, path)
        : [`${path}:${leaf(child)}`];
    });
  }
  return [`${prefix}:${leaf(value)}`];
}

function schema(data: ResumeFile) {
  return [...new Set(paths(data))].sort();
}

const entries = Object.entries(files).map(([path, data]) => ({
  locale: /\.\/([^/]+)\/resume\.ts$/.exec(path)![1]!,
  data,
}));

describe("resume data files", () => {
  it("has the English file that the loader falls back to and the Russian one", () => {
    expect(entries.map((entry) => entry.locale).sort()).toEqual(["en", "ru"]);
  });

  it.each(entries)("keeps the schema of $locale equal to the English one", ({ data }) => {
    const english = entries.find((entry) => entry.locale === "en")!.data;

    expect(schema(data)).toEqual(schema(english));
  });

  it("keeps the same ids of the sections, jobs and contacts in every language", () => {
    function ids(data: ResumeFile) {
      return {
        sections: [
          data.summary.id,
          data.skills.id,
          data.projects.id,
          data.experience.id,
          data.cases.id,
          data.education.id,
          data.additional.id,
          data.ai.id,
          data.references.id,
        ],
        jobs: data.experience.jobs.map((job) => job.id),
        cases: data.cases.items.map((item) => item.id),
        contacts: data.profile.contacts.map((item) => item.id),
      };
    }
    const english = entries.find((entry) => entry.locale === "en")!.data;

    for (const { data } of entries) {
      const own = ids(data);
      expect(own.sections).toEqual(ids(english).sections);
      expect(own.jobs).toEqual(ids(english).jobs);
      expect(own.cases).toEqual(ids(english).cases);
      expect(own.contacts).toEqual(ids(english).contacts);
    }
  });

  it.each(entries)("keeps no skill groups in the resume file of $locale", ({ data }) => {
    expect(Object.keys(data.skills).sort()).toEqual(["id", "label", "name"]);
  });

  it.each(entries)("keeps no projects in the resume file of $locale", ({ data }) => {
    expect(Object.keys(data.projects).sort()).toEqual(["id", "label", "name"]);
  });

  it("does not repeat an anchor id inside a file", () => {
    for (const { data } of entries) {
      const anchors = [
        data.summary.id,
        data.skills.id,
        data.projects.id,
        data.experience.id,
        ...data.experience.jobs.map((job) => job.id),
        data.cases.id,
        ...data.cases.items.map((item) => item.id),
        data.education.id,
        data.additional.id,
        data.ai.id,
        data.references.id,
      ];

      expect(new Set(anchors).size).toBe(anchors.length);
      for (const id of anchors) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it.each(entries)("keeps no city in the jobs of $locale", ({ data }) => {
    for (const job of data.experience.jobs) expect(job).not.toHaveProperty("city");
  });

  it.each(entries)("takes the contact links of $locale from the social constants", ({ data }) => {
    for (const key of ["telegram", "email"] as const) {
      const contact = data.profile.contacts.find((item) => item.id === key)!;

      expect(contact.value).toBe(SOCIAL[key].value);
      expect(contact.href).toBe(SOCIAL[key].href);
    }
    const linkedin = data.profile.contacts.find((item) => item.id === "linkedin")!;

    expect(linkedin.label).toBe(SOCIAL.linkedin.label);
    expect(linkedin.href).toBe(SOCIAL.linkedin.href);
  });
});

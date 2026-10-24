import type { ProjectBlock } from "../../types/projectCase";
import type { ProjectsSources, ProjectView } from "../../types/catalog";
import type { Locale } from "../../../const/locale";
import { firstDefined, textLayers } from "./layers";
import { resolveStack } from "./stack";

export function buildProjects(src: ProjectsSources, locale: Locale): ProjectView[] {
  const layers = textLayers(src.projectsText, locale);
  return src.projects.map((project, position) => {
    const text = firstDefined(layers, (layer) => layer.items[project.id]);
    if (!text) throw new Error(`Project "${project.id}" has no text`);
    const tags = project.tags.map((id) => {
      const label = firstDefined(layers, (layer) => layer.tags[id]);
      if (label === undefined) {
        throw new Error(`Tag "${id}" of project "${project.id}" has no label`);
      }
      return label;
    });
    return {
      id: project.id,
      isFavorite: project.isFavorite,
      index: String(position + 1).padStart(2, "0"),
      name: project.name,
      tone: project.tone,
      url: project.url,
      host: project.url ? new URL(project.url).host : null,
      preview: project.preview,
      previewMobile: project.previewMobile ?? null,
      previewAlt: text.previewAlt,
      subtitle: text.subtitle,
      headline: text.headline,
      description: text.description,
      tags,
      stack: resolveStack(project.stack, src.registry),
      role: text.role,
      result: text.result,
    };
  });
}

export function buildCase(
  slug: string,
  src: ProjectsSources,
  blocks: ProjectBlock[] | null,
  locale: Locale,
): ProjectBlock[] | null {
  const position = src.projects.findIndex((project) => project.id === slug);
  if (!blocks || position === -1) return null;
  const list = buildProjects(src, locale);
  const project = list[position]!;
  const next = list[(position + 1) % list.length]!;
  const generated: Record<string, Record<string, unknown>> = {
    ProjectCaseHeader: {
      index: project.index,
      subtitle: project.subtitle,
      name: project.name,
      headline: project.headline,
      url: project.url,
      tone: project.tone,
    },
    ProjectCaseCover: {
      image: project.preview,
      imageMobile: project.previewMobile,
      imageAlt: project.previewAlt,
    },
    ProjectCaseMeta: { tags: project.tags, stack: project.stack },
    ProjectCaseNext: {
      slug: next.id,
      name: next.name,
      index: next.index,
      tone: next.tone,
    },
    ProjectCaseCta: { url: project.url },
  };
  return blocks.map((block) => {
    const data = generated[block.component];
    return data ? { component: block.component, data: { ...block.data, ...data } } : block;
  });
}

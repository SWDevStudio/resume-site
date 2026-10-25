import type { Locale } from "../../app/assets/const/locale";
import type { ResumeData, ResumeItem } from "../../app/assets/api/types/resume";
import { buildResume } from "../../app/assets/api/mock/build/resume";
import { staticSources } from "../../app/assets/api/mock/sources.static";

interface AssistantProfile {
  name: string;
  text: string;
}

const profiles = new Map<Locale, AssistantProfile>();

function item({ lead, text }: ResumeItem) {
  return lead ? `${lead}: ${text}` : text;
}

function list(items: string[]) {
  return items.map((text) => `- ${text}`).join("\n");
}

function compactProfile(data: ResumeData): string {
  const { profile } = data;
  const projects = data.projects.items.map((project) =>
    [
      `### ${project.name}${project.link.href ? ` (${project.link.label})` : ""}: ${project.subtitle}`,
      project.description,
      project.role,
      project.result,
      project.tags.join(", "),
    ].join("\n"),
  );
  const jobs = data.experience.jobs.map((job) =>
    [
      `### ${job.company}: ${job.title}, ${job.period} (${job.duration})`,
      job.field ?? "",
      `${data.experience.labels.team}: ${job.team}`,
      job.projects.length ? list(job.projects.map(item)) : "",
      list(job.achievements),
      `${data.experience.labels.stack}: ${job.stack.join(", ")}`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  const personal = data.personal.items.map(
    (project) => `### ${project.name} (${project.stack.join(", ")})\n${project.description}`,
  );
  return [
    `# ${profile.firstName} ${profile.lastName}: ${profile.role} (${profile.stack.join(" / ")})`,
    `## ${data.summary.name}\n${data.summary.paragraphs.join("\n")}`,
    `## ${data.skills.name}\n${list(data.skills.groups.map((group) => `${group.name}: ${group.skills.map((skill) => skill.name).join(", ")}`))}`,
    `## ${data.projects.name}\n${projects.join("\n\n")}`,
    `## ${data.experience.name}\n${data.experience.total}\n\n${jobs.join("\n\n")}`,
    `## ${data.ai.name}\n${data.ai.paragraphs.join("\n")}`,
    `## ${data.personal.name}\n${personal.join("\n\n")}`,
    `## ${data.education.name}\n${list(data.education.items.map(item))}`,
  ].join("\n\n");
}

export function assistantProfile(locale: Locale): AssistantProfile {
  let profile = profiles.get(locale);
  if (!profile) {
    const data = buildResume(staticSources(locale), locale);
    profile = {
      name: `${data.profile.firstName} ${data.profile.lastName}`,
      text: compactProfile(data),
    };
    profiles.set(locale, profile);
  }
  return profile;
}

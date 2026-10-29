import type {
  ResumeData,
  ResumeItem,
  ResumeJob,
  ResumeLink,
} from "../../app/assets/api/types/resume";

function escape(text: string) {
  return text.replace(/[\\*`[\]]/g, (char) => `\\${char}`);
}

function link(label: string, href: string | null | undefined) {
  return href ? `[${escape(label)}](${href})` : escape(label);
}

function item({ lead, text }: ResumeItem) {
  return [lead ? `**${escape(lead)}**` : "", escape(text)].filter(Boolean).join(" ");
}

function bullets(items: string[]) {
  return items.map((text) => `- ${text}`).join("\n");
}

function section(title: string, ...blocks: (string | false)[]) {
  return [`## ${escape(title)}`, ...blocks.filter(Boolean)].join("\n\n");
}

function siteLink(site: string | undefined) {
  return site ? link(site, `https://${site}`) : "";
}

function projectLink({ label, href }: ResumeLink) {
  return link(label, href);
}

function job(entry: ResumeJob, labels: ResumeData["experience"]["labels"]) {
  const field = [entry.field ? escape(entry.field) : "", siteLink(entry.site)]
    .filter(Boolean)
    .join(" · ");
  const blocks = [
    `### ${escape(entry.company)} — ${escape(entry.title)}`,
    `*${escape(`${entry.period} (${entry.duration})`)}*`,
    field,
    `**${escape(labels.team)}:** ${escape(entry.team)}`,
    entry.projects.length ? `#### ${labels.projects}\n\n${bullets(entry.projects.map(item))}` : "",
    `#### ${labels.responsibilities}\n\n${bullets(entry.responsibilities.map(escape))}`,
    `#### ${labels.achievements}\n\n${bullets(entry.achievements.map(escape))}`,
    `#### ${labels.stack}\n\n${escape([...entry.stack, ...entry.practices].join(", "))}`,
  ];
  return blocks.filter(Boolean).join("\n\n");
}

export function resumeToMarkdown(data: ResumeData, siteUrl?: string): string {
  const { profile } = data;
  const name = `${profile.firstName} ${profile.lastName}`;

  const contacts = bullets(
    profile.contacts.map(
      (contact) => `**${escape(contact.label)}:** ${link(contact.value, contact.href)}`,
    ),
  );

  const head = [
    `# ${escape(name)}`,
    `**${escape(profile.role)}**`,
    escape(profile.caption),
    contacts,
  ].join("\n\n");

  const skills = data.skills.groups.map(
    (group) =>
      `- **${escape(group.name)}:** ${escape(group.skills.map((skill) => skill.name).join(", "))}`,
  );

  const projects = data.projects.items.map((project) =>
    [
      project.link.href
        ? `### ${escape(project.name)} — ${projectLink(project.link)}`
        : `### ${escape(project.name)}`,
      `*${escape(project.subtitle)}*`,
      escape(project.description),
      bullets([escape(project.role), escape(project.result)]),
      escape(project.tags.join(", ")),
    ].join("\n\n"),
  );

  const cases = data.cases.items.map((entry) => {
    const meta = [entry.period, entry.role].filter(Boolean).join(" · ");
    return [
      `### ${escape(entry.name)}`,
      meta ? `*${escape(meta)}*` : "",
      escape(entry.description),
      entry.points.length ? bullets(entry.points.map(escape)) : "",
      escape(entry.stack.join(", ")),
    ]
      .filter(Boolean)
      .join("\n\n");
  });

  const parts = [
    siteUrl && `*${escape(data.footer.latestVersion)}: ${link(siteUrl, siteUrl)}*`,
    head,
    section(data.summary.name, data.summary.paragraphs.map(escape).join("\n\n")),
    section(data.skills.name, skills.join("\n")),
    section(data.projects.name, ...projects),
    section(
      data.experience.name,
      escape(data.experience.total),
      ...data.experience.jobs.map((entry) => job(entry, data.experience.labels)),
    ),
    cases.length > 0 && section(data.cases.name, ...cases),
    section(data.education.name, bullets(data.education.items.map(item))),
    section(data.additional.name, bullets(data.additional.items.map(item))),
    section(
      data.ai.name,
      data.ai.paragraphs.map(escape).join("\n\n"),
      data.ai.link !== undefined && projectLink(data.ai.link),
    ),
    section(data.references.name, bullets(data.references.items.map(item))),
    escape(data.footer.copyright),
  ];

  return `${parts.filter(Boolean).join("\n\n")}\n`;
}

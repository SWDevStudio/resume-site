import type { Content, ContentText, TDocumentDefinitions } from "pdfmake/interfaces";
import type {
  ResumeData,
  ResumeItem,
  ResumeJob,
  ResumePersonalProject,
  ResumeProject,
} from "../types/resume";

const PAGE = { width: 595.28, margin: { left: 42, right: 42, top: 44, bottom: 52 } };
const CONTENT_WIDTH = PAGE.width - PAGE.margin.left - PAGE.margin.right;
const META_WIDTH = 190;

const COLOR = {
  text: "#1f2328",
  muted: "#59636e",
  accent: "#1d3c6e",
  rule: "#c4ccd6",
  link: "#0b57d0",
};

const LANGUAGE: Record<string, string> = { ru: "ru-RU", en: "en-US" };

type Labels = ResumeData["experience"]["labels"];

function anchor(label: string, href: string | null | undefined): ContentText {
  if (!href) return { text: label };
  return { text: label, link: href, color: COLOR.link, decoration: "underline" };
}

function lead(entry: ResumeItem): ContentText {
  const parts: ContentText[] = [];
  if (entry.lead) parts.push({ text: entry.text ? `${entry.lead} ` : entry.lead, bold: true });
  if (entry.text) parts.push({ text: entry.text });
  return { text: parts };
}

function plain(text: string): ContentText {
  return { text };
}

function paragraph(text: string): Content {
  return { text, margin: [0, 0, 0, 4] };
}

function bullets(items: Content[]): Content {
  return {
    ul: items.map((content) => ({ stack: [content], unbreakable: true, margin: [0, 0, 0, 2.5] })),
    markerColor: COLOR.accent,
  };
}

function withHead(head: Content[], items: Content[], render = bullets): Content[] {
  const [first, ...rest] = items;
  if (first === undefined) return [{ stack: head, unbreakable: true }];
  return [
    { stack: [...head, render([first])], unbreakable: true },
    ...(rest.length ? [render(rest)] : []),
  ];
}

function rule(): Content {
  return {
    canvas: [
      {
        type: "line",
        x1: 0,
        y1: 0,
        x2: CONTENT_WIDTH,
        y2: 0,
        lineWidth: 0.7,
        lineColor: COLOR.rule,
      },
    ],
    margin: [0, 0, 0, 6],
  };
}

function section(title: string, chunks: Content[]): Content[] {
  const [first, ...rest] = chunks;
  return [
    {
      stack: [{ text: title, style: "section" }, rule(), ...(first ? [first] : [])],
      unbreakable: true,
    },
    ...rest,
  ];
}

function skillRow(group: ResumeData["skills"]["groups"][number]): Content {
  return {
    text: [
      { text: `${group.name}: `, bold: true },
      plain(group.skills.map((s) => s.name).join(", ")),
    ],
    margin: [0, 0, 0, 3],
  };
}

function projectBlock(project: ResumeProject): Content {
  const headline: ContentText[] = [
    { text: `${project.index}  `, color: COLOR.muted },
    { text: project.name, style: "itemTitle" },
    plain("  "),
    anchor(project.link.label, project.link.href),
  ];
  return {
    stack: [
      { text: headline },
      { text: project.subtitle, style: "meta", margin: [0, 1, 0, 3] },
      paragraph(project.description),
      bullets([plain(project.role), plain(project.result)]),
      { text: project.tags.join(", "), style: "meta", margin: [0, 1, 0, 0] },
    ],
    unbreakable: true,
    margin: [0, 0, 0, 9],
  };
}

function personalBlock(project: ResumePersonalProject): Content {
  return {
    stack: [
      { text: project.name, style: "itemTitle" },
      { text: project.stack.join(", "), style: "meta", margin: [0, 1, 0, 3] },
      paragraph(project.description),
    ],
    unbreakable: true,
    margin: [0, 0, 0, 6],
  };
}

function jobHead(job: ResumeJob, labels: Labels): Content[] {
  const head: Content[] = [
    {
      columns: [
        { text: job.company, style: "itemTitle", width: "*" },
        {
          text: job.period,
          style: "meta",
          alignment: "right",
          width: META_WIDTH,
          margin: [8, 2, 0, 0],
        },
      ],
    },
    {
      columns: [
        { text: job.title, bold: true, color: COLOR.accent, width: "*" },
        {
          text: `${job.city} · ${job.duration}`,
          style: "meta",
          alignment: "right",
          width: META_WIDTH,
          margin: [8, 0, 0, 0],
        },
      ],
      margin: [0, 0, 0, 3],
    },
  ];
  if (job.field) {
    const field: ContentText[] = [plain(job.field)];
    if (job.site) field.push(plain(" · "), anchor(job.site, `https://${job.site}`));
    head.push({ text: field, margin: [0, 0, 0, 2] });
  }
  head.push({
    text: [{ text: `${labels.team}: `, bold: true }, plain(job.team)],
    margin: [0, 0, 0, 3],
  });
  return head;
}

function jobContent(job: ResumeJob, labels: Labels): Content[] {
  const title = (text: string): Content => ({ text, style: "block" });
  const stack = (items: Content[]): Content => ({ stack: items });
  const groups: {
    head: Content[];
    items: Content[];
    render?: (items: Content[]) => Content;
  }[] = [];
  if (job.projects.length) {
    groups.push({ head: [title(labels.projects)], items: job.projects.map(lead) });
  }
  groups.push(
    { head: [title(labels.responsibilities)], items: job.responsibilities.map(plain) },
    { head: [title(labels.achievements)], items: job.achievements.map(plain) },
    {
      head: [title(labels.stack)],
      items: [plain([...job.stack, ...job.practices].join(", "))],
      render: stack,
    },
  );
  const [first, ...others] = groups;
  return [
    ...withHead([...jobHead(job, labels), ...first!.head], first!.items, first!.render),
    ...others.flatMap((group) => withHead(group.head, group.items, group.render)),
  ];
}

function experienceChunks(data: ResumeData["experience"]): Content[] {
  const jobs = data.jobs.map((job) => jobContent(job, data.labels));
  const [firstJob = [], ...otherJobs] = jobs;
  const [firstChunk, ...firstRest] = firstJob;
  const total: Content = { text: data.total, margin: [0, 0, 0, 6] };
  const spacer = (): Content => ({ text: "", margin: [0, 0, 0, 8] });
  return [
    { stack: [total, ...(firstChunk ? [firstChunk] : [])], unbreakable: true },
    ...firstRest,
    ...otherJobs.flatMap((chunks) => [spacer(), ...chunks]),
  ];
}

function listChunks(items: ResumeItem[]): Content[] {
  return withHead([], items.map(lead));
}

export function resumeToPdf(data: ResumeData, locale: string): TDocumentDefinitions {
  const { profile } = data;
  const name = `${profile.firstName} ${profile.lastName}`;

  const header: Content[] = [
    { text: name, style: "name" },
    {
      text: [
        { text: profile.role, bold: true },
        plain(` (${profile.stack.join(" / ")}) `),
        { text: profile.specialization, color: COLOR.muted },
      ],
      style: "role",
    },
    { text: profile.caption, style: "meta", margin: [0, 0, 0, 8] },
    ...profile.contacts.map((contact): Content => ({
      text: [
        { text: `${contact.label}: `, bold: true },
        contact.href ? anchor(contact.value, contact.href) : plain(contact.value),
      ],
      margin: [0, 0, 0, 1.5],
    })),
  ];

  return {
    pageSize: "A4",
    pageMargins: [PAGE.margin.left, PAGE.margin.top, PAGE.margin.right, PAGE.margin.bottom],
    language: LANGUAGE[locale] ?? locale,
    info: {
      title: `${name} — ${profile.role}`,
      author: name,
      subject: profile.specialization,
      keywords: profile.stack.join(", "),
    },
    defaultStyle: { font: "Roboto", fontSize: 9.5, lineHeight: 1.28, color: COLOR.text },
    styles: {
      name: { fontSize: 22, bold: true, color: COLOR.accent, margin: [0, 0, 0, 2] },
      role: { fontSize: 11, margin: [0, 0, 0, 2] },
      meta: { fontSize: 8.5, color: COLOR.muted },
      section: { fontSize: 11.5, bold: true, color: COLOR.accent, margin: [0, 14, 0, 3] },
      itemTitle: { fontSize: 10.5, bold: true },
      block: { fontSize: 9.5, bold: true, color: COLOR.accent, margin: [0, 3, 0, 2] },
    },
    content: [
      ...header,
      ...section(data.summary.name, data.summary.paragraphs.map(paragraph)),
      ...section(data.skills.name, data.skills.groups.map(skillRow)),
      ...section(data.projects.name, data.projects.items.map(projectBlock)),
      ...section(data.experience.name, experienceChunks(data.experience)),
      ...section(data.education.name, listChunks(data.education.items)),
      ...section(data.additional.name, listChunks(data.additional.items)),
      ...section(data.ai.name, data.ai.paragraphs.map(paragraph)),
      ...section(data.personal.name, data.personal.items.map(personalBlock)),
      ...section(data.references.name, listChunks(data.references.items)),
    ],
    footer: (current: number, total: number): Content => ({
      text: `${data.footer.copyright}  ·  ${current} / ${total}`,
      alignment: "center",
      fontSize: 8,
      color: COLOR.muted,
      margin: [PAGE.margin.left, 18, PAGE.margin.right, 0],
    }),
  };
}

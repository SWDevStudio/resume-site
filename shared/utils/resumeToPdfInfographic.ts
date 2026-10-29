import type {
  CanvasElement,
  Column,
  Content,
  ContentColumns,
  ContentStack,
  ContentText,
  Margins,
  TDocumentDefinitions,
} from "pdfmake/interfaces";
import type { ResumeContact } from "../../app/assets/api/types/resume";
import {
  INFOGRAPHIC_ROLES,
  type InfographicChange,
  type InfographicFact,
  type InfographicJob,
  type InfographicMetric,
  type InfographicNote,
  type InfographicProject,
  type InfographicRole,
  type InfographicStat,
  type InfographicTarget,
  type InfographicTimeline,
  type ResumeInfographic,
  type YearMonth,
} from "../../app/assets/api/types/resumeInfographic";

export const PDF_INFOGRAPHIC_FONTS = {
  sans: "IBMPlexSans",
  sansMedium: "IBMPlexSansMedium",
  mono: "IBMPlexMono",
} as const;

export const PDF_INFOGRAPHIC_PALETTE = {
  text: "#15161A",
  muted: "#5E616B",
  rule: "#E1E2E6",
  before: "#C3C6CE",
  fullstack: "#74788A",
  accent: "#2F55D4",
  track: "#F3F4F6",
  targetTrack: "#ECEDF0",
} as const;

const COLOR = PDF_INFOGRAPHIC_PALETTE;
const FONT = PDF_INFOGRAPHIC_FONTS;

const ROLE_COLOR: Record<InfographicRole, string> = {
  frontend: COLOR.before,
  fullstack: COLOR.fullstack,
  lead: COLOR.accent,
};

const LANGUAGE: Record<string, string> = { ru: "ru-RU", en: "en-US" };

const PX = 0.75;
const FONT_HEIGHT = 1.3;
const ASCENT = 1.025;
const MONO_ADVANCE = 0.6;
const MONO_SLACK = 1;

const PAGE = { width: 595.28, marginX: 56 * PX, marginY: 52 * PX };
const CONTENT_WIDTH = PAGE.width - 2 * PAGE.marginX;
const LABEL_WIDTH = 112 * PX;
const LABEL_GAP = 20 * PX;
const JOB_WIDTH = 236 * PX;
const JOB_GAP = 16 * PX;
const BAR_WIDTH = CONTENT_WIDTH - JOB_WIDTH - JOB_GAP;
const METRICS_WIDTH = 210 * PX;
const METRICS_GAP = 18 * PX;
const PAIR_GAP = 28 * PX;
const FACTS_GAP = 24 * PX;

const SIZE = {
  name: 30 * PX,
  role: 13 * PX,
  base: 12 * PX,
  text: 11 * PX,
  small: 10 * PX,
  metric: 9.5 * PX,
  tiny: 9 * PX,
  note: 8.5 * PX,
  title: 14 * PX,
  pairTitle: 13 * PX,
};

type Page = { gap: number; padding: number };

const PAGE_TWO: Page = { gap: 18 * PX, padding: 14 * PX };
const PAGE_THREE: Page = { gap: 16 * PX, padding: 12 * PX };

function lineHeight(css: number) {
  return css / FONT_HEIGHT;
}

function boxHeight(size: number, css: number) {
  return size * css;
}

function monoWidth(text: string, size: number) {
  return [...text].length * MONO_ADVANCE * size + MONO_SLACK;
}

function label(text: string, size = SIZE.small): ContentText {
  return {
    text,
    font: FONT.mono,
    bold: true,
    fontSize: size,
    color: COLOR.muted,
    characterSpacing: 0.06 * size,
  };
}

function rule(color: string = COLOR.rule, margin: Margins = [0, 0, 0, 0]): Content {
  return {
    canvas: [
      { type: "line", x1: 0, y1: 0, x2: CONTENT_WIDTH, y2: 0, lineWidth: PX, lineColor: color },
    ],
    margin,
  };
}

function rect(x: number, y: number, w: number, h: number, color: string): CanvasElement {
  return { type: "rect", x, y, w, h, color };
}

function monthIndex(date: YearMonth, timeline: InfographicTimeline) {
  return (date.year - timeline.from) * 12 + date.month - 1;
}

function pad(month: number) {
  return String(month).padStart(2, "0");
}

function formatPeriod(job: InfographicJob, present: string) {
  const start = `${pad(job.start.month)}.${job.start.year}`;
  if (!job.end) return `${start} — ${present}`;
  if (job.end.year === job.start.year) {
    return `${pad(job.start.month)} — ${pad(job.end.month)}.${job.end.year}`;
  }
  return `${start} — ${pad(job.end.month)}.${job.end.year}`;
}

function formatNumber(value: number, locale: string) {
  const digits = new Intl.NumberFormat(LANGUAGE[locale] ?? locale, {
    useGrouping: false,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
  return value < 0 ? `−${digits}` : digits;
}

function changeValue(metric: InfographicChange, locale: string) {
  if (metric.show === "delta") {
    const percent = Math.round(((metric.after - metric.before) / metric.before) * 100);
    return `${percent < 0 ? "−" : "+"}${Math.abs(percent)}%`;
  }
  const after = `${metric.approx ? "~" : ""}${formatNumber(metric.after, locale)}`;
  return `${formatNumber(metric.before, locale)} → ${after}`;
}

function statValue(metric: InfographicStat, locale: string) {
  const approx = metric.approx ? "~" : "";
  const plus = metric.plus ? "+" : "";
  return `${approx}${formatNumber(metric.value, locale)}${metric.unit ?? ""}${plus}`;
}

function metricHead(text: string, value: string): Content {
  return {
    columns: [
      { text, color: COLOR.muted, width: "*" },
      { text: value, font: FONT.mono, width: monoWidth(value, SIZE.metric) },
    ],
    columnGap: 6 * PX,
    fontSize: SIZE.metric,
  };
}

function changeBlock(metric: InfographicChange, locale: string): Content {
  const top = Math.max(metric.before, metric.after);
  const bar = 4 * PX;
  const gap = 2 * PX;
  return {
    stack: [
      metricHead(metric.label, changeValue(metric, locale)),
      {
        canvas: [
          rect(0, 0, (metric.before / top) * METRICS_WIDTH, bar, COLOR.before),
          rect(0, bar + gap, (metric.after / top) * METRICS_WIDTH, bar, COLOR.accent),
        ],
        margin: [0, gap, 0, 0],
      },
    ],
  };
}

function targetBlock(metric: InfographicTarget, locale: string): Content {
  const x = (value: number) => (value / metric.max) * METRICS_WIDTH;
  const track = 6 * PX;
  const overhang = 3 * PX;
  const tick = x(metric.target);
  const half = Math.min(tick, METRICS_WIDTH - tick) * 0.6;
  const range = `${formatNumber(metric.from, locale)}–${formatNumber(metric.to, locale)}`;
  return {
    stack: [
      metricHead(metric.label, range),
      {
        canvas: [
          rect(0, overhang, METRICS_WIDTH, track, COLOR.targetTrack),
          rect(x(metric.from), overhang, x(metric.to) - x(metric.from), track, COLOR.accent),
          rect(tick, 0, PX, track + 2 * overhang, COLOR.muted),
        ],
      },
      {
        columns: [
          { text: formatNumber(0, locale), width: tick - half },
          {
            text: `${metric.targetLabel} ${formatNumber(metric.target, locale)}`,
            alignment: "center",
            width: 2 * half,
          },
          { text: formatNumber(metric.max, locale), alignment: "right", width: "*" },
        ],
        columnGap: 0,
        font: FONT.mono,
        fontSize: SIZE.note,
        color: COLOR.muted,
        margin: [0, 3 * PX - overhang, 0, 0],
      },
    ],
  };
}

function statsBlock(metrics: InfographicStat[], locale: string): Content {
  const values = metrics.map((metric) => statValue(metric, locale));
  const width = Math.max(...values.map((value) => monoWidth(value, SIZE.text)));
  const shift = ASCENT * (SIZE.text - SIZE.metric);
  return {
    stack: metrics.map((metric, index): Content => ({
      columns: [
        {
          text: values[index]!,
          font: FONT.mono,
          fontSize: SIZE.text,
          alignment: "right",
          width,
          ...(metric.accent ? { color: COLOR.accent } : {}),
        },
        {
          text: metric.label,
          fontSize: SIZE.metric,
          color: COLOR.muted,
          width: "*",
          margin: [0, shift, 0, 0],
        },
      ],
      columnGap: 10 * PX,
      margin: [0, index ? 3 * PX : 0, 0, 0],
    })),
  };
}

function noteBlock(metric: InfographicNote): Content {
  return {
    stack: metric.lines.map((text) => ({ text })),
    font: FONT.mono,
    fontSize: SIZE.note,
    color: COLOR.muted,
    lineHeight: lineHeight(1.4),
  };
}

function metricGroups(metrics: InfographicMetric[]) {
  const groups: InfographicMetric[][] = [];
  for (const metric of metrics) {
    const last = groups.at(-1);
    if (metric.kind === "stat" && last?.[0]?.kind === "stat") last.push(metric);
    else groups.push([metric]);
  }
  return groups;
}

function metricsColumn(metrics: InfographicMetric[], locale: string): ContentStack {
  return {
    stack: metricGroups(metrics).map((group, index): Content => {
      const [first] = group;
      const margin: [number, number, number, number] = [0, index ? 9 * PX : 0, 0, 0];
      if (first!.kind === "change") return { stack: [changeBlock(first!, locale)], margin };
      if (first!.kind === "target") return { stack: [targetBlock(first!, locale)], margin };
      if (first!.kind === "note") return { stack: [noteBlock(first!)], margin };
      return { stack: [statsBlock(group as InfographicStat[], locale)], margin };
    }),
  };
}

function bullets(points: string[]): Content {
  return {
    ul: points.map((text) => ({ text, margin: [0, 0, 0, 4 * PX] })),
    markerColor: COLOR.text,
    margin: [0, 6 * PX, 0, 0],
  };
}

function projectHead(project: InfographicProject, meta: string, titleSize: number): Content {
  return {
    stack: [
      { text: project.name, fontSize: titleSize, bold: true },
      { text: meta, fontSize: SIZE.small, color: COLOR.muted },
      {
        text: project.stack.join(" · "),
        font: FONT.mono,
        fontSize: SIZE.tiny,
        color: COLOR.muted,
      },
    ],
  };
}

interface Context {
  locale: string;
  meta: (project: InfographicProject) => string;
}

function projectBody(
  project: InfographicProject,
  context: Context,
  titleSize: number,
): ContentStack {
  return {
    stack: [projectHead(project, context.meta(project), titleSize), bullets(project.points)],
  };
}

function separated(page: Page, color: string, first: boolean, body: Content): Content {
  const stack = first ? [body] : [rule(color, [0, page.gap, 0, page.padding]), body];
  return { stack, unbreakable: true };
}

function projectBlock(
  project: InfographicProject,
  context: Context,
  page: Page,
  first: boolean,
): Content {
  const body: Content = project.metrics.length
    ? {
        columns: [
          { ...projectBody(project, context, SIZE.title), width: "*" } as Column,
          { ...metricsColumn(project.metrics, context.locale), width: METRICS_WIDTH } as Column,
        ],
        columnGap: METRICS_GAP,
      }
    : projectBody(project, context, SIZE.title);
  return separated(page, COLOR.rule, first, body);
}

function pair(projects: InfographicProject[], context: Context): Content {
  return {
    columns: projects.map(
      (project) => ({ ...projectBody(project, context, SIZE.pairTitle), width: "*" }) as Column,
    ),
    columnGap: PAIR_GAP,
  };
}

function pageHeader(title: string, caption: string): Content {
  return {
    stack: [
      {
        columns: [
          { text: [label(title)], width: "*" },
          { text: caption, fontSize: SIZE.small, color: COLOR.muted, width: "auto" },
        ],
        margin: [0, 0, 0, 10 * PX],
      },
      rule(COLOR.text),
    ],
  };
}

function contactsBlock(contacts: ResumeContact[]): ContentColumns {
  const row = (index: number): [number, number, number, number] => [0, index ? 2 * PX : 0, 0, 0];
  return {
    columns: [
      {
        stack: contacts.map((contact, index) => ({
          text: contact.label,
          color: COLOR.muted,
          margin: row(index),
        })),
        width: "auto",
      },
      {
        stack: contacts.map((contact, index) => ({
          text: contact.value,
          ...(contact.href ? { link: contact.href, color: COLOR.accent } : {}),
          margin: row(index),
        })),
        width: "auto",
      },
    ],
    columnGap: 12 * PX,
    font: FONT.mono,
    fontSize: SIZE.small,
  };
}

function header(data: ResumeInfographic): Content {
  const contactsHeight =
    data.contacts.length * boxHeight(SIZE.small, 1.5) + (data.contacts.length - 1) * 2 * PX;
  const titleHeight = boxHeight(SIZE.name, 1.1) + 4 * PX + boxHeight(SIZE.role, 1.5);
  return {
    stack: [
      {
        columns: [
          {
            stack: [
              { text: data.name, fontSize: SIZE.name, bold: true, lineHeight: lineHeight(1.1) },
              { text: data.headline, fontSize: SIZE.role, margin: [0, 4 * PX, 0, 0] },
            ],
            width: "*",
            margin: [0, Math.max(0, contactsHeight - titleHeight), 0, 0],
          },
          { ...contactsBlock(data.contacts), width: "auto" } as Column,
        ],
        columnGap: 24 * PX,
        margin: [0, 0, 0, 18 * PX],
      },
      rule(COLOR.text),
    ],
  };
}

function labelled(title: string, body: Content, offset = 0): Content {
  return {
    columns: [
      { text: [label(title)], width: LABEL_WIDTH, margin: [0, offset, 0, 0] },
      { stack: [body], width: "*" },
    ],
    columnGap: LABEL_GAP,
  };
}

function summary(data: ResumeInfographic): Content {
  return labelled(
    data.summary.title,
    {
      stack: data.summary.paragraphs.map((text, index) => ({
        text,
        margin: [0, index ? 8 * PX : 0, 0, 0],
      })),
      lineHeight: lineHeight(1.55),
    },
    (boxHeight(SIZE.base, 1.55) - boxHeight(SIZE.small, 1.5)) / 2,
  );
}

function legend(data: ResumeInfographic): Content {
  const swatch = { w: 10 * PX, h: 6 * PX };
  const top = (ASCENT - 0.35) * SIZE.small - swatch.h / 2;
  return {
    columns: INFOGRAPHIC_ROLES.map((role): Column => ({
      columns: [
        {
          canvas: [rect(0, 0, swatch.w, swatch.h, ROLE_COLOR[role])],
          width: swatch.w,
          margin: [0, top, 0, 0],
        },
        { text: data.experience.roles[role], width: "auto" },
      ],
      columnGap: 5 * PX,
      width: "auto",
    })),
    columnGap: 12 * PX,
    width: "auto",
  } as Column;
}

function jobRow(job: InfographicJob, data: ResumeInfographic, last: boolean): Content {
  const { timeline, present } = data.experience;
  const total = (timeline.to - timeline.from + 1) * 12;
  const start = monthIndex(job.start, timeline);
  const end = monthIndex(job.end ?? timeline.now, timeline) + 1;
  const textHeight = FONT_HEIGHT * (SIZE.base + SIZE.small + SIZE.tiny);
  const bar = 8 * PX;
  const padding = 7 * PX;
  return {
    stack: [
      rule(),
      {
        columns: [
          {
            stack: [
              { text: job.company, font: FONT.sansMedium },
              {
                text: `${job.title} · ${formatPeriod(job, present)}`,
                fontSize: SIZE.small,
                color: COLOR.muted,
              },
              { text: job.team, font: FONT.mono, fontSize: SIZE.tiny, color: COLOR.muted },
            ],
            lineHeight: 1,
            width: JOB_WIDTH,
          },
          {
            canvas: [
              rect(0, 0, BAR_WIDTH, bar, COLOR.track),
              rect(
                (start / total) * BAR_WIDTH,
                0,
                ((end - start) / total) * BAR_WIDTH,
                bar,
                ROLE_COLOR[job.role],
              ),
            ],
            width: "*",
            margin: [0, (textHeight - bar) / 2, 0, 0],
          },
        ],
        columnGap: JOB_GAP,
        margin: [0, padding, 0, padding],
      },
      ...(last ? [rule()] : []),
    ],
  };
}

function axis(timeline: InfographicTimeline): Content {
  const years = Array.from(
    { length: timeline.to - timeline.from + 1 },
    (_, index) => timeline.from + index,
  );
  return {
    columns: [
      { text: "", width: JOB_WIDTH },
      {
        columns: years.map((year) => ({ text: String(year), width: "*" })),
        columnGap: 0,
        width: "*",
      },
    ],
    columnGap: JOB_GAP,
    font: FONT.mono,
    fontSize: SIZE.tiny,
    color: COLOR.muted,
    margin: [0, 4 * PX, 0, 0],
  };
}

function experience(data: ResumeInfographic): Content {
  const { jobs, timeline } = data.experience;
  return {
    stack: [
      {
        columns: [
          { text: [label(data.experience.title)], width: LABEL_WIDTH },
          {
            columns: [{ text: data.experience.total, width: "*" }, legend(data)],
            columnGap: 0,
            width: "*",
            fontSize: SIZE.small,
            color: COLOR.muted,
          },
        ],
        columnGap: LABEL_GAP,
        margin: [0, 0, 0, 10 * PX],
      },
      ...jobs.map((job, index) => jobRow(job, data, index === jobs.length - 1)),
      axis(timeline),
    ],
  };
}

function stack(data: ResumeInfographic): Content {
  return labelled(data.stack.title, {
    stack: data.stack.groups.map((group, index) => ({
      columns: [
        { text: group.name, color: COLOR.muted, width: 92 * PX },
        { text: group.items.join(", "), width: "*" },
      ],
      columnGap: 12 * PX,
      margin: [0, index ? 6 * PX : 0, 0, 0],
    })),
    fontSize: SIZE.text,
    lineHeight: lineHeight(1.45),
  });
}

function sectionGap(content: Content, gap: number): Content {
  return { stack: [content], margin: [0, gap, 0, 0] };
}

function fact(item: InfographicFact): Content {
  const line = (text: string, color: string = COLOR.text): Content => ({
    text,
    color,
    margin: [0, 3 * PX, 0, 0],
  });
  return {
    stack: [
      { text: [label(item.title, SIZE.tiny)] },
      ...item.lines.map((text) => line(text)),
      ...(item.note ? [line(item.note, COLOR.muted)] : []),
    ],
    width: "*",
  } as Column;
}

function aiBlock(data: ResumeInfographic, context: Context): Content {
  const { ai } = data;
  const link: Content[] = ai.link?.href
    ? [
        {
          text: ai.link.label,
          link: ai.link.href,
          color: COLOR.accent,
          decoration: "underline",
          fontSize: SIZE.small,
          margin: [0, 6 * PX, 0, 0],
        },
      ]
    : [];
  return {
    columns: [
      {
        stack: [{ text: [label(ai.title)] }, { text: ai.text, margin: [0, 6 * PX, 0, 0] }, ...link],
        width: "*",
      },
      { ...metricsColumn(ai.metrics, context.locale), width: METRICS_WIDTH } as Column,
    ],
    columnGap: METRICS_GAP,
  };
}

function strongSection(page: Page, body: Content): Content {
  return separated(page, COLOR.text, false, body);
}

export function resumeToPdfInfographic(
  data: ResumeInfographic,
  locale: string,
): TDocumentDefinitions {
  const jobs = new Map(data.experience.jobs.map((job) => [job.id, job]));
  const context: Context = {
    locale,
    meta: (project) =>
      project.meta
        .map((part) => {
          if (typeof part === "string") return part;
          const job = jobs.get(part.job);
          if (!job) throw new Error(`Unknown job "${part.job}" in project "${project.id}"`);
          return formatPeriod(job, data.experience.present);
        })
        .join(" · "),
  };
  const { projects, products } = data;
  const caption = (page: number) => `${data.name} · ${page}`;

  return {
    pageSize: "A4",
    pageMargins: [PAGE.marginX, PAGE.marginY, PAGE.marginX, PAGE.marginY],
    language: LANGUAGE[locale] ?? locale,
    info: { title: `${data.name} — ${data.headline}`, author: data.name },
    defaultStyle: {
      font: FONT.sans,
      fontSize: SIZE.base,
      lineHeight: lineHeight(1.5),
      color: COLOR.text,
    },
    content: [
      header(data),
      sectionGap(summary(data), 28 * PX),
      sectionGap(experience(data), 28 * PX),
      sectionGap(stack(data), 28 * PX),
      {
        stack: [
          pageHeader(projects.title, caption(2)),
          ...projects.main.map((project, index) =>
            sectionGap(
              projectBlock(project, context, PAGE_TWO, index === 0),
              index ? 0 : PAGE_TWO.gap,
            ),
          ),
        ],
        fontSize: SIZE.text,
        pageBreak: "before",
      },
      {
        stack: [
          pageHeader(projects.title, caption(3)),
          ...projects.more.map((project, index) =>
            sectionGap(
              projectBlock(project, context, PAGE_THREE, index === 0),
              index ? 0 : PAGE_THREE.gap,
            ),
          ),
          separated(PAGE_THREE, COLOR.rule, false, pair(projects.earlier, context)),
          strongSection(PAGE_THREE, {
            stack: [
              { text: [label(products.title)] },
              { stack: [pair(products.items, context)], margin: [0, 10 * PX, 0, 0] },
            ],
          }),
          strongSection(PAGE_THREE, aiBlock(data, context)),
          strongSection(PAGE_THREE, {
            columns: data.facts.map(fact),
            columnGap: FACTS_GAP,
            fontSize: SIZE.small,
          }),
        ],
        fontSize: SIZE.text,
        pageBreak: "before",
      },
    ],
  };
}

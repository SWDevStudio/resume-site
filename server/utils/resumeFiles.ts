import pdfmake from "pdfmake";
import vfs from "pdfmake/build/vfs_fonts.js";
import { useStorage } from "nitropack/runtime";
import { useSafeRuntimeConfig } from "#imports";
import { LOCALES, type Locale } from "../../app/assets/const/locale";
import { Route } from "../../app/assets/const/route";
import { resumeToMarkdown } from "../../shared/utils/resumeToMarkdown";
import { PDF_SYMBOL_FONT } from "../../shared/utils/resumeToPdf";
import { PDF_INFOGRAPHIC_FONTS } from "../../shared/utils/resumeToPdfInfographic";
import {
  RESUME_PDF_VARIANT,
  resumePdfDocument,
  type ResumePdfVariant,
} from "../../shared/utils/resumePdfVariant";
import { buildResume } from "../../app/assets/api/mock/build/resume";
import { buildResumeInfographic } from "../../app/assets/api/mock/build/resumeInfographic";
import { staticSources } from "../../app/assets/api/mock/sources.static";

interface VirtualFs {
  writeFileSync(file: string, content: Buffer): void;
}

const sources = staticSources();

const SYMBOL_FONT_FILE = "DejaVuSans-Arrow.ttf";

const PLEX_FILES = {
  sans: "IBMPlexSans-Regular.ttf",
  sansMedium: "IBMPlexSans-Medium.ttf",
  sansSemiBold: "IBMPlexSans-SemiBold.ttf",
  mono: "IBMPlexMono-Regular.ttf",
  monoMedium: "IBMPlexMono-Medium.ttf",
};

const SERVER_FONT_FILES: Record<ResumePdfVariant, string[]> = {
  text: [SYMBOL_FONT_FILE],
  infographic: Object.values(PLEX_FILES),
};

function fontFamily(normal: string, bold = normal) {
  return { normal, bold, italics: normal, bolditalics: bold };
}

const fonts = {
  Roboto: {
    normal: "Roboto-Regular.ttf",
    bold: "Roboto-Medium.ttf",
    italics: "Roboto-Italic.ttf",
    bolditalics: "Roboto-MediumItalic.ttf",
  },
  [PDF_SYMBOL_FONT]: {
    normal: SYMBOL_FONT_FILE,
    bold: SYMBOL_FONT_FILE,
    italics: SYMBOL_FONT_FILE,
    bolditalics: SYMBOL_FONT_FILE,
  },
  [PDF_INFOGRAPHIC_FONTS.sans]: fontFamily(PLEX_FILES.sans, PLEX_FILES.sansSemiBold),
  [PDF_INFOGRAPHIC_FONTS.sansMedium]: fontFamily(PLEX_FILES.sansMedium),
  [PDF_INFOGRAPHIC_FONTS.mono]: fontFamily(PLEX_FILES.mono, PLEX_FILES.monoMedium),
};

const files = (pdfmake as unknown as { virtualfs: VirtualFs }).virtualfs;
for (const file of Object.values(fonts.Roboto)) {
  files.writeFileSync(file, Buffer.from(vfs[file]!, "base64"));
}
pdfmake.setFonts(fonts);
pdfmake.setLocalAccessPolicy(() => false);
pdfmake.setUrlAccessPolicy(() => false);

const pdfCache = new Map<Locale, Promise<Buffer>>();
let serverFonts: Promise<void> | undefined;

function loadServerFonts() {
  const storage = useStorage("assets:server");
  serverFonts ??= Promise.all(
    SERVER_FONT_FILES[RESUME_PDF_VARIANT].map(async (file) => {
      const raw = await storage.getItemRaw<Uint8Array>(`fonts/${file}`);
      if (!raw) throw new Error(`Missing server asset fonts/${file}`);
      files.writeFileSync(file, Buffer.from(raw));
    }),
  )
    .then(() => undefined)
    .catch((error: unknown) => {
      serverFonts = undefined;
      throw error;
    });
  return serverFonts;
}

export function resolveResumeLocale(value: string | undefined): Locale | undefined {
  return LOCALES.find((locale) => locale === value);
}

function resumeUrl(locale: Locale) {
  const baseUrl = useSafeRuntimeConfig().public.i18n.baseUrl.replace(/\/+$/, "");
  return baseUrl ? `${baseUrl}/${locale}${Route.resume}` : undefined;
}

export function resumeMarkdown(locale: Locale) {
  return resumeToMarkdown(buildResume(sources, locale), resumeUrl(locale));
}

export function resumePdf(locale: Locale) {
  let pdf = pdfCache.get(locale);
  if (!pdf) {
    pdf = loadServerFonts().then(() =>
      pdfmake
        .createPdf(
          resumePdfDocument({
            locale,
            siteUrl: resumeUrl(locale),
            resume: () => buildResume(sources, locale),
            infographic: () => buildResumeInfographic(sources, locale),
          }),
        )
        .getBuffer(),
    );
    pdf.catch(() => pdfCache.delete(locale));
    pdfCache.set(locale, pdf);
  }
  return pdf;
}

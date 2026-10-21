import pdfmake from "pdfmake";
import vfs from "pdfmake/build/vfs_fonts";
import { LOCALES, type Locale } from "../../app/assets/const/locale";
import { resumeToMarkdown } from "../../shared/utils/resumeToMarkdown";
import { resumeToPdf } from "../../shared/utils/resumeToPdf";
import { buildResume } from "../../shared/mock/build/resume";
import { staticSources } from "../../shared/mock/sources.static";

interface VirtualFs {
  writeFileSync(file: string, content: Buffer): void;
}

const sources = staticSources();

const fonts = {
  Roboto: {
    normal: "Roboto-Regular.ttf",
    bold: "Roboto-Medium.ttf",
    italics: "Roboto-Italic.ttf",
    bolditalics: "Roboto-MediumItalic.ttf",
  },
};

const files = (pdfmake as unknown as { virtualfs: VirtualFs }).virtualfs;
for (const file of Object.values(fonts.Roboto)) {
  files.writeFileSync(file, Buffer.from(vfs[file]!, "base64"));
}
pdfmake.setFonts(fonts);
pdfmake.setLocalAccessPolicy(() => false);
pdfmake.setUrlAccessPolicy(() => false);

const pdfCache = new Map<Locale, Promise<Buffer>>();

export function resolveResumeLocale(value: string | undefined): Locale | undefined {
  return LOCALES.find((locale) => locale === value);
}

export function resumeMarkdown(locale: Locale) {
  return resumeToMarkdown(buildResume(sources, locale));
}

export function resumePdf(locale: Locale) {
  let pdf = pdfCache.get(locale);
  if (!pdf) {
    pdf = pdfmake.createPdf(resumeToPdf(buildResume(sources, locale), locale)).getBuffer();
    pdf.catch(() => pdfCache.delete(locale));
    pdfCache.set(locale, pdf);
  }
  return pdf;
}

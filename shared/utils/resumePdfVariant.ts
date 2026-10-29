import type { TDocumentDefinitions } from "pdfmake/interfaces";
import type { ResumeData } from "../../app/assets/api/types/resume";
import type { ResumeInfographic } from "../../app/assets/api/types/resumeInfographic";
import { resumeToPdf } from "./resumeToPdf";
import { resumeToPdfInfographic } from "./resumeToPdfInfographic";

export type ResumePdfVariant = "text" | "infographic";

export const RESUME_PDF_VARIANT: ResumePdfVariant = "infographic";

export interface ResumePdfInput {
  locale: string;
  siteUrl?: string;
  resume: () => ResumeData;
  infographic: () => ResumeInfographic;
}

export function resumePdfDocument(
  input: ResumePdfInput,
  variant: ResumePdfVariant = RESUME_PDF_VARIANT,
): TDocumentDefinitions {
  if (variant === "text") return resumeToPdf(input.resume(), input.locale, input.siteUrl);
  return resumeToPdfInfographic(input.infographic(), input.locale);
}

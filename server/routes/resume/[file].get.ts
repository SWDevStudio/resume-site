import { createError, defineEventHandler, getRouterParam, setResponseHeaders } from "h3";
import { resolveResumeLocale, resumeMarkdown, resumePdf } from "../../utils/resumeFiles";

const FILE = /^([a-z]{2})\.(pdf|md)$/;

export default defineEventHandler(async (event) => {
  const match = FILE.exec(getRouterParam(event, "file") ?? "");
  const locale = resolveResumeLocale(match?.[1]);
  if (!match || !locale) throw createError({ statusCode: 404, statusMessage: "Not Found" });

  if (match[2] === "pdf") {
    setResponseHeaders(event, {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="resume-${locale}.pdf"`,
    });
    return resumePdf(locale);
  }

  setResponseHeaders(event, { "content-type": "text/markdown; charset=utf-8" });
  return resumeMarkdown(locale);
});

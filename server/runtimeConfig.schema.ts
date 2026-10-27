import { z } from "zod";

const providerKeys = ["groqKey", "openrouterKey", "githubToken"] as const;

const assistant = z
  .object({
    groqKey: z.string(),
    cloudflareAccountId: z.string(),
    cloudflareToken: z.string(),
    openrouterKey: z.string(),
    githubToken: z.string(),
    secret: z.string().min(32),
  })
  .refine(
    (config) =>
      providerKeys.some((key) => config[key] !== "") ||
      (config.cloudflareAccountId !== "" && config.cloudflareToken !== ""),
    {
      message:
        "At least one assistant provider must be configured: groqKey, openrouterKey, githubToken or cloudflareAccountId with cloudflareToken",
    },
  );

const telegram = z.object({
  botToken: z.string(),
  chatId: z.string(),
});

const publicConfig = z
  .object({
    i18n: z.object({ baseUrl: z.string() }).passthrough(),
    yandexMetrikaId: z.union([z.string(), z.number()]),
  })
  .passthrough();

const runtimeConfigSchema = z.object({ assistant, telegram, public: publicConfig }).passthrough();

export default { "~standard": runtimeConfigSchema["~standard"] };

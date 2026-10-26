import { defineNitroPlugin } from "nitropack/runtime";
import { useSafeRuntimeConfig } from "#imports";
import runtimeConfigSchema from "../runtimeConfig.schema";

export default defineNitroPlugin(() => {
  const result = runtimeConfigSchema["~standard"].validate(useSafeRuntimeConfig());

  if (result instanceof Promise) {
    throw new TypeError("Runtime config schema must validate synchronously");
  }

  if (result.issues) {
    const fields = result.issues.map((issue) => {
      const path = (issue.path ?? [])
        .map((segment) => String(typeof segment === "object" ? segment.key : segment))
        .join(".");

      return `${path || "root"}: ${issue.message}`;
    });

    throw new Error(`Invalid runtime config: ${fields.join("; ")}`);
  }
});

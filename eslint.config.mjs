import withNuxt from "./.nuxt/eslint.config.mjs";
import prettier from "eslint-config-prettier/flat";
import css from "@eslint/css";
import stylistic from "@stylistic/eslint-plugin";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import { tailwind4 } from "tailwind-csstree";

const codeFiles = ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx,vue}"];

const tailwind = betterTailwindcss.configs["recommended-error"];

const tailwindSettings = {
  "better-tailwindcss": {
    entryPoint: "app/assets/css/main.css",
  },
};

const tailwindRules = {
  ...tailwind.rules,
  // Prettier сам схлопывает class в одну строку, поэтому перенос строк правилом конфликтует с ним
  "better-tailwindcss/enforce-consistent-line-wrapping": "off",
  "better-tailwindcss/no-unknown-classes": ["error", { ignore: ["^the-header(-.+)?$"] }],
};

export default withNuxt(
  prettier,
  {
    name: "typescript/module-augmentation",
    files: codeFiles,
    rules: {
      "@typescript-eslint/no-empty-object-type": [
        "error",
        { allowInterfaces: "with-single-extends" },
      ],
    },
  },
  {
    name: "stylistic/type-literals",
    files: codeFiles,
    plugins: { "@stylistic": stylistic },
    rules: {
      "@stylistic/object-curly-newline": [
        "error",
        { TSTypeLiteral: { minProperties: 2, consistent: true } },
      ],
    },
  },
  {
    name: "tailwind/classes",
    files: codeFiles,
    plugins: tailwind.plugins,
    settings: tailwindSettings,
    rules: tailwindRules,
  },
  {
    name: "tailwind/apply",
    files: ["**/*.css"],
    plugins: { ...tailwind.plugins, css },
    language: "css/css",
    languageOptions: {
      customSyntax: tailwind4,
      tolerant: true,
    },
    settings: tailwindSettings,
    rules: tailwindRules,
  },
).onResolved((configs) =>
  // Правила JS из Nuxt-конфига не должны попадать на .css: у языка css/css нет нужного API
  configs.map((config) => {
    const isGlobalIgnores = Object.keys(config).every((key) => key === "name" || key === "ignores");
    return config.files || isGlobalIgnores ? config : { ...config, files: codeFiles };
  }),
);

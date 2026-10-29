import type { SkillsCanon } from "../../api/types/catalog";

const skills = {
  groups: [
    {
      id: "frontend",
      kind: "tech",
      skills: [
        {
          id: "java-script",
          kind: "tech",
          label: "JavaScript",
        },
        {
          id: "type-script",
          kind: "tech",
        },
        {
          id: "html5",
          kind: "tech",
        },
        {
          id: "css3",
          kind: "tech",
        },
        {
          id: "sass",
          kind: "tech",
        },
        {
          id: "vue",
          kind: "tech",
          label: "Vue",
        },
        {
          id: "nuxt",
          kind: "tech",
          label: "Nuxt",
        },
        {
          id: "react",
          kind: "tech",
        },
        {
          id: "next-js",
          kind: "tech",
        },
        {
          id: "vue-router",
          kind: "tech",
        },
        {
          id: "tailwind",
          kind: "tech",
          label: "Tailwind",
        },
        {
          id: "bootstrap",
          kind: "tech",
        },
        {
          id: "spa",
          kind: "tech",
        },
        {
          id: "ssr",
          kind: "tech",
        },
        {
          id: "mpa",
          kind: "tech",
        },
        {
          id: "seo",
          kind: "tech",
        },
        {
          id: "chrome-dev-tools",
          kind: "tech",
        },
      ],
    },
    {
      id: "backend",
      kind: "tech",
      skills: [
        {
          id: "node-js",
          kind: "tech",
        },
        {
          id: "nest-js",
          kind: "tech",
        },
        {
          id: "express",
          kind: "tech",
        },
        {
          id: "laravel",
          kind: "tech",
        },
        {
          id: "rust",
          kind: "tech",
        },
        {
          id: "postgre-sql",
          kind: "tech",
        },
        {
          id: "redis",
          kind: "tech",
        },
        {
          id: "rest-api",
          kind: "tech",
        },
        {
          id: "docker",
          kind: "tech",
        },
        {
          id: "nginx",
          kind: "tech",
        },
        {
          id: "ci-cd",
          kind: "tech",
        },
        {
          id: "gh-actions",
          kind: "tech",
          label: "GH Actions",
        },
      ],
    },
    {
      id: "lead",
      kind: "soft",
      skills: [
        {
          id: "team-management",
          kind: "soft",
        },
        {
          id: "task-setting",
          kind: "soft",
        },
        {
          id: "workload-balancing",
          kind: "soft",
        },
        {
          id: "task-estimation",
          kind: "soft",
        },
        {
          id: "workload-analytics",
          kind: "soft",
        },
        {
          id: "sprint-tracking",
          kind: "soft",
        },
        {
          id: "technical-decisions",
          kind: "soft",
        },
        {
          id: "confluence",
          kind: "tech",
        },
        {
          id: "code-review",
          kind: "tech",
        },
        {
          id: "mentoring",
          kind: "soft",
        },
        {
          id: "agile",
          kind: "tech",
        },
        {
          id: "scrum",
          kind: "tech",
        },
      ],
    },
    {
      id: "additional",
      kind: "tech",
      skills: [
        {
          id: "vite",
          kind: "tech",
        },
        {
          id: "webpack",
          kind: "tech",
        },
        {
          id: "git",
          kind: "tech",
        },
        {
          id: "github",
          kind: "tech",
        },
        {
          id: "git-lab",
          kind: "tech",
        },
        {
          id: "figma",
          kind: "tech",
        },
        {
          id: "redux",
          kind: "tech",
        },
        {
          id: "vitest",
          kind: "tech",
        },
        {
          id: "jest",
          kind: "tech",
        },
        {
          id: "tauri",
          kind: "tech",
        },
        {
          id: "prometheus",
          kind: "tech",
        },
        {
          id: "storybook",
          kind: "tech",
        },
        {
          id: "jira",
          kind: "tech",
        },
        {
          id: "claude-code",
          kind: "tech",
        },
        {
          id: "codex",
          kind: "tech",
        },
        {
          id: "gemini",
          kind: "tech",
        },
        {
          id: "mcp",
          kind: "tech",
        },
        {
          id: "atlassian-rovo",
          kind: "tech",
        },
        {
          id: "zustand",
          kind: "tech",
        },
        {
          id: "swr",
          kind: "tech",
        },
        {
          id: "tanstack-query",
          kind: "tech",
        },
        {
          id: "pinia",
          kind: "tech",
        },
        {
          id: "vuex",
          kind: "tech",
        },
        {
          id: "react-hook-form",
          kind: "tech",
        },
        {
          id: "zod",
          kind: "tech",
        },
        {
          id: "capacitor",
          kind: "tech",
        },
        {
          id: "graph-ql",
          kind: "tech",
        },
        {
          id: "websocket",
          kind: "tech",
        },
        {
          id: "clinic-js",
          kind: "tech",
        },
        {
          id: "autocannon",
          kind: "tech",
        },
        {
          id: "lighthouse",
          kind: "tech",
        },
        {
          id: "github-copilot",
          kind: "tech",
        },
        {
          id: "ai-agents",
          kind: "tech",
        },
      ],
    },
  ],
} satisfies SkillsCanon;

export default skills;

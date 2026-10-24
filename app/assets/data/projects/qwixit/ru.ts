import type { ProjectBlock } from "../../../../types/projectCase";

const qwixit = [
  {
    component: "ProjectCaseHeader",
    data: {},
  },
  {
    component: "ProjectCaseCover",
    data: {},
  },
  {
    component: "ProjectCaseMeta",
    data: {},
  },
  {
    component: "ProjectCaseChapter",
    data: {
      id: "about",
      name: "About the project",
      blocks: [
        {
          component: "ProjectCaseChapter",
          data: {
            id: "business",
            name: "Business",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "[Who the client is and what they sell: one or two sentences.]",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "situation",
            name: "The situation",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "[What was there before you came in: the problem, the numbers, the constraints.]",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "goal",
            name: "The goal",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "[What the client wanted to achieve and how success was measured.]",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "solution",
            name: "The solution",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "[The approach in a nutshell: what you proposed and why.]",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "results",
            name: "Results",
            blocks: [
              {
                component: "ProjectCaseResults",
                data: {
                  stats: [
                    {
                      value: "[+000%]",
                      label: "[organic traffic]",
                    },
                    {
                      value: "[0.0 s]",
                      label: "[LCP on mobile]",
                    },
                    {
                      value: "[00k]",
                      label: "[orders a month]",
                    },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "[What these numbers mean for the business, in one sentence.]",
                },
              },
            ],
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseChapter",
    data: {
      id: "process",
      name: "The process",
      blocks: [
        {
          component: "ProjectCaseChapter",
          data: {
            id: "design",
            name: "Design",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "[Research, prototypes, the design system, key screens.]",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "development",
            name: "Development",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "[Stack, architecture, the trickiest parts and how you solved them.]",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "seo",
            name: "Search engine optimization",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "[Technical SEO, Core Web Vitals, structured data, content.]",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "integrations",
            name: "Integrations",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "[Payments, CRM, delivery services, stock updates.]",
                },
              },
            ],
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseNext",
    data: {},
  },
] satisfies ProjectBlock[];

export default qwixit;

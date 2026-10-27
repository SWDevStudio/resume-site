import type { ProjectBlock } from "../../../api/types/projectCase";

const cdekShopping = [
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
    component: "ProjectCaseFacts",
    data: {
      facts: [
        { key: "role", value: "Middle Frontend Developer" },
        { key: "team", value: "4 frontend, 8 backend, 2 QA and a designer" },
        { key: "duration", value: "2 years, 10.2021 – 10.2023" },
        { key: "status", value: "The site is live, my work on the project is over" },
      ],
    },
  },
  {
    component: "ProjectCaseRole",
    data: {
      id: "role",
      name: "What I did",
      items: [
        {
          title: "Customer account",
          text: "The entire frontend of the account in Vue 2 and Vuex: five sections in one app with no page reloads. I wrote every component of the account from the team designer's mockups.",
        },
        {
          title: "Vue inside Blade",
          text: "Convinced the team to adopt Vue 2 and came up with a way to embed the SPA account into Laravel + Blade without a separate frontend project.",
        },
        {
          title: "Legacy refactoring",
          text: "Covered the jQuery code with Cypress E2E tests and visual baselines, then split files of 6,000+ lines into modules with Jest unit tests.",
        },
        {
          title: "Laravel and analytics",
          text: "Blade templates, routes and account data in API responses. Set up Yandex Metrica and added events. Reviewed the tasks of the other frontend developers.",
        },
      ],
    },
  },
  {
    component: "ProjectCaseChapter",
    data: {
      id: "context",
      name: "Context and starting point",
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
                  text: "CDEK.Shopping is an agent for shopping abroad run by CDEK.Market LLC, a service of the CDEK group. Customers in Russia order products of brands from the US, Europe and Asia: they pay with a Russian card and see prices in rubles right away.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "The service handles customs clearance and logistics, and orders are delivered by the group's own logistics company.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "If the product is not in the catalog, the customer leaves a purchase request: sends a link to the product in a foreign store and specifies the size, color and quantity. A manager checks availability and calculates the final price in rubles with delivery and the service fee. After confirmation and payment, the service buys the product, and the order appears in the account on the “By purchase request” tab.",
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
                  text: "The business wanted to launch as soon as possible, so the new service was built on the CDEK Market codebase: jQuery and Blade, files of 6,000+ lines. The customer account there was built on server templates with no interactivity: every action reloaded the page, and the customer waited for the server at every step.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "The accumulated tech debt slowed development down and was waiting to be solved, but the plan had no separate time for refactoring: it had to run alongside the launch, on the same deadlines.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "goal",
            name: "Goal",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Build an interactive customer account by the launch, where no action reloads the page. CDEK.Shopping users never saw the old account: they started right away in the new one.",
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
      name: "Process, architecture and decisions",
      blocks: [
        {
          component: "ProjectCaseChapter",
          data: {
            id: "account",
            name: "Customer account",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "The account is built as one Vue app: each section is a separate module with its own Vuex state and API requests. So the customer moves between sections without a page reload, and a new section can be added without touching the others.",
                },
              },
              {
                component: "ProjectCaseSteps",
                data: {
                  steps: [
                    {
                      title: "My details",
                      text: "Forms for contacts and customs clearance details, with the email and phone change moved into a separate flow",
                    },
                    {
                      title: "Orders",
                      text: "“All”, “Unpaid” and “By purchase request” tabs, a filter and pagination with no reload, the status of every item, a separate order page",
                    },
                    {
                      title: "My points",
                      text: "Active, accrued and frozen points from the loyalty program API, the points history",
                    },
                    {
                      title: "Delivery address",
                      text: "Choosing the default address, switching between delivery to the door and to a pickup point",
                    },
                    {
                      title: "Reviews",
                      text: "Products waiting for a review and reviews already written, in one section",
                    },
                    {
                      title: "Navigation",
                      text: "Counters of unpaid orders and products without a review on the tabs, hash routing, a separate mobile navigation",
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
            id: "architecture",
            name: "Architecture",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "The storefront stayed server-rendered, while the account runs as a single-page app inside the same site. It did not need a separate frontend project.",
                },
              },
              {
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "STOREFRONT",
                      title: "Storefront",
                      text: "Server rendering with Blade, interactivity with jQuery.",
                    },
                    {
                      label: "ACCOUNT",
                      title: "Customer account",
                      text: "Vue 2 and Vuex. The backend serves an #app container, the app mounts inside it, routing goes through the hash.",
                      code: ["account", "orderListing", "orderDetailsPage"],
                    },
                    {
                      label: "API",
                      title: "REST on Laravel",
                      text: "The account gets its data through axios: profile, orders, points, delivery and reviews.",
                      code: ["/api/v1/account", "/api/v1/loyalty", "/api/v1/customer"],
                    },
                    {
                      label: "SERVICES",
                      title: "External services",
                      text: "Payments, the Mindbox marketing tracker, Diginetica search, Yandex Metrica.",
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
            id: "components",
            name: "Account components",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "We designed the component system together with the team designer, with BEM naming. The account has 16 base UI components: buttons, a checkbox, tabs, a select, a filter, a modal, a notification, a tooltip, pagination and others.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "They make up about 40 section blocks, and the icons live in a sprite of about 30. I built the account responsive from the start, with a separate mobile navigation.",
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
                component: "ProjectCaseIntegrations",
                data: {
                  items: [
                    { label: "Yandex Metrica · events", own: true },
                    { label: "Online payments" },
                    { label: "Mindbox · marketing tracker" },
                    { label: "Diginetica · search with autocomplete" },
                  ],
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "security",
            name: "Data security",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "The account works with customers' personal data, including passport details for customs clearance. They are stored encrypted in the database, and the profile API responses return them only masked. To see the data in full, the account makes a separate request to a protected endpoint. The server checks the user's session and permissions, decrypts the data and returns it only in that response. On the client it is not stored in Vuex or cached: once the block is closed, the mask is shown again.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "quality",
            name: "Quality and releases",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Before the refactoring I covered the store's critical scenarios with Cypress E2E tests and took visual baselines of the components. The modules that appeared after the refactoring are covered with Jest unit tests.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Every task goes through CI checks and a test stand, then on the planned release date it lands on a preprod identical to production. After acceptance the release rolls out to production with no downtime, and if something goes wrong we can quickly roll back to the previous stable version.",
                },
              },
              {
                component: "ProjectCasePipeline",
                data: {
                  stages: [
                    { name: "develop", next: "test stand" },
                    { name: "preprod", next: "acceptance" },
                    { name: "master", next: "production, no downtime" },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "We worked in two-week sprints with a demo at the end of each. Every task went through code review, and I reviewed the tasks of the other frontend developers.",
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
      id: "challenges",
      name: "Challenges",
      blocks: [
        {
          component: "ProjectCaseChallenges",
          data: {
            items: [
              {
                id: "legacy",
                name: "Legacy files of 6,000+ lines",
                rows: [
                  {
                    key: "problem",
                    text: "The jQuery client code lived in files of 6,000+ lines. Writing unit tests for such spaghetti was impossible, and touching it without tests was risky.",
                  },
                  {
                    key: "solution",
                    text: "First I covered the critical scenarios with Cypress E2E tests and took visual baselines, so the refactoring would break neither the logic nor the layout. Then, following the Refactoring.Guru principles, I moved repeated code into modules and kept splitting them until only pure functions covered with Jest unit tests were left.",
                  },
                  {
                    key: "result",
                    text: "Regression bugs dropped by 37% according to QA reports. Features started shipping faster, and sprint overruns went down.",
                  },
                ],
              },
              {
                id: "vue",
                name: "Vue 2 in a jQuery project",
                rows: [
                  {
                    key: "problem",
                    text: "The whole project was written in jQuery and Blade. An interactive account needed a modern framework, and the team had to be convinced to adopt one.",
                  },
                  {
                    key: "solution",
                    text: "Got approval to add Vue 2 to the account and embedded it without a separate project: the backend serves an #app container, the app mounts inside it, routing goes through the hash. The account was meant to show on a live example that writing in Vue is simpler and faster than maintaining the legacy code.",
                  },
                  {
                    key: "result",
                    text: "The new service's account launched on Vue 2 and Vuex and became an argument for leaving the legacy code: the team decided to rewrite the project in Nuxt.",
                  },
                ],
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
      id: "results",
      name: "Metrics and results",
      blocks: [
        {
          component: "ProjectCaseResults",
          data: {
            stats: [
              {
                value: "−37%",
                label: "regression bugs after the refactoring",
              },
              {
                value: "5",
                label: "account sections in one app",
              },
              {
                value: "16",
                label: "base UI components of the account",
              },
              {
                value: "≤ 2.5 s",
                label: "LCP (Largest Contentful Paint)",
              },
              {
                value: "≤ 200 ms",
                label: "INP (Interaction to Next Paint)",
              },
              {
                value: "≤ 0.1",
                label: "CLS (Cumulative Layout Shift)",
              },
            ],
          },
        },
        {
          component: "ProjectCaseText",
          data: {
            text: "CDEK.Shopping customers worked in the new account from day one, and the legacy refactoring cut regressions and sped up feature delivery.",
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseCta",
    data: {
      id: "cta",
      title: "Need a modern customer account in a legacy project?",
      text: "I will embed an interactive account into your existing site without a separate frontend project, cover the legacy code with tests and split it into modules.",
    },
  },
  {
    component: "ProjectCaseNext",
    data: {},
  },
] satisfies ProjectBlock[];

export default cdekShopping;

import type { ProjectBlock } from "../../../api/types/projectCase";

const taobao = [
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
        { key: "role", value: "Fullstack Developer" },
        { key: "team", value: "2 fullstack developers and a junior frontend developer" },
        { key: "duration", value: "January 2026 – March 2026" },
        { key: "status", value: "Completed, the site is live" },
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
          title: "Design and UI kit",
          text: "The site design is entirely mine. The UI kit is built on Tailwind and daisyUI with a custom theme, so the look changes by switching the theme. For the business, this means a new style for a promotion or a rebranding can be shown and rolled out in a day, without redoing the layout.",
        },
        {
          title: "Storefront in Nuxt",
          text: "I proposed making the storefront a separate Nuxt application with server-side rendering: pages open faster and are indexed better by search engines, and search is a direct source of customers for the store. I built its client side myself: Pinia, Russian and English interface, the layer of API requests.",
        },
        {
          title: "Admin panel",
          text: "The client side of the operator workspace and its requests to the backend. The faster an operator processes an order, the sooner the customer gets the product, so the speed of the whole service depends directly on how convenient the admin panel is.",
        },
        {
          title: "Storefront API",
          text: "Laravel endpoints that feed the storefront. The cart and favorites work without signing up, so the customer gets to the order without an extra step, and the business loses fewer customers along the way.",
        },
      ],
    },
  },
  {
    component: "ProjectCaseChapter",
    data: {
      id: "context",
      name: "Context",
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
                  text: "The client purchases and delivers products from China and Hong Kong. Its customers live in Russia, and for many of them the service is a way to buy what has become unavailable or noticeably more expensive in Russian stores. China and Hong Kong are major trade hubs: they sell products of global brands, including European and American ones, often cheaper than in Russia. So customers order not only Chinese products through the service, but also IKEA furniture, Apple devices for the Hong Kong market, clothing and shoes from Farfetch, and computer components.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "If an item is not in the catalog, it can be ordered with a purchase request.",
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
            id: "flow",
            name: "The order flow",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "The catalog price is in rubles right away and already includes duties, the service fee and delivery. After that an order goes through four steps.",
                },
              },
              {
                component: "ProjectCaseSteps",
                data: {
                  steps: [
                    {
                      title: "Order",
                      text: "From the catalog or with a purchase request. The cart and favorites work without signing up",
                    },
                    {
                      title: "Payment",
                      text: "By a MIR card or via SBP",
                    },
                    {
                      title: "Check",
                      text: "The order is checked for completeness before shipping",
                    },
                    {
                      title: "Delivery",
                      text: "17–28 days to Russia, the status is visible in the personal account. Pickup point or courier",
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
                  text: "The storefront lives separately from the backend. It is easier to develop, and mobile apps can be built from the same code by adding Capacitor.",
                },
              },
              {
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "STOREFRONT",
                      title: "Storefront",
                      text: "Nuxt 4 with server-side rendering, Pinia and Nuxt i18n, a UI kit on Tailwind and daisyUI. The server sends the browser a ready page instead of building it on the customer's device. So the catalog opens faster even on a low-end phone, and search engines see every product and bring customers from search.",
                    },
                    {
                      label: "ADMIN",
                      title: "Admin panel",
                      text: "An internal site for the service staff that customers never see. In it, operators receive and process orders and purchase requests, check that orders are complete before shipping and update the delivery statuses the customer sees in their account.",
                    },
                    {
                      label: "API",
                      title: "Public API",
                      text: "Cart, favorites and product blocks for the home page. The guest session relies on a signed cookie, so the customer does not have to sign up in advance.",
                      code: ["/api/public/v1", "catalog/block-products"],
                      wide: true,
                    },
                    {
                      label: "BACKEND",
                      title: "Services and data",
                      text: "Laravel and Go, queues on RabbitMQ. Data in PostgreSQL, Redis, Elasticsearch, ClickHouse and S3 / MinIO.",
                    },
                    {
                      label: "INFRA",
                      title: "Infrastructure",
                      text: "Docker and Kubernetes, rollout via GitLab CI and Argo CD, traffic through Traefik and Envoy. Monitoring on Grafana, Prometheus and ELK.",
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
            id: "server-driven",
            name: "Pages are built from the API",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "The structure and content of a page can change without a storefront release. The backend returns a JSON array shaped like an abstract syntax tree, and the storefront builds the page from it.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "The home page is built this way, and its product blocks come from catalog/block-products. Any other page can be built the same way.",
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
                  text: "For customs clearance the service stores customers' personal data. Sensitive fields are encrypted in the database with Laravel's built-in tools, and the key is stored separately from both the code and the database. Permissions are split between customers, operators and administrators.",
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
                  text: "I was responsible for three kinds of tests: component tests on Vitest, visual regression tests that compare blocks against reference screenshots, and E2E tests on Playwright for critical scenarios. The junior frontend developer's code went through my review.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "A task from its own branch goes into develop, passes the automated tests and code quality checks and is deployed to the test environment. On the planned release date the finished tasks are gathered into preprod, where final testing and acceptance run in an environment identical to production. Then the release is merged into master and updates production without downtime. If something breaks in production, it is possible to quickly return to the previous stable version.",
                },
              },
              {
                component: "ProjectCasePipeline",
                data: {
                  stages: [
                    { name: "develop", next: "test environment" },
                    { name: "preprod", next: "acceptance" },
                    { name: "master", next: "production without downtime" },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Sprints lasted two weeks. At the end of each one the client saw what was done, what was not and why, and what was planned for the next two weeks.",
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
                id: "a11y",
                name: "Accessibility in the UI kit",
                rows: [
                  {
                    key: "problem",
                    text: "The storefront is used by very different customers: on a phone on the go, with a keyboard only, with a screen reader or with low vision. Ready-made daisyUI components do not guarantee accessibility on their own. If it is not built into the UI kit from the start, the issues spread to every page, and some customers cannot place an order.",
                  },
                  {
                    key: "solution",
                    text: "Accessibility is built into the UI kit itself: semantic page regions, a visible focus and a logical keyboard order, alt text on images, accessible names on buttons and links. Zooming is allowed, and the screen notch on phones is taken into account.",
                  },
                  {
                    key: "result",
                    text: "An axe-core check against WCAG 2.2 AA and a manual keyboard pass on the home page, a category and a product page, on desktop and on a phone, found one violation. The brand red gives a contrast of 4.1:1 against the required 4.5:1, which is fixed by darkening the red a couple of shades in the daisyUI theme.",
                  },
                ],
              },
              {
                id: "theming",
                name: "A new look in a day",
                rows: [
                  {
                    key: "problem",
                    text: "The client came with requests for a new storefront style, and it had to be shown and rolled out quickly.",
                  },
                  {
                    key: "solution",
                    text: "I chose Tailwind and daisyUI: the UI kit components take their look from a theme, the custom taobao_v2 or the standard light and dark. The prototype of a new theme was generated with GPT-4.",
                  },
                  {
                    key: "result",
                    text: "By my estimate, without measurements: a prototype page in the new style is ready in under an hour after the request, and rebuilding the site takes no more than a day.",
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
                value: "600+",
                label: "orders a month at handover",
              },
              {
                value: "2M+",
                label: "products in the catalog at handover",
              },
            ],
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseCta",
    data: {
      id: "cta",
      title: "Need a cross-border delivery service or a storefront that can be restyled in a day?",
      text: "I will design an accessible UI kit, build the storefront in Nuxt and the API behind it.",
    },
  },
  {
    component: "ProjectCaseNext",
    data: {},
  },
] satisfies ProjectBlock[];

export default taobao;

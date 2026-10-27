import type { ProjectBlock } from "../../../api/types/projectCase";

const brendmart = [
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
        { key: "duration", value: "January 2025 – March 2026, launched in May 2025" },
        { key: "status", value: "Handed over, the store is live" },
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
          text: "The design is built around the product: the interface does not compete with the photos of brands from mass market to luxury, and the catalog, product page and cart work the same way so customers quickly find their way around the store. The UI kit is built on daisyUI: components take their colors and shapes from the theme, so the look changes by switching the theme rather than redoing the layout.",
        },
        {
          title: "Nuxt storefront",
          text: "Proposed and introduced Nuxt: the storefront runs as a separate server-rendered app rather than part of a monolith. For a store with a catalog of more than 2 million products, this means sales from search: search engines get a ready page with a description and markup and index the whole catalog. And a separate app evolves without waiting for backend releases.",
        },
        {
          title: "Admin panel and API",
          text: "The client side of the operator's admin panel, the layer of backend requests for the admin panel and the storefront, Laravel API endpoints for the storefront.",
        },
        {
          title: "Review",
          text: "Reviewed the junior frontend developer's merge requests. Reviews kept the code in one style and caught bugs before the test stand, and through them the junior developer picked up the project's practices faster.",
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
                  text: "Brendmart sells clothing, shoes and accessories by global brands from European stores, luxury and mass market: Prada, Brunello Cucinelli, Max Mara, Etro, Swarovski. Its customers live in Russia, Belarus and Kazakhstan.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "The client buys the item from a foreign seller on the customer's behalf and delivers it to the EAEU countries. The store launched in May 2025.",
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
            name: "How people buy",
            blocks: [
              {
                component: "ProjectCaseSteps",
                data: {
                  steps: [
                    {
                      title: "Catalog",
                      text: "The price already includes delivery and customs duties. In development: server rendering of a catalog of 2M+ products, a cached category tree",
                    },
                    {
                      title: "Concierge",
                      text: "If an item is not in the catalog, the customer can leave a purchase request. In development: a request form with zod validation",
                    },
                    {
                      title: "Cart",
                      text: "The cart and favorites live in a guest session, no sign-up needed. In development: a guest session through a proxy in a signed cookie, cart and favorites state in Pinia",
                    },
                    {
                      title: "Delivery",
                      text: "The item is bought from a seller in Europe, express delivery from 5 days. In development: the order goes to the admin panel, where an operator buys the item and handles the delivery",
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
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "STOREFRONT",
                      title: "Nuxt storefront",
                      text: "A separate server-rendered app on Nuxt 4, Pinia, Tailwind and daisyUI. Page data arrives in _payload.json. Nuxt was chosen for server rendering, which a large catalog needs for SEO. Pinia keeps the shared state of the cart and favorites, and Tailwind with daisyUI lets the look change through the theme.",
                    },
                    {
                      label: "ADMIN",
                      title: "Operator admin panel",
                      text: "The private part of the store for staff. The operator receives orders and purchase requests, buys the item from the seller and handles the delivery. The panel is built on the same UI kit as the storefront, so new screens are made from ready components.",
                    },
                    {
                      label: "API",
                      title: "Public REST",
                      text: "Cart, favorites, a cached category tree. The guest session goes through a proxy and is kept in a signed cookie. The category tree is cached because it rarely changes but is needed on every page. The signed cookie keeps the cart without sign-up and prevents the session from being forged.",
                      code: ["/api/public/v1", "/cached/categories-tree", "/proxy/session/guest"],
                      wide: true,
                    },
                    {
                      label: "BACKEND",
                      title: "Services and data",
                      text: "Laravel and Go, queues on RabbitMQ. PostgreSQL, Redis, Elasticsearch, ClickHouse, S3 / MinIO. Laravel speeds up business logic development, and Go handles the high-load services. RabbitMQ moves heavy tasks to the background, Elasticsearch searches 2 million products, and ClickHouse stores analytics.",
                    },
                    {
                      label: "INFRA",
                      title: "Infrastructure",
                      text: "Docker, Traefik, Kubernetes and Argo CD, builds in GitLab CI. Logs in ELK, metrics in Grafana and Prometheus. Kubernetes and Argo CD update the store without downtime and roll back a release in one step. ELK, Grafana and Prometheus reveal errors and load before customers notice them.",
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
                  text: "Changing the home page takes no release. The backend returns the page as a JSON array shaped like a tree, and the storefront builds the page from components according to it.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "The home page is built this way, and any other page can be built the same way: content and structure change through the API.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "storefront",
            name: "Search, languages and accessibility",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Search engines get a ready page from the server, with its own title, description, Open Graph and schema.org WebSite and WebPage markup. The interface is translated into Russian, English and Spanish.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Accessibility is built into the storefront to the extent needed: semantic page landmarks, alt text on images, labels on buttons and links, zoom is not blocked. Semantics works for three sides at once. Customers with a screen reader or a keyboard can place an order. Search engines understand the page structure better and rank it more accurately. And developers find clear markup easier to maintain.",
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
                  text: "The integrations cover tasks the store does not need to build from scratch. Card payments take money right on the site. Jivo online chat lets customers quickly ask about a product or an order without leaving the page. Yandex Metrica shows where customers come from and at which step they leave.",
                },
              },
              {
                component: "ProjectCaseIntegrations",
                data: {
                  items: [
                    { label: "Card payments" },
                    { label: "Jivo online chat" },
                    { label: "Yandex Metrica" },
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
                  text: "For customs clearance the store keeps customers' personal data. Such fields are encrypted in the database with Laravel's built-in tools, and the key is stored apart from the code and the database. Access has two levels: customers and staff (operators and administrators).",
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
                  text: "The project has three kinds of tests. Component tests in Vitest check the UI kit logic. Visual regression tests compare a block with a reference screenshot and catch accidental layout changes, especially when the theme changes. E2E tests in Playwright check that a customer can get from the catalog to an order.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Each task lives in its own branch and, once merged into develop, goes through CI checks and onto the test stand. On release day a preprod branch is assembled for acceptance in a production-like environment, then master updates the live server without downtime.",
                },
              },
              {
                component: "ProjectCasePipeline",
                data: {
                  stages: [
                    { name: "develop", next: "CI and test stand" },
                    { name: "preprod", next: "final acceptance" },
                    { name: "master", next: "zero-downtime release" },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Production errors are tracked continuously, and if something goes wrong the release is quickly rolled back to the previous stable version.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Sprints lasted two weeks. At the end of each one the client saw what was done, what was not and why, and together we planned the next two weeks.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "This process made it possible to ship updates every two weeks without store downtime, and frequent style changes did not break the layout or the customer's path to an order.",
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
                id: "nuxt",
                name: "A storefront apart from the monolith",
                rows: [
                  {
                    key: "problem",
                    text: "A storefront inside a monolith is hard to develop separately from the backend and cannot be reused on other platforms.",
                  },
                  {
                    key: "solution",
                    text: "Proposed and introduced Nuxt. The storefront became a separate server-rendered app that takes its data from the backend's public API.",
                  },
                  {
                    key: "result",
                    text: "The storefront can grow without touching the backend, and mobile apps can be built from the same code by adding Capacitor.",
                  },
                ],
              },
              {
                id: "themes",
                name: "A new look in a day",
                rows: [
                  {
                    key: "problem",
                    text: "The look often had to change at the client's request, and drawing every variant in Figma takes a long time.",
                  },
                  {
                    key: "solution",
                    text: "Built the styling on Tailwind and daisyUI so that the theme switches as a whole, with the store's look moved into its own daisyUI theme. A prototype and theme variants came quickly from GPT-4: we asked it to lay out a prototype and suggest several variants.",
                  },
                  {
                    key: "result",
                    text: "From the client's request to a page prototype in a new theme took no more than an hour. Rebuilding the whole project in a new style takes a day thanks to the daisyUI-based UI kit.",
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
                label: "products in the catalog",
              },
              {
                value: "~4 mo.",
                label: "from the start of development to launch",
              },
              {
                value: "≤ 1 h",
                label: "for a new theme prototype on the client's request",
              },
            ],
          },
        },
        {
          component: "ProjectCaseText",
          data: {
            text: "By handover the store was taking more than 600 orders a month from customers in Russia, Belarus and Kazakhstan.",
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseCta",
    data: {
      id: "cta",
      title: "Need a store with a large catalog that is easy to restyle?",
      text: "I will design the UI and the UI kit, build a server-rendered Nuxt storefront, the admin panel and the API.",
    },
  },
  {
    component: "ProjectCaseNext",
    data: {},
  },
] satisfies ProjectBlock[];

export default brendmart;

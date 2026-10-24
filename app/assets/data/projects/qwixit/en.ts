import type { ProjectBlock } from "../../../api/types/projectCase";

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
    component: "ProjectCaseFacts",
    data: {
      facts: [
        { key: "role", value: "Fullstack Developer" },
        { key: "team", value: "3 fullstack developers and a PM" },
        { key: "duration", value: "About 3 months to production" },
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
          title: "The whole design",
          text: "The storefront and the admin panel. About 50 reusable components are collected in Storybook and handed over to the client's team.",
        },
        {
          title: "Frontend",
          text: "Frontend architecture and the client side of the storefront and the admin panel in Vue 3 and Pinia, including the layer of requests to the backend.",
        },
        {
          title: "Storefront API",
          text: "Laravel API endpoints that feed the storefront.",
        },
        {
          title: "Integrations and SEO",
          text: "Payments, online chat, all the analytics and a Telegram bot that sends a notification about every order. The team had no SEO specialist, so I worked with Yandex Webmaster myself.",
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
                  text: "The client, the US company Pochtoy LLC, runs its own warehouse in Delaware. Its customers live in Russia and want genuine products from US stores and brands: New Balance, Nike, Adidas, Levi's, Tommy Hilfiger, Ralph Lauren, Calvin Klein, Michael Kors, Coach, iHerb.",
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
                  text: "US stores do not accept Russian cards and do not ship to Russia. The service covers the whole chain: the price is in rubles right away, payment by a Russian card or via SBP, a buyer purchases the item, delivery to a pickup point.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "The client had no platform at all: neither a website nor an ordering process.",
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
                component: "ProjectCaseGoal",
                data: {
                  value: "300+",
                  text: "orders a month. Launch on a ready-made platform instead of building a store from scratch. The stack was set by the client and their team.",
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
                  text: "The whole product is built around one chain, which the customer sees on the product page as the estimated delivery date.",
                },
              },
              {
                component: "ProjectCaseSteps",
                data: {
                  steps: [
                    {
                      title: "Payment",
                      text: "By a Russian card or via SBP, the price is in rubles right away",
                    },
                    {
                      title: "Purchase",
                      text: "A buyer purchases the item within an hour",
                    },
                    {
                      title: "Warehouse",
                      text: "Delaware, 4–7 days from the store",
                    },
                    {
                      title: "Delivery",
                      text: "Flights on Tuesdays and Thursdays, then CDEK: about 5 days to Moscow and Saint Petersburg, 10 days or more to the regions",
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
                  text: "The client wanted a ready-made platform, so the team took tlcommerce as the base and reworked it heavily.",
                },
              },
              {
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "STOREFRONT",
                      title: "Storefront",
                      text: "A Vue 3 SPA with Pinia and SASS. Product pages are rendered on the server by Laravel.",
                    },
                    {
                      label: "API",
                      title: "Modular REST",
                      text: "Catalog, categories and site settings, menus and sliders, sections of the home page and the header, interface dictionaries.",
                      code: ["ecommerce-core", "theme", "widgets", "locale"],
                    },
                    {
                      label: "SERVICES",
                      title: "Go modules",
                      text: "Heavy queries and parallel computations live in Go modules, queues run on RabbitMQ.",
                    },
                    {
                      label: "DATA",
                      title: "Storage",
                      text: "PostgreSQL as the main database, Elasticsearch for search and the catalog, Redis for cache and sessions, ClickHouse for analytics, S3 / MinIO for media.",
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
            id: "operator",
            name: "A store that runs without developers",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "The operator manages orders, products, promo codes and bonuses, changes banners and turns on holiday themes, for example for New Year. No release is needed for that: the home page and the header are assembled from widgets that come from the API.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Interface texts are loaded from a separate locale endpoint, so more languages can be added without a rewrite.",
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
                    { label: "Payments by Russian cards and SBP", own: true },
                    { label: "me-talk online chat", own: true },
                    { label: "Yandex Metrica", own: true, term: true },
                    { label: "Google Analytics", own: true, term: true },
                    { label: "VK pixel", own: true },
                    { label: "Telegram order bot", own: true },
                    { label: "CDEK · 25,000+ pickup points in 470 cities" },
                    { label: "Maestra · newsletters and subscription pop-ups" },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "The catalog is filled by parsing the websites of the stores the client is ready to deliver from.",
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
                  text: "The service handles personal data of customers, including the data required for customs clearance. Sensitive fields are stored encrypted in the database, and the encryption key is kept apart from the code and the database. Access is split by roles: customer, operator, administrator.",
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
                  text: "I wrote component tests in Vitest, visual regression tests against reference screenshots of blocks and E2E tests in Playwright for the critical scenarios.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Every task passes CI checks and a test stand, then on the planned release date it goes to a preprod stand identical to production. After acceptance the release rolls out to production without downtime, and in case of trouble it can be quickly rolled back to the previous stable version.",
                },
              },
              {
                component: "ProjectCasePipeline",
                data: {
                  stages: [
                    { name: "develop", next: "test stand" },
                    { name: "preprod", next: "acceptance" },
                    { name: "master", next: "production without downtime" },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "We worked in two-week sprints. After each one we showed the client what was done, what was not and why, and agreed on the plan for the next two weeks.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "At handover the client's team received the documentation: step-by-step setup, environment variables, the list of integrations, and Storybook with the components of the storefront and the admin panel.",
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
                id: "seo",
                name: "SEO for an SPA",
                rows: [
                  {
                    key: "problem",
                    text: "A customer comes from search looking for a specific product, while most of the storefront is a client-side Vue 3 app that search engines index poorly.",
                  },
                  {
                    key: "solution",
                    text: "I moved to the server only what search needs: product pages are rendered by Laravel, the rest stayed on the client.",
                  },
                  {
                    key: "result",
                    text: "Product pages are served from the server, and search engines see the H1, the price and the schema.org markup: Product, BreadcrumbList, Organization, FAQPage.",
                  },
                  {
                    key: "retro",
                    text: "I would move the client side to a separate Nuxt app: the catalog is only partly rendered on the server, and the home page and the information pages stayed client-side.",
                  },
                ],
              },
              {
                id: "load",
                name: "A million products and the load",
                rows: [
                  {
                    key: "problem",
                    text: "Complex queries and heavy computations over the catalog loaded the main database.",
                  },
                  {
                    key: "solution",
                    text: "As a team we rewrote some modules in Go for complex queries and parallel computations, and put Elasticsearch in front of the database to serve products fast.",
                  },
                  {
                    key: "result",
                    text: "Search and the catalog do not overload the database, and load peaks passed without noticeable problems.",
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
                value: "300–500",
                label: "orders a month",
              },
              {
                value: "~1M",
                label: "products in the catalog at handover",
              },
              {
                value: "40–70k",
                label: "visitors a month",
              },
              {
                value: "~3 mo",
                label: "of development before launch",
              },
            ],
          },
        },
        {
          component: "ProjectCaseText",
          data: {
            text: "The client's goal of 300+ orders a month was reached a few months after launch.",
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseCta",
    data: {
      id: "cta",
      title: "Need an online store with a large catalog or sales to another country?",
      text: "I will design the storefront and the admin panel, build them, connect payments and analytics and take the store to launch.",
    },
  },
  {
    component: "ProjectCaseNext",
    data: {},
  },
] satisfies ProjectBlock[];

export default qwixit;

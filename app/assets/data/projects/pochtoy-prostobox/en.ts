import type { ProjectBlock } from "../../../api/types/projectCase";

const pochtoyProstobox = [
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
        { key: "duration", value: "10.2023 – 01.2025" },
        { key: "status", value: "The sites are live" },
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
          title: "Loading speed",
          text: "Pagination, lazy-loaded images, separate JS and CSS for every page instead of one shared bundle, and a lighter library bundle for the Pochtoy home page.",
        },
        {
          title: "Storefront frontend",
          text: "Markup from a ready-made design in Tailwind CSS. The delivery calculator runs as a separate Vue 3 widget inside a server-rendered page.",
        },
        {
          title: "Storefront database queries",
          text: "Reviews with the list, pagination and the map, the calculator and rates, home page banners, city search. Only the needed fields are selected from the database.",
        },
        {
          title: "Review Cashback",
          text: "A TypeScript module that pays customers to their balance for a review of the service. The frontend and the queries are mine.",
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
                  text: "Pochtoy LLC delivers purchases from US stores. Parcels arrive at a warehouse in tax-free Delaware, an operator can buy the item on the customer's request, and then the parcel goes to Russia, Kazakhstan, Belarus, the Middle East or another country. The sites work in English, Russian, Arabic and Spanish.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "The company runs two brands on one platform. Pochtoy.com has been operating since 2008. Prostobox is the budget brand with delivery from $3.99 per parcel, and 79% of its shipments come from resellers and entrepreneurs.",
                },
              },
              {
                component: "ProjectCaseResults",
                data: {
                  stats: [
                    {
                      value: "2.6M",
                      label: "parcels shipped by Pochtoy.com since 2008",
                    },
                    {
                      value: "200k+",
                      label: "parcels shipped by Prostobox",
                    },
                    {
                      value: "7,000+",
                      label: "parcels a week by the counter on the sites",
                    },
                    {
                      value: "20,000+",
                      label: "Pochtoy.com customers",
                    },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "The numbers were taken from the sites in October 2026.",
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
                  text: "The team maintained and developed the sites of both brands. There were two main goals. The first was stability: the sites had to run without failures in all four languages, and new features must not break the code shared by the two brands. The second was speed: the storefront had to serve pages faster, especially on mobile internet.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Storefront pages took more than 5 seconds to load. Lists such as reviews were rendered in full with no pagination, all images loaded at once, and scripts and styles came in one shared bundle: on the Pochtoy home page the libraries alone weighed 930 KB.",
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
            id: "architecture",
            name: "Architecture",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "I started working on the problems with the architecture: it determined what could be sped up without breaking the other brand. Both brands run on one Laravel backend: a shared session, the same paths and the same functions in the scripts, so any change to the shared code affects both sites. Each brand kept its own domain, with its styles and scripts layered on top of the shared ones. This made it possible to split resources by page and brand, and to plug in new interactive parts as separate Vue 3 widgets without rewriting the server pages.",
                },
              },
              {
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "BRANDS",
                      title: "Two brands",
                      text: "Pochtoy.com and Prostobox: their own styles and scripts on top of the shared ones.",
                      code: ["assets/guest", "assets/pochtoy", "assets/prostobox"],
                    },
                    {
                      label: "STOREFRONT",
                      title: "Storefront",
                      text: "Server rendering and jQuery, Vue 3 as separate widgets. Built with Laravel Mix.",
                    },
                    {
                      label: "API",
                      title: "Storefront API",
                      text: "Rates and delivery calculation, the customer's region, home page banners, city search.",
                      code: [
                        "/api/guest/calculator/*",
                        "/api/guest/client-region/get",
                        "/api/guest/index-banners/get",
                        "/city/search",
                      ],
                    },
                    {
                      label: "DATA",
                      title: "Data and static files",
                      text: "PostgreSQL, Redis for cache, static files on Bunny CDN.",
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
            id: "review-cash",
            name: "Review Cashback",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Review Cashback is a feature that motivates customers to talk about the service on external platforms: for a review, the customer gets money to their balance. For the client, it brings a stream of genuine reviews where new customers read them — on maps, social networks and Trustpilot. Reviews with a photo and a tracking number build trust in the service, and the money stays on the balance and comes back with the next parcel. I built this TypeScript module: the frontend and the queries.",
                },
              },
              {
                component: "ProjectCaseSteps",
                data: {
                  steps: [
                    {
                      title: "Review",
                      text: "200 characters or more, with a photo and a tracking number",
                    },
                    {
                      title: "Link",
                      text: "The customer pastes the link to the review into a form on the site",
                    },
                    {
                      title: "Check",
                      text: "An operator checks the review",
                    },
                    {
                      title: "Cashback",
                      text: "$3 or $5 to the balance depending on the platform",
                    },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "There are six platforms: Yandex Maps, VK, Otzovik, Trustpilot, Google Maps and Facebook, with one review counted on each. For all six the customer gets up to $22.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "rum",
            name: "Speed for real users",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "I wrote the perf-rum.js script that collects speed metrics from real users. For 25% of visits it records TTFB, FCP, LCP, INP and CLS for each page, along with the page weight and the number of requests, images and XHR calls, and sends them to the server.",
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
                  text: "I wrote three kinds of tests: component tests in Vitest, visual regression tests against reference screenshots of blocks and E2E tests in Playwright for the critical scenarios.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Each task is done in its own branch, passes CI checks and goes to a test stand. On the planned release date the finished tasks move to a preprod stand identical to production, and after acceptance they roll out to production without downtime. Production errors are tracked constantly, and in case of trouble the release is rolled back to the previous stable version.",
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
                  text: "We worked in two-week sprints. At the end of each sprint we showed the client what was done, what was not and why, and what we were taking on for the next two weeks.",
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
                id: "speed",
                name: "Slow page loading",
                rows: [
                  {
                    key: "problem",
                    text: "Some pages took more than 5 seconds to load: lists had no pagination, all images loaded at once, and scripts and styles came in one shared bundle.",
                  },
                  {
                    key: "solution",
                    text: "I added pagination and lazy loading of images and split JS and CSS by page. For the Pochtoy home page I built a lighter library bundle: about 700 KB against 930 KB for the full one. I plugged in the delivery calculator as a separate Vue 3 widget. In the storefront database queries I selected only the needed fields instead of SELECT *.",
                  },
                  {
                    key: "result",
                    text: "Reviews are split into pages, images below the fold load as the user scrolls, and every page gets only its own scripts and styles. There were no before and after measurements, so the result is described as a list of what was done, without numbers.",
                  },
                ],
              },
              {
                id: "release",
                name: "Slow delivery of new features",
                rows: [
                  {
                    key: "problem",
                    text: "The storefront was built with outdated tools: jQuery, Laravel Mix and one shared bundle with no typing and no tests. Every new feature needed manual checks on both brands, so it took a long time to reach production.",
                  },
                  {
                    key: "solution",
                    text: "I started building new interactive parts as Vue 3 and TypeScript widgets: they plug into the server page and do not touch the rest of the code. I added component, visual and E2E tests so changes are checked automatically instead of by hand on two sites.",
                  },
                  {
                    key: "result",
                    text: "The delivery calculator and Review Cashback shipped as separate modules without affecting the rest of the storefront. Regressions are caught by tests before the release.",
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
                value: "~700 KB",
                label: "library bundle of the Pochtoy home page instead of 930 KB",
              },
              {
                value: "< 5 s",
                label: "storefront page load, down from more than 5 seconds",
              },
              {
                value: "7,000+",
                label:
                  "parcels a week handled by both sites without failures, while they used to slow down and crash under load",
              },
              {
                value: "3 test types",
                label:
                  "component, visual and E2E tests catch regressions before the release and replace manual checks of two brands",
              },
            ],
          },
        },
        {
          component: "ProjectCaseText",
          data: {
            text: "The storefronts of both brands got pagination, lazy-loaded images and separate scripts and styles for every page. Pages now load in under 5 seconds, and the sites handle more than 7,000 parcels a week without failures, while they used to slow down and sometimes crash under such load.",
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseCta",
    data: {
      id: "cta",
      title: "Your site already brings in orders but loads slowly?",
      text: "I will find what slows it down, split scripts and styles by page, add pagination and lazy loading and set up speed tracking for real users.",
    },
  },
  {
    component: "ProjectCaseNext",
    data: {},
  },
] satisfies ProjectBlock[];

export default pochtoyProstobox;

import type { ProjectBlock } from "../../../api/types/projectCase";

const dobro = [
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
        { key: "role", value: "Frontend Team Lead" },
        {
          key: "team",
          value: "15 people: 5 frontend, 4 backend, 2 designers, 2 QA, a PM and a DevOps engineer",
        },
        { key: "duration", value: "Since March 2026" },
        { key: "status", value: "In development, before release" },
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
          title: "Architecture and stack",
          text: "Chose the stack and laid down the frontend architecture: component layers ui → form → base → pages, Server Components by default, no any and no as casts, tests for every component.",
        },
        {
          title: "The team",
          text: "Joined as a developer and was made team lead a month later. Set tasks and priorities for four more developers, reviewed and merged PRs, wrote the guidelines and the onboarding document.",
        },
        {
          title: "Code",
          text: "93 tasks myself: the UI kit and form fields, the accounts of non-profits and donors, the non-profit and fundraiser pages, the home page, the catalog, the header and footer, the moderation section.",
        },
        {
          title: "Performance",
          text: "All of the optimization, from measurements to the report: 340 → 4552 rps across 17 routes, median response 919 → 69 ms.",
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
                  text: "Dobro.rf is a platform for transparent charity, with Alfa-Bank as its general partner. Donors make one-time and recurring donations, put several fundraisers into one cart and see their history. Non-profits and private organizers go through onboarding, upload documents, create fundraisers and follow the statistics. Moderators review the fundraisers.",
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
                  text: "There was no old platform: this is a new product built from scratch to the client's specification since March 2026.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "The client set the stack: React. Apart from me, nobody on the frontend team had written React before. And there were many integrations: the digital ruble, payment in a modal window right on the site, Alfa-Bank, a multi-step onboarding for non-profits.",
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
            name: "The donation flow",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "A donor can support several fundraisers with one payment: the money is split automatically, and the whole history stays in the account.",
                },
              },
              {
                component: "ProjectCaseSteps",
                data: {
                  steps: [
                    {
                      title: "Catalog",
                      text: "Filters by city, area of help, the registry of socially oriented non-profits and digital ruble support",
                    },
                    {
                      title: "Fundraiser",
                      text: "Progress, days left, reports and the transaction log",
                    },
                    {
                      title: "Cart",
                      text: "Several fundraisers, one payment, split automatically",
                    },
                    {
                      title: "Payment",
                      text: "A card in a modal window on the site, SBP or the digital ruble",
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
            id: "onboarding",
            name: "Non-profit onboarding",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "An organization joins the platform through a six-step wizard. Moderator remarks are shown as field errors and block the submission until they are fixed.",
                },
              },
              {
                component: "ProjectCaseSteps",
                data: {
                  steps: [
                    {
                      title: "Organization",
                      text: "Sign-in via Gosuslugi, company details with suggestions",
                    },
                    { title: "Questionnaire", text: "Information about the organization" },
                    { title: "Account", text: "Sign-in via Alfa ID and opening an account" },
                    { title: "Documents", text: "PDF upload" },
                    { title: "Signing", text: "Signing the documents" },
                    { title: "Completion", text: "The review outcome, rejection included" },
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
                      title: "Public storefront",
                      text: "The home page, the fundraiser catalog, the fundraiser page, organizations, documents. The home page is static, fundraisers and non-profits use ISR, the catalog and organizations are dynamic with request caching.",
                    },
                    {
                      label: "ACCOUNTS",
                      title: "Accounts",
                      text: "Donor and non-profit accounts, the moderation section. Data is loaded on the client: SWR and Zustand, forms on react-hook-form and zod.",
                    },
                    {
                      label: "SERVER",
                      title: "Next.js server routes",
                      text: "A proxy to the API, DaData suggestions with the key kept on the server only, application metrics.",
                      code: ["app/api/backend", "app/api/dadata", "app/metrics"],
                    },
                    {
                      label: "API",
                      title: "Backend REST",
                      text: "Response types are generated from OpenAPI, so the frontend learns about a contract change at typecheck.",
                    },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Tag-based cache invalidation is already in place: once the backend starts sending webhooks, the cache intervals can be raised many times over.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "design-system",
            name: "Design system",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Two designers on the team drew the layouts in Figma. From them the frontend built its own design system: theme tokens, CSS components for buttons, cards and inputs, 110 reusable components. Every reusable component is accepted through Storybook.",
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
                    { label: "Bank cards · secure fields of the gateway" },
                    { label: "SBP" },
                    { label: "Digital ruble" },
                    { label: "Alfa ID", term: true },
                    { label: "Gosuslugi" },
                    { label: "DaData", term: true },
                    { label: "Yandex Metrica", term: true },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "My group built the integrations on the frontend. I did not write that code, but for each one I set the tasks and decided what to use.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Payment methods come from the backend. A card is paid in a modal window on the site, but the card details are typed into the fields of the payment gateway, and the site never sees them. The cart and monthly donations can be paid by card or via SBP, the digital ruble works only for a one-time donation.",
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
                  text: "The DaData key lives only on the server, and requests go through a server route. The HTTP client sends no cookies in cacheable requests, so a personal response cannot end up in the shared cache. Private fundraisers ask for consent to publish personal data.",
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
                  text: "Vitest and React Testing Library: 48 files, about 450 test cases, basic tests for every component. The performance seams have their own tests: cookies and cache in the HTTP client, caching of public endpoints, client-side loading of reference data. Another developer writes Playwright E2E tests: the cart and the donation, sign-in, non-profit onboarding.",
                },
              },
              {
                component: "ProjectCasePipeline",
                data: {
                  stages: [
                    { name: "husky", next: "lint and unit tests on push" },
                    { name: "pull request", next: "review and CI" },
                    { name: "develop", next: "dev stand" },
                    { name: "preprod", next: "prod" },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "I set up the checks on push, the team's DevOps engineer set up GitHub Actions, Docker and the deployment.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "We work in one-week sprints with a demo at the end of each. Tasks live in Jira, one branch per task, PRs with review. New developers get an onboarding document: layers, naming, patterns, forms, tests, Storybook. AI agents get the project rules and skills: branch review, tests, theme tokens.",
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
                id: "rps",
                name: "20 rps on any page",
                rows: [
                  {
                    key: "problem",
                    text: "On every request the root layout waited for two API responses, up to a second: the auth check and the header data, of which one field was used. Because of reading cookies all 39 routes were dynamic, and nothing was cached.",
                  },
                  {
                    key: "solution",
                    text: "Measured both options and moved auth to the client: 182 rps against 15.5 for the server one with a cached header. Marked public endpoints for tag-based caching, made the home page static, moved the fundraiser and non-profit pages to ISR, took the 130 KB filter dictionary out of the HTML, moved the accounts to client-side loading and converted 109 PNGs to webp.",
                  },
                  {
                    key: "result",
                    text: "17 routes: 340 → 4552 rps in total, median response 919 → 69 ms. 17 routes became static plus 2 with ISR, the catalog HTML went from 254 to 169 KB, images in the build from 13 to 1.4 MB.",
                  },
                ],
              },
              {
                id: "empty-page",
                name: "A speed-up that turned out to be an empty page",
                rows: [
                  {
                    key: "problem",
                    text: "After the fundraiser page moved to ISR, the benchmark showed a 15× gain. In fact the server returned an empty shell: useSearchParams() dropped the page into client-side rendering, and the HTML kept 659 characters of text instead of 2398. Neither typecheck nor 444 tests caught it.",
                  },
                  {
                    key: "solution",
                    text: "Found it myself while reviewing my own branch. Reading the amount parameter moved into an effect, and the guidelines got a check for client-rendering markers and the amount of visible text after a route becomes static.",
                  },
                  {
                    key: "result",
                    text: "The page stayed on ISR and handles 196 rps with the full content.",
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
                value: "×13",
                label: "more requests per second: 340 → 4552 rps",
              },
              {
                value: "69 ms",
                label: "median response instead of 919 ms",
              },
              {
                value: "100",
                label: "Lighthouse in Accessibility, Best Practices and SEO, Performance 90+",
              },
              {
                value: "37",
                label: "pages, 20 of them in the accounts",
              },
            ],
          },
        },
        {
          component: "ProjectCaseText",
          data: {
            text: "The load was measured with autocannon on a production build, 20 connections. Lighthouse was run with Unlighthouse across all pages of the site. There are no business metrics yet: the platform has not been released.",
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseCta",
    data: {
      id: "cta",
      title: "Need a large Next.js project or a team that picks up a new stack fast?",
      text: "I will lay down the architecture and the guidelines, organize the frontend team and make the site hold the load.",
    },
  },
  {
    component: "ProjectCaseNext",
    data: {},
  },
] satisfies ProjectBlock[];

export default dobro;

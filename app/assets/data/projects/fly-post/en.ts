import type { ProjectBlock } from "../../../api/types/projectCase";

const flyPost = [
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
        { key: "role", value: "Fullstack Developer, project lead" },
        { key: "team", value: "Me and 2 frontend developers" },
        { key: "duration", value: "About 5 weeks, March – April 2025" },
        { key: "status", value: "MVP handed over to the client" },
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
          title: "Design and the UI kit",
          text: "Designed the key desktop and mobile screens and a UI kit in Figma. The team built the screens from ready-made components without approving every element.",
        },
        {
          title: "Architecture and backend",
          text: "Defined the stack and the architecture and fixed the API contract in Swagger as the single source of truth for the team. Wrote the REST API in NestJS and set up the infrastructure: Docker, a VPS, GitLab CI.",
        },
        {
          title: "Frontend",
          text: "Prepared the Vite and TypeScript skeleton and an MSW mock server so the team could start on day one. Took on the complex parts: localization, sign-in with a confirmation code and the Leaflet map.",
        },
        {
          title: "Team",
          text: "Brought in two frontend developers, broke the work down into tasks in git issues, defined the project structure and the code style, and reviewed the code.",
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
                  text: "A private client was launching a service for piggyback delivery of documents and small parcels to other cities and countries. Deliveries are made by crew members — flight attendants and pilots who are flying that route anyway. They pick up a shipment at the departure airport, hand it over at the destination and get paid for the delivery.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "For the sender it is faster than courier services, for the crew it is extra income. The service is closed: access to it is granted separately.",
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
                  text: "Before the service, such deliveries were arranged by hand, through acquaintances and chats. The sender had to find a crew member on the right flight, agree on the price and the meeting, and check where the parcel was in the chat. Neither side had any guarantees: it was unclear who would pick up the shipment and when, and how the delivery would be paid. The service was meant to replace all of this with one process and clear statuses. The project started from scratch.",
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
                  value: "MVP",
                  text: "in the shortest possible time and on a small budget. The load is low, so the stack is simple: Vue 3, NestJS and PostgreSQL.",
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
            name: "The parcel flow",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "The service has two roles: the sender creates a parcel, a courier from the crew takes it on their flight.",
                },
              },
              {
                component: "ProjectCaseSteps",
                data: {
                  steps: [
                    {
                      title: "Shipment",
                      text: "The sender creates a parcel for shipment. In development: a form with masks and validation, address search with suggestions through Nominatim",
                    },
                    {
                      title: "Flight",
                      text: "The courier enters their flight, for example from Moscow to Paris. In development: a flight form with manual entry, a schedule API is planned in the architecture",
                    },
                    {
                      title: "Airport",
                      text: "The courier picks up the mail at the departure airport. In development: a Leaflet map with markers, clusters and geolocation, shipment status changes through actions in the table",
                    },
                    {
                      title: "Delivery",
                      text: "Drops the parcel off at the destination and gets paid for the delivery. In development: an order status timeline, role checks by guards in the API, payouts are planned",
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
                  text: "The team was three people, two of them frontend developers, on a tight deadline. So the stack was chosen to keep the whole team on one language and let it start fast. NestJS on TypeScript gave shared contract types on the frontend and the backend, with no second language to learn. The team already knew Vue 3 with Vite, Pinia and Tailwind, and the ready-made daisyUI components sped up the layout work. PostgreSQL is a reliable relational database for orders and users. Docker on a VPS with GitLab CI gives low-cost infrastructure with automatic rollouts.",
                },
              },
              {
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "CLIENT",
                      title: "SPA",
                      text: "Vue 3 on Vite, Pinia, Vue Router, Tailwind and daisyUI. Localization is laid in with vue-i18n, ru/en.",
                    },
                    {
                      label: "API",
                      title: "REST in NestJS",
                      text: "The contract is described in Swagger, the sender and courier roles are checked by guards.",
                    },
                    {
                      label: "DATA",
                      title: "PostgreSQL",
                      text: "The main database with backups.",
                    },
                    {
                      label: "INFRA",
                      title: "Docker on a VPS",
                      text: "The frontend, NestJS and PostgreSQL run in containers, GitLab CI builds the images and rolls them out to the server.",
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
            id: "interface",
            name: "The map and the interface",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "The UI kit in Figma and on the frontend set one interface language. Screens were built from ready-made components, so new pages came faster and the interface stayed consistent without a separate design review. For the client this means cheaper changes and faster delivery of new features.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Points on the map stay readable even when there are many of them: custom SVG markers, clusters, zoom and geolocation on Leaflet, and address search with suggestions through Nominatim from OpenStreetMap. Users find the right place faster, and the business does not pay for commercial map APIs.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "The order's path is shown step by step in a nested collapsible status timeline. Forms have masks and validation, the confirmation code is entered in 4 cells with a resend timer.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "On the phone the navigation moves to a bottom tab bar, the shipments table scrolls sideways with a pinned actions column, the details panel and the map open full screen.",
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
                    { label: "Telegram bot · sign-in code", own: true },
                    { label: "Nominatim · OpenStreetMap", own: true, term: true },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Two more integrations are planned in the architecture for the next stages: a flight schedule API, so the courier picks a flight from a list instead of typing it in, and a payment service for courier payouts. They were not connected in the MVP, and the architecture is designed to add them.",
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
                  text: "The service stores the personal data of senders and couriers: full names, phone numbers, addresses and flight details. A leak of such data undermines trust in the service and breaks the personal data law (152-FZ), so protection was built in from day one. Sensitive fields are encrypted in the application with AES-256-GCM before they are written to the database: even if someone gets access to the database or a backup, the data stays unreadable, and GCM prevents it from being tampered with unnoticed. The connection goes over HTTPS only, the database is backed up regularly, sign-in uses a one-time code through a Telegram bot, and access is split between the sender and courier roles at the API level.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "quality",
            name: "Project and process setup",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Before development started, I set the project up so three developers could work on one frontend in parallel from the first week: the folder structure is described in the README, ESLint checks the code style, and all code goes through cross-review.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Tests are part of the process: unit tests for the backend and component snapshot tests on Vitest and @vue/test-utils for the frontend. Writing them was handed to AI agents to save the team's time.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "I automated code delivery in GitLab CI: the pipeline builds the Docker images and rolls them out to the VPS.",
                },
              },
              {
                component: "ProjectCasePipeline",
                data: {
                  stages: [
                    { name: "build", next: "Docker images" },
                    { name: "deploy", next: "VPS" },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "I kept the process light, sized to the team and the deadline: tasks in git issues, direct contact with the client, no sprints.",
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
                id: "parallel",
                name: "A frontend without a backend",
                rows: [
                  {
                    key: "problem",
                    text: "The deadline was tight, the frontend had to start right away, and there was no backend yet.",
                  },
                  {
                    key: "solution",
                    text: "I gave the team the API contract in Swagger and set up a basic backend on frontend tooling: NestJS on TypeScript with the same contract types as the frontend. While the API grew, the frontend worked through an MSW mock server.",
                  },
                  {
                    key: "result",
                    text: "Two developers built the screens against the contract without waiting for the API, and the backend on a stack the team already knew went in parallel. The MVP was built in about 5 weeks.",
                  },
                ],
              },
              {
                id: "login",
                name: "Phone sign-in without SMS",
                rows: [
                  {
                    key: "problem",
                    text: "The phone number has to be confirmed, and an SMS provider charges for every message. For an MVP on a small budget this matters.",
                  },
                  {
                    key: "solution",
                    text: "The confirmation code comes through a Telegram bot. On the frontend there is a phone mask, a role choice, sender or courier, and code entry in 4 cells with a resend timer.",
                  },
                  {
                    key: "result",
                    text: "The bot is free, and the crews are on Telegram anyway, so the code arrives where it is convenient for them.",
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
                value: "~5 wk",
                label: "to the MVP, frontend and backend in parallel",
              },
              {
                value: "3",
                label: "developers on the team",
              },
              {
                value: "2",
                label: "roles: sender and courier",
              },
            ],
          },
        },
        {
          component: "ProjectCaseText",
          data: {
            text: "The client accepted the MVP. The project never reached launch, so there are no usage metrics.",
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseCta",
    data: {
      id: "cta",
      title: "Need an MVP in a few weeks or a service with a map and roles?",
      text: "I will do the design, the frontend and the backend, bring in a team if needed and take the MVP through to handover.",
    },
  },
  {
    component: "ProjectCaseNext",
    data: {},
  },
] satisfies ProjectBlock[];

export default flyPost;

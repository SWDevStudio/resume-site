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
          text: "Figma mockups of the key desktop and mobile screens and a UI kit: buttons, fields, badges, cards. The developers built the screens from my components.",
        },
        {
          title: "Architecture and backend",
          text: "Chose the stack, described the API contract in Swagger and wrote the REST API in NestJS. Set up the infrastructure: Docker, a VPS and GitLab CI.",
        },
        {
          title: "Frontend",
          text: "The Vite and TypeScript skeleton, an MSW mock server, localization, sign-in and sign-up forms with a confirmation code, the Leaflet map.",
        },
        {
          title: "Team",
          text: "Brought in two frontend developers, set their tasks in git issues, defined the project structure and the code style, reviewed their code.",
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
                  text: "A private client was launching piggyback delivery of documents and small parcels to another city or country. The flight crew, flight attendants and pilots, is flying that route anyway: they pick up the mail at the airport, drop it off at the destination and get paid for it.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "For the sender it is faster than courier services, for the crew it is a side income. The service is internal, access to it is granted.",
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
                  text: "Before the service, such deliveries were arranged by hand, through acquaintances and chats. The project started from scratch.",
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
                      text: "The sender creates a parcel for shipment",
                    },
                    {
                      title: "Flight",
                      text: "The courier enters their flight, for example from Moscow to Paris",
                    },
                    {
                      title: "Airport",
                      text: "The courier picks up the mail at the departure airport",
                    },
                    {
                      title: "Delivery",
                      text: "Drops the parcel off at the destination and gets paid for the delivery",
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
                  text: "I chose NestJS to have one language with the frontend: TypeScript and shared contract types on both sides. For a team of three on a short deadline this is faster.",
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
                  text: "Points on the map stay readable even when there are many of them. I built the map on Leaflet with custom SVG markers, clusters, zoom and geolocation buttons, and the address search with suggestions works through Nominatim from OpenStreetMap.",
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
                  text: "The courier enters flights by hand, no schedule API was connected. Courier payouts through a payment service were planned, the MVP does not have them.",
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
                  text: "The service stores users' personal data. Sensitive fields are encrypted in the application before they are written to the database, the connection goes over HTTPS, the database is backed up. Sign-in is by a code from the Telegram bot, access is split by the sender and courier roles.",
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
                  text: "Three developers were writing one frontend in a few weeks, so I set the rules right away: the folder structure is described in the README, ESLint checks the code style, all code goes through cross-review.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "The backend got unit tests, the frontend got component snapshot tests on Vitest and @vue/test-utils, which were written by AI agents.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "After the repository moved to GitLab we set up GitLab CI: it builds the Docker images and rolls them out to the VPS automatically.",
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
                  text: "There was no formal process: calls and messages with the client directly, tasks for the developers in git issues, no sprints.",
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
                    text: "I gave the team the API contract in Swagger, and in the first week set up the frontend skeleton and an MSW mock server.",
                  },
                  {
                    key: "result",
                    text: "Two developers built the screens against the contract without waiting for the API, the backend went in parallel. The MVP was built in about 5 weeks.",
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

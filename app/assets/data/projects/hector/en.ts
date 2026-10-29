import type { ProjectBlock } from "../../../api/types/projectCase";

const hector = [
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
        { key: "duration", value: "Since June 2026" },
        { key: "status", value: "In development, demo build for the client" },
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
          text: "Chose Vue 3 and Capacitor over React Native, Flutter and native. Wrote the guidelines: Tailwind without separate styles, all text through i18n, no as casts and no comments, tests in the AAA format.",
        },
        {
          title: "Project start",
          text: "Set up the project: Capacitor with live reload, Tailwind, Storybook, linters, pre-push, the environment via mise, a README on running it in the emulator and the simulator.",
        },
        {
          title: "Code",
          text: "Time and date wheels with seamless looped scrolling, a phone mask, an accordion, i18n with the device locale, the first versions of the order review and active order screens.",
        },
        {
          title: "The team and the client",
          text: "Set tasks and priorities for four more developers, reviewed and merged PRs. They wrote the animations, the iOS part, the signals and the maps from my tasks. I presented the app to the client myself.",
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
                  text: "Hector is a personal protection and chauffeur service in Europe and the UAE. A client books protection or a car, pays for the order, follows the team on a map and presses SOS in a dangerous situation.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Protection agents have their own account: duty status, assigned orders and the route, arrival check-in, SOS alarms from clients.",
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
                  text: "There was no app: this is a new product built from scratch to the client's specification since June 2026.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "The client needs everything to work on iOS and Android. The team works remotely from different cities, each on their own work computer, and an iPhone and a Mac are not part of a developer's core set of devices. So the iOS build and testing had to be set up so they would not depend on the devices at hand. On top of that the app works with device APIs, for example it reacts to a double tap on the back of an iPhone.",
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
                component: "ProjectCaseSteps",
                data: {
                  steps: [
                    {
                      title: "Configurator",
                      text: "Protection: the number of agents, armed or not, dress code, a K9 handler, language. Or a car with a driver. Route, date, duration. In development: order state in Pinia, date and time wheels with seamless scrolling, address search through Photon and Nominatim, so the client puts an order together on one screen in a couple of minutes",
                    },
                    {
                      title: "Review",
                      text: "The client checks the order and sends it to a manager. In development: the order review screen and a phone mask, so the manager gets the order with no mistakes in the contacts",
                    },
                    {
                      title: "Payment",
                      text: "An itemized invoice, a status timeline, the order can be edited. In development: the active order screen with a status timeline. Editing an order takes the client back to the configurator with the data kept, so they do not build the order again",
                    },
                    {
                      title: "Live tracking",
                      text: "The team on the map with ETA, the SOS button at hand. In development: a Leaflet map and a route through OSRM. The SOS button is pinned to the screen, so there is no need to look for it in a dangerous situation",
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
            id: "stack-choice",
            name: "Why Vue and Capacitor",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "The stack was chosen around the team's strengths. The frontend developers are confident with Vue, and I know its ecosystem well myself. So from day one the team built the product instead of learning a new tool: this shortened the road to the demo and lowered the risk of errors. Vue with Capacitor brings other advantages too: one codebase for iOS and Android, an interface in plain CSS that lets Hector's complex design with gradients, glass and transparency match the mockups exactly, and access to the phone's features through plugins: biometrics, secure storage, system buttons. React Native and Flutter were considered too, but they would have given less freedom in the layout and taken time to learn.",
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
                      label: "APP",
                      title: "Vue 3 SPA",
                      text: "Inside a Capacitor shell on Android and iOS. Pinia keeps the order, the configurator, assigned orders and signals.",
                    },
                    {
                      label: "NATIVE",
                      title: "Native plugins",
                      text: "Biometrics, secure storage for the PIN, the keyboard, the system Back button, safe area for iPhone cutouts.",
                    },
                    {
                      label: "API",
                      title: "Backend REST",
                      text: "Its own HTTP client with interceptors. In the demo a miragejs mock server that follows the contract stands in for the API.",
                      code: ["auth", "configurator", "orders"],
                    },
                    {
                      label: "MAPS",
                      title: "Maps",
                      text: "OpenStreetMap: Leaflet for the map and live tracking, Photon and Nominatim for address search, OSRM for the route.",
                    },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "All text goes through vue-i18n and the locale comes from the device, so a new language is one more file. The mock server follows the API contract, and neither the frontend nor the demo waits for the backend.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "signals",
            name: "Silent signals",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "A client assigns actions to a double and a triple tap on the back of an iPhone and to four buttons of a lock screen widget. Each signal sets who receives it, what to do and how fast to react: the bodyguard comes over, the driver brings the car, the dispatcher is only informed.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "The app catches a signal through a URL scheme, including on a cold start. It is a prototype for now and is hidden in the demo build.",
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
                  text: "Signing in to the app is protected the way banking apps do it: with a PIN, Face ID or a fingerprint. The PIN is kept in a protected part of the phone that other apps cannot reach. If the session expires, the app returns to the sign-in screen by itself, so a stranger cannot keep working in someone else's account. Clients and protection agents see only their own sections.",
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
                  text: "Vitest and Vue Test Utils: 177 files, about 1,700 test cases next to the code, including the session, PIN, safe area and keyboard services. Storybook with accessibility checks. Another developer writes Playwright E2E tests for the demo scenarios: sign-in, an order from the configurator to completion, SOS, the profile, the agent account.",
                },
              },
              {
                component: "ProjectCasePipeline",
                data: {
                  stages: [
                    { name: "pre-push", next: "tests and lint of changed files" },
                    { name: "Codemagic", next: "iOS build in the cloud" },
                    { name: "TestFlight", next: "the app on an iPhone" },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "I set up the pre-push with tests and lint and the iOS build in Codemagic. Android is built as a signed bundle from Android Studio.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "We work in one-week sprints with a demo at the end of each. Tasks live in Jira, one branch per task, PRs with review.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "For the client this process means predictability. Every week they see a working version at the demo and can correct the course before a mistake gets expensive. The cloud iOS build and TestFlight make it possible to show the app on a real iPhone at any moment. For development, tests next to the code and the pre-push check catch errors before review, and five developers change shared code in parallel without breaking each other's work.",
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
                id: "ios",
                name: "The iOS build in a distributed team",
                rows: [
                  {
                    key: "problem",
                    text: "Everything has to work on iOS. The team is spread across different cities and works on its own devices, and an iPhone and a Mac for building and debugging are not part of a developer's work set. We needed a way to build and test iOS without being tied to a specific device.",
                  },
                  {
                    key: "solution",
                    text: "The iOS build moved to the Codemagic cloud: a simulator variant and a signed .ipa uploaded to TestFlight. A script patches the native project on every build, otherwise an app built with Xcode 27+ closes right after launch. We tested on BrowserStack cloud devices and through TestFlight.",
                  },
                  {
                    key: "result",
                    text: "The app reached a demo on iOS and Android. The demo build fixed bugs that show up only on an iPhone: a double tap zoomed the screen, the header slid under the status bar, the bottom of a sheet went under the home indicator.",
                  },
                ],
              },
              {
                id: "visual",
                name: "Complex visuals in a WebView",
                rows: [
                  {
                    key: "problem",
                    text: "Gradients, transparency, a glass header, a parallax sheet, transitions between screens: on iOS visuals like these keep breaking.",
                  },
                  {
                    key: "solution",
                    text: "The intro was made with Lottie instead of a video: the video was heavy and lost quality. Transitions are built on the View Transitions API. While preparing the demo we gathered the visual bugs into one list and closed them one by one.",
                  },
                  {
                    key: "result",
                    text: "Of about 20 visual bugs in the demo, all but one are closed. The interface in a WebView looks like a native app.",
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
                value: "26",
                label: "screens for the client and the agent",
              },
              {
                value: "~1,700",
                label: "test cases in 177 files",
              },
              {
                value: "55",
                label: "reusable components",
              },
              {
                value: "2",
                label: "platforms from one codebase: iOS and Android",
              },
            ],
          },
        },
        {
          component: "ProjectCaseText",
          data: {
            text: "The app reached a demo build for the client. There are no business metrics yet: it has not been released.",
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseCta",
    data: {
      id: "cta",
      title: "Need an iOS and Android app with a complex design?",
      text: "I will pick a stack that fits the team, set up the project and bring the app to a demo on both platforms.",
    },
  },
  {
    component: "ProjectCaseNext",
    data: {},
  },
] satisfies ProjectBlock[];

export default hector;

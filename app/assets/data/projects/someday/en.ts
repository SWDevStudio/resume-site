import type { ProjectBlock } from "../../../api/types/projectCase";

const someday = [
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
        { key: "role", value: "Lead software developer: architecture and 11 driver libraries" },
        {
          key: "team",
          value:
            "Own all the software in a team of three specialists: electronics, enclosures, software",
        },
        {
          key: "duration",
          value:
            "The library ecosystem was developed from October 2025 and released for the 2026 game",
        },
        {
          key: "status",
          value: "Proven in real conditions at the 2026 game, under further development",
        },
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
          title: "The someday-lib core",
          text: "FreeRTOS tasks, thread-safe state, serializable game effects and RFID on RC522 for Mifare Classic and Ultralight cards.",
        },
        {
          title: "Module drivers",
          text: "Buttons, LEDs, an addressable LED strip, the battery, a display with Cyrillic, Wi-Fi, GPS, RFID on PN532 and a Serial console with commands.",
        },
        {
          title: "Library architecture",
          text: "Shared modules versioned with git tags instead of copied code in every firmware. Arduino and PlatformIO were my choice as well.",
        },
        {
          title: "Rules for the AI assistant",
          text: "Claude Code helps me make sense of C++ and writes separate pieces. For it I made the someday-guard plugin with hooks and rules: a driver template is created quickly, and I review and finish it myself.",
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
            name: "The project",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Someday is an indie project by the KB Someday team: electronics for story-driven field role-playing games. The audience is niche: mostly LARPers who play in the S.T.A.L.K.E.R. universe and similar post-apocalyptic settings. The project's first venue is a S.T.A.L.K.E.R. field role-playing game in the Urals.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "The team has three people: I am responsible for all the software, the second member for the electronics (circuits, soldering, assembly), and the third for the enclosures. Device firmware is built from the libraries, and the devices themselves are used by players on the field.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Next, the team plans to enter the international market with projects in similar settings and to monetize the work by offering ready-made devices and firmware to other games.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "situation",
            name: "Situation",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "At first every device was written from scratch, and code repeated from firmware to firmware: buttons, LEDs, RFID, communication. I moved the shared code into the someday-* libraries, and a new device started coming together from ready-made modules faster.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "constraints",
            name: "Field conditions",
            blocks: [
              {
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "POWER",
                      title: "Battery power",
                      text: "The drivers are designed for battery operation: charge monitoring, PWM backlight control and sleeping modules when idle.",
                    },
                    {
                      label: "OFFLINE",
                      title: "No network dependency",
                      text: "Devices do not depend on the internet or the field infrastructure. They work on their own or exchange data directly: over Wi-Fi in access point mode, BLE and RFID cards.",
                    },
                    {
                      label: "FIELD",
                      title: "Field conditions",
                      text: "Built for outdoor use and active handling by players: button debouncing, resilience to careless handling and fast recovery after a failure.",
                    },
                    {
                      label: "BUDGET",
                      title: "Limited budget",
                      text: "The architecture targets affordable components — ESP32 and budget modules — without losing reliability.",
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
            id: "goal",
            name: "Goal",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Make the role-playing game more varied with our own devices and build every new device from ready-made modules instead of writing it from scratch.",
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
                  text: "The libraries split into a core and module drivers. They all follow the same rules, so modules from different libraries live together in one firmware without extra work.",
                },
              },
              {
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "CORE",
                      title: "The someday-lib core",
                      text: "FreeRTOS tasks on CRTP, a value with a lifetime behind a mutex, serializable game effects: radiation and psi healing, a timer, death, revival and reset. RFID on RC522 with strategies for Mifare Classic and Ultralight.",
                      code: ["Task<Derived>", "Singleton", "GuardedState<T>", "EffectData"],
                    },
                    {
                      label: "CONVENTIONS",
                      title: "Shared rules",
                      text: "Every module has its own namespace. Modules are guarded by mutexes and never block: process() is called from the loop or from a task. Built through library.json for PlatformIO, versions on git tags.",
                      code: ["someday::<module>", "process()", "library.json"],
                    },
                    {
                      label: "DRIVERS",
                      wide: true,
                      title: "Module drivers",
                      text: "Several buttons in one firmware, an LED, a WS2812B addressable strip with the pin as a template parameter, a battery with a mock mode, a thread-safe 128×64 display with Cyrillic and PWM backlight, Wi-Fi in access point and client modes, GPS, RFID on PN532, a Serial console with commands, BLE artifact types.",
                      code: [
                        "someday-button",
                        "someday-diod",
                        "someday-address-led",
                        "someday-accumulator",
                        "someday-display",
                        "someday-wifi",
                        "someday-gps",
                        "Someday_RFID",
                        "Someday_SerialCommander",
                        "someday-types",
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
            id: "devices",
            name: "What the devices are built from",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "The firmware of six game devices runs on the libraries: a dosimeter, a scanner, a geo-tagger, a PKS, a BLE artifact with a detector and a master device for RFID cards. Below is what each firmware pulls in.",
                },
              },
              {
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "SOMEDAY-LIB",
                      title: "Core",
                      code: ["device-uyut", "device-scanner", "device-candle", "rfid-tool"],
                    },
                    {
                      label: "MODULES",
                      title: "GPS, Wi-Fi, buttons, light, Serial console",
                      code: ["device-uyut", "device-scanner", "device-candle"],
                    },
                    {
                      label: "DISPLAY · POWER",
                      title: "Display and battery",
                      code: ["device-uyut", "device-candle"],
                    },
                    {
                      label: "RFID",
                      title: "Someday_RFID",
                      code: ["device-uyut", "rfid-tool"],
                    },
                    {
                      label: "SOMEDAY-TYPES",
                      title: "BLE artifact types",
                      code: ["device-artefact", "device-otklick"],
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
            id: "hardware",
            name: "Hardware and buses",
            blocks: [
              {
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "MCU",
                      title: "ESP32-S3 and ESP32-C3",
                      text: "Including ESP32-S3 N16R8 with PSRAM.",
                    },
                    {
                      label: "RFID",
                      title: "RC522 and PN532",
                      text: "RC522 over SPI, PN532 over UART.",
                    },
                    {
                      label: "GPS",
                      title: "AT6558 / GP-02",
                      text: "UART at 9600 baud, NMEA and CASIC commands.",
                    },
                    {
                      label: "DISPLAY",
                      title: "JLX12864G-086",
                      text: "128×64 on the ST7567 controller, software SPI, PWM backlight.",
                    },
                    {
                      label: "LIGHT",
                      title: "WS2812B and LEDs",
                      text: "The addressable strip through FastLED, buttons through OneButton.",
                    },
                    {
                      label: "POWER",
                      title: "Two 18650 batteries",
                      text: "Voltage is read through a divider on the ADC: 1250–2100 mV map to 0–100 %.",
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
            id: "stack",
            name: "Why Arduino and PlatformIO",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "The project was my way into embedded; before that I worked on the web. Arduino and PlatformIO give a fast start and plenty of ready-made libraries: for an embedded newcomer it is the fastest path.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Along the way I learned C++ for microcontrollers, ESP32, FreeRTOS, buses and datasheets. Claude Code helped me make sense of C++.",
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
                    { label: "MFRC522", own: true, term: true },
                    { label: "PN532 + NDEF", own: true, term: true },
                    { label: "TinyGPSPlus", own: true, term: true },
                    { label: "ArduinoJson", own: true, term: true },
                    { label: "FastLED", own: true, term: true },
                    { label: "U8g2", own: true, term: true },
                    { label: "OneButton", own: true, term: true },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Third-party libraries talk to the hardware directly, and someday-* wrap them into modules with shared rules.",
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
                  text: "For someday-lib I wrote Unity unit tests, about 1800 lines, which run right on the device. MockGps and the battery mock mode help to debug without hardware.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Everything else was tested by hand, in three stages.",
                },
              },
              {
                component: "ProjectCaseSteps",
                data: {
                  steps: [
                    {
                      title: "Bench",
                      text: "We assemble the device and run scenarios through the SerialCommander Serial console and mocks",
                    },
                    {
                      title: "Field test",
                      text: "A check on location before the game",
                    },
                    {
                      title: "Game",
                      text: "The final check at the 2026 game",
                    },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "The libraries are versioned with git tags: someday-gps v2.1.0, Someday_RFID v1.1.0, the rest v1.0.x. Devices pin a version by tag or commit, so a new library version does not change firmware that is already built.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Every library has a README in Russian, and RFID and SerialCommander also have one in English. The someday-gps README runs to 670 lines.",
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
                id: "rfid-bus",
                name: "One RFID bus for several tasks",
                rows: [
                  {
                    key: "problem",
                    text: "Several FreeRTOS tasks worked with the PN532 reader over one UART, and the ACK responses got mixed up.",
                  },
                  {
                    key: "solution",
                    text: "I put one mutex on the whole Someday_RFID driver. Player data is written to the card as an NDEF record through the templated write<T> and read<T>.",
                  },
                  {
                    key: "result",
                    text: "We found the problem on the bench while debugging, before the game. At the game RFID worked reliably.",
                  },
                ],
              },
              {
                id: "typed-rfid",
                name: "Type-safe writes to the card",
                rows: [
                  {
                    key: "problem",
                    text: "Game data is written to the players' RFID cards, and the firmware must not write anything to a card that cannot be read back.",
                  },
                  {
                    key: "solution",
                    text: "In someday-lib, readData<T> and writeData<T> accept only serializable POD types through SFINAE and static_assert. After a write the data is verified by reading it back.",
                  },
                  {
                    key: "result",
                    text: "An unsuitable type will not compile: the error shows up at build time, not on the field.",
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
                value: "11",
                label: "someday-* driver libraries",
              },
              {
                value: "6",
                label: "game device firmwares built on them",
              },
              {
                value: "18–20 h",
                label: "of device runtime on two 18650s",
              },
              {
                value: "~30",
                label: "players went through the location's quests",
              },
            ],
          },
        },
        {
          component: "ProjectCaseText",
          data: {
            text: "At the 2026 game the team played as the Clear Sky faction: a game-tech location with a set of devices built on these libraries, 2–3 units of each. A chain of quests led players through working with different devices, and players spoke well of both the location and the devices.",
          },
        },
        {
          component: "ProjectCaseText",
          data: {
            text: "I came to embedded from the web and wrote driver libraries that devices ran on at a real game. Today I would study the theory more closely at the start and maybe pick C or Rust instead of Arduino: Arduino has a number of serious limitations when working with controllers, and rewriting a finished ecosystem is now expensive.",
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseCta",
    data: {
      id: "cta",
      title:
        "Preparing a similar project with game electronics? I will take on the device software as a whole",
      text: "I will design the architecture, write the module drivers and C++ and FreeRTOS firmware, test it and take it through field trials: RFID, GPS, displays, light, Wi-Fi and BLE.",
    },
  },
  {
    component: "ProjectCaseNext",
    data: {},
  },
] satisfies ProjectBlock[];

export default someday;

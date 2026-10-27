import type { ProjectBlock } from "../../../api/types/projectCase";

const tamrielCodex = [
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
        { key: "role", value: "Fullstack developer" },
        { key: "tools", value: "The Claude Code AI agent to speed up development" },
        { key: "duration", value: "10 days" },
        { key: "status", value: "Used at the game, next version planned" },
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
          title: "The whole app",
          text: "The interface, the local database and the Android and Windows builds from one Vue 3 and TypeScript codebase. I picked up the mobile stack, Capacitor and the Android build, along the way.",
        },
        {
          title: "Exporting the game data",
          text: "Wrote a parser with Codex and Playwright that exported texts, PDFs and images from the VK group. Then, together with Claude, turned them into the app's data.",
        },
        {
          title: "Search across the handbook",
          text: "Global search from the header across 11 sections, from the pantheon to the news. Clicking a result opens the card or scrolls the rules to the right section.",
        },
        {
          title: "Sharing without internet",
          text: "Came up with and built sharing of notes, characters and backstories by QR: one player shows the code on screen, the other scans it with the camera.",
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
            id: "game",
            name: "The game",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "A live-action role-playing game set in The Elder Scrolls world, about 100 players. The app was built for part of the players: at this game it was used by the Aldmeri Dominion faction, which is why the codex speaks in the voice of an Altmer chronicler. For the next game the plan is to develop it so that every player uses it.",
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
                  text: "The game materials were scattered across a VK group: rules in .docx and PDF, news, newspapers, decrees and rumors as posts, articles, attachments and images. Players had to bring a stack of paper to the game or read an awkward PDF on their phones.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Players needed to find things in the game's knowledge base fast and keep their own notes. There is no internet at the game site, people play from Android phones and PCs, and the deadline was fixed: there were 10 days for development.",
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
                component: "ProjectCaseGoal",
                data: {
                  value: "10 days",
                  text: "was the time to get the app ready for the game. The aim was to make the game better: get rid of the stack of paper and awkward PDFs, give players the rules and lore with fast search, their own notes and a way to share them without internet.",
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
            id: "contents",
            name: "What's inside",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "The game rules are a tree of collapsible sections, next to a quick guide, 13 classes with levels and the original PDFs of seven rulebooks in a built-in viewer. Lore: the pantheon ranked by the game's decree, clans and houses, towers, a guide to Tamriel and the creation of the world.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: '"News of Tamriel" brings together a newspaper by province, history and rumors by year and documents of the online cycles with filters. The four in-game scripts have their own fonts, glyph tables and a live translator. Players keep their own data right there: notes, important characters, backstories and tags with filtering.',
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
                  text: "To make it by game day, I went with a familiar web stack instead of native Android, Flutter or React Native: one Vue codebase runs on both the phone and the PC. All content is built into the app, and the VK link stays only as attribution.",
                },
              },
              {
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "CLIENT",
                      title: "One codebase",
                      text: "Vue 3 and strict TypeScript, Pinia, Vue Router, Tailwind CSS and daisyUI.",
                    },
                    {
                      label: "SHELLS",
                      title: "Two shells",
                      text: "Capacitor builds the Android APK, Electron builds a portable Windows .exe that needs no installation.",
                    },
                    {
                      label: "CONTENT",
                      title: "Built-in handbook",
                      text: "Static data in TypeScript files, with images and PDFs bundled inside the app.",
                    },
                    {
                      label: "DATA",
                      title: "Player data",
                      text: "SQLite on the device: notes, characters, tags and backstories. The schema is updated through versioned migrations.",
                    },
                    {
                      label: "BUILD",
                      title: "Content pipeline",
                      text: "At build time the rules turn from .docx into a section tree, images are compressed to 768 px WebP, and the original PDFs are placed alongside.",
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
            id: "exchange",
            name: "Sharing without internet",
            blocks: [
              {
                component: "ProjectCaseSteps",
                data: {
                  steps: [
                    {
                      title: "Note",
                      text: "A player opens a note, a character or a backstory",
                    },
                    {
                      title: "QR on screen",
                      text: "The app shows the entry as a QR code",
                    },
                    {
                      title: "Camera",
                      text: "Another player scans the code, and the app remembers the chosen camera",
                    },
                    {
                      title: "A copy of their own",
                      text: "The second player gets the same entry",
                    },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Inside the code is compact JSON, compressed and encoded in base45. That string fits the alphanumeric QR mode, which is denser than the byte mode, and native scanners don't mangle it.",
                },
              },
              {
                component: "ProjectCasePipeline",
                data: {
                  stages: [
                    { name: "JSON · UTF-8", next: "compression" },
                    { name: "deflate-raw", next: "encoding" },
                    { name: "base45", next: "QR code" },
                  ],
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "mobile",
            name: "A phone at the game site",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "On the phone, important characters collapse into accordion cards, the hardware Back button closes modals, and tap targets are 44–48 px. Light and dark themes are both available: depending on the device, each player preferred one or the other.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "growth",
            name: "Room for updates",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Every QR code carries the schema version: if a code was made in a different version, the older app asks to be updated. Database migrations carry the player's data over when a new build is installed. A new handbook section takes one navigation entry: the menu item, the home page card and the route appear on their own.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "security",
            name: "Player data",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "All player data stays on the device, nothing is sent to a server. The QR format is closed, so only the app can read the codes. Incoming codes are validated: a damaged code or one from an unknown schema version is rejected.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "quality",
            name: "Quality and builds",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "The app was written together with Claude following the rules in the repository's CLAUDE.md: code conventions, the search architecture, tone and rules for content, tap target sizes. That kept the pace high: 106 commits in 10 days.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Types are checked by vue-tsc on every build, and the code goes through ESLint and oxlint. I tested the app by hand on my own phone and PC, and before the game handed it to a few players and collected their feedback.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "The APK and the portable .exe are built with local scripts, and the builds were handed out to players as files in the chat and the group.",
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
                id: "vk-data",
                name: "Game data only in a VK group",
                rows: [
                  {
                    key: "problem",
                    text: "News, newspapers, decrees, rumors and documents sat in a VK group as posts, articles, PDF attachments and images, while the app had to work without internet.",
                  },
                  {
                    key: "solution",
                    text: "I needed a quick solution, so I built the export scenario with Codex and Playwright. Articles became text, PDF attachments became text via pdftotext, and post images were downloaded locally. Then the agent wrote the scripts that converted everything into the app's format.",
                  },
                  {
                    key: "result",
                    text: "All built-in content came from this export: about 24 newsletter pieces, rumors covering 11 years, about 37 cycle documents and 41 images. It all works offline and can be found with the search in the header.",
                  },
                  {
                    key: "next",
                    text: "Based on the game and the organizers' feedback: content updates without rebuilding the app, so organizers can hand new materials to players themselves.",
                  },
                ],
              },
              {
                id: "rules",
                name: "Rules from documents to search",
                rows: [
                  {
                    key: "problem",
                    text: "The rulebooks were in .docx and PDF, and a PDF is awkward to read on a phone and slow to search for the right clause.",
                  },
                  {
                    key: "solution",
                    text: "A script builds the section tree from the .docx versions of the rulebooks. The original PDFs sit alongside and open in the built-in viewer.",
                  },
                  {
                    key: "result",
                    text: "Search finds a rule down to the section and scrolls to it. Players specifically mentioned the rules with fast search.",
                  },
                ],
              },
              {
                id: "qr-size",
                name: "A note in one QR code",
                rows: [
                  {
                    key: "problem",
                    text: "The limit is the largest QR code, version 40 with 4,296 characters, and Cyrillic text compresses poorly.",
                  },
                  {
                    key: "solution",
                    text: "I chose field limits so that even incompressible Cyrillic text is guaranteed to fit: a note gets 100 characters for the title and 2,000 for the text. The final check is done against the actual code size.",
                  },
                  {
                    key: "result",
                    text: "At the game, players shared notes by QR without internet.",
                  },
                  {
                    key: "next",
                    text: "Based on players' feedback: support for large notes, by splitting the data across several QR codes in a row or using a QR code as a bridge for a direct transfer between two phones.",
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
      name: "Results",
      blocks: [
        {
          component: "ProjectCaseResults",
          data: {
            stats: [
              {
                value: "10 days",
                label: "from the first to the last commit, released right on schedule",
              },
              {
                value: "2",
                label: "platforms from one codebase: Android and Windows",
              },
              {
                value: "11",
                label: "sections in global search",
              },
              {
                value: "4",
                label: "in-game alphabets with fonts and a translator",
              },
            ],
          },
        },
        {
          component: "ProjectCaseText",
          data: {
            text: "At the game the app was used by the Aldmeri Dominion faction. Instead of a stack of paper and PDFs on a phone, anything took seconds to find. Players mentioned the convenience, the rules with fast search, the light and dark themes, the joke easter eggs and the help with translating the alphabets.",
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseCta",
    data: {
      id: "cta",
      title: "Need an app that works offline on phones and PCs?",
      text: "I'll build the Android and Windows versions from one codebase: a local database, fast search and data sharing without a network.",
    },
  },
  {
    component: "ProjectCaseNext",
    data: {},
  },
] satisfies ProjectBlock[];

export default tamrielCodex;

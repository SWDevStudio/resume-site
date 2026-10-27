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
        { key: "role", value: "Ведущий разработчик ПО: архитектура и 11 библиотек драйверов" },
        {
          key: "team",
          value: "Отвечаю за всё ПО в команде из трёх специалистов: электроника, корпуса, софт",
        },
        {
          key: "duration",
          value: "Экосистема библиотек создавалась с октября 2025 и выпущена к игре 2026 года",
        },
        {
          key: "status",
          value: "Прошёл проверку в реальных условиях на игре 2026 года, развивается дальше",
        },
      ],
    },
  },
  {
    component: "ProjectCaseRole",
    data: {
      id: "role",
      name: "Что сделал я",
      items: [
        {
          title: "Ядро someday-lib",
          text: "FreeRTOS-задачи, потокобезопасное состояние, сериализуемые игровые эффекты и RFID на RC522 для карт Mifare Classic и Ultralight.",
        },
        {
          title: "Драйверы модулей",
          text: "Кнопки, светодиоды, адресная лента, аккумулятор, дисплей с кириллицей, Wi-Fi, GPS, RFID на PN532 и Serial-консоль с командами.",
        },
        {
          title: "Архитектура библиотек",
          text: "Вместо копий кода в каждой прошивке — общие модули с версиями на git-тегах. Arduino и PlatformIO тоже выбирал сам.",
        },
        {
          title: "Правила для ИИ-помощника",
          text: "Claude Code помогает разбираться в C++ и пишет отдельные куски. Под него сделал плагин someday-guard с хуками и правилами: шаблон драйвера создаётся быстро, а проверяю и дорабатываю его сам.",
        },
      ],
    },
  },
  {
    component: "ProjectCaseChapter",
    data: {
      id: "context",
      name: "Контекст",
      blocks: [
        {
          component: "ProjectCaseChapter",
          data: {
            id: "business",
            name: "Проект",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Someday — инди-проект команды KB Someday: электроника для полигонных ролевых игр с упором на сюжет. Аудитория узкая: в основном это ролевики, которые играют по вселенной S.T.A.L.K.E.R. и в похожих постапокалиптических сеттингах. Первая площадка проекта — полигонная игра по S.T.A.L.K.E.R. на Урале.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "В команде три человека: я отвечаю за всё программное обеспечение, второй участник — за электронику (схемы, пайка, сборка), третий — за корпуса. Прошивки устройств собираются из библиотек, а сами устройства используют игроки на полигоне.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Дальше команда планирует выйти на международные проекты со схожими сеттингами и монетизировать разработку: предлагать готовые устройства и прошивки другим играм.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "situation",
            name: "Ситуация",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Сначала каждое устройство писали с нуля, и код повторялся из прошивки в прошивку: кнопки, светодиоды, RFID, связь. Общий код я вынес в библиотеки someday-*, и новое устройство стало собираться из готовых модулей быстрее.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "constraints",
            name: "Условия полигона",
            blocks: [
              {
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "POWER",
                      title: "Автономное питание",
                      text: "Драйверы рассчитаны на работу от аккумуляторов: контроль заряда, ШИМ-управление подсветкой и сон модулей в простое.",
                    },
                    {
                      label: "OFFLINE",
                      title: "Работа без сети",
                      text: "Устройства не зависят от интернета и инфраструктуры полигона. Они работают автономно или обмениваются данными напрямую: через Wi-Fi в режиме точки доступа, BLE и RFID-карты.",
                    },
                    {
                      label: "FIELD",
                      title: "Полевые условия",
                      text: "Учтены улица и активное использование игроками: подавление дребезга кнопок, устойчивость к неаккуратному обращению и быстрое восстановление после сбоя.",
                    },
                    {
                      label: "BUDGET",
                      title: "Ограниченный бюджет",
                      text: "Архитектура рассчитана на доступную элементную базу — ESP32 и бюджетные модули — без потери надёжности.",
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
            name: "Цель",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Разнообразить ролевую игру своими устройствами и собирать каждое новое устройство из готовых модулей, а не писать его с нуля.",
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
      name: "Процесс, архитектура и решения",
      blocks: [
        {
          component: "ProjectCaseChapter",
          data: {
            id: "architecture",
            name: "Архитектура",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Библиотеки делятся на ядро и драйверы модулей. У всех одни правила, поэтому модули из разных библиотек без доработки уживаются в одной прошивке.",
                },
              },
              {
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "CORE",
                      title: "Ядро someday-lib",
                      text: "FreeRTOS-задачи на CRTP, значение с временем жизни под мьютексом, сериализуемые игровые эффекты: лечение радиации и пси, таймер, смерть, воскрешение и сброс. RFID на RC522 со стратегиями под Mifare Classic и Ultralight.",
                      code: ["Task<Derived>", "Singleton", "GuardedState<T>", "EffectData"],
                    },
                    {
                      label: "CONVENTIONS",
                      title: "Общие правила",
                      text: "У каждого модуля своё пространство имён. Модули защищены мьютексами и не блокируют: process() вызывается из цикла или из задачи. Сборка через library.json для PlatformIO, версии на git-тегах.",
                      code: ["someday::<module>", "process()", "library.json"],
                    },
                    {
                      label: "DRIVERS",
                      wide: true,
                      title: "Драйверы модулей",
                      text: "Несколько кнопок в одной прошивке, светодиод, адресная лента WS2812B с пином в параметре шаблона, аккумулятор с mock-режимом, потокобезопасный дисплей 128×64 с кириллицей и ШИМ-подсветкой, Wi-Fi в режимах точки доступа и клиента, GPS, RFID на PN532, Serial-консоль с командами, типы BLE-артефактов.",
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
            name: "Из чего собраны устройства",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "На библиотеках работают прошивки шести игровых устройств: дозиметр, сканер, гео-тэггер, ПКС, BLE-артефакт с детектором и мастер-устройство для RFID-карт. Ниже видно, какая прошивка что подключает.",
                },
              },
              {
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "SOMEDAY-LIB",
                      title: "Ядро",
                      code: ["device-uyut", "device-scanner", "device-candle", "rfid-tool"],
                    },
                    {
                      label: "MODULES",
                      title: "GPS, Wi-Fi, кнопки, свет, Serial-консоль",
                      code: ["device-uyut", "device-scanner", "device-candle"],
                    },
                    {
                      label: "DISPLAY · POWER",
                      title: "Дисплей и аккумулятор",
                      code: ["device-uyut", "device-candle"],
                    },
                    {
                      label: "RFID",
                      title: "Someday_RFID",
                      code: ["device-uyut", "rfid-tool"],
                    },
                    {
                      label: "SOMEDAY-TYPES",
                      title: "Типы BLE-артефактов",
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
            name: "Железо и шины",
            blocks: [
              {
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "MCU",
                      title: "ESP32-S3 и ESP32-C3",
                      text: "В том числе ESP32-S3 N16R8 с PSRAM.",
                    },
                    {
                      label: "RFID",
                      title: "RC522 и PN532",
                      text: "RC522 по SPI, PN532 по UART.",
                    },
                    {
                      label: "GPS",
                      title: "AT6558 / GP-02",
                      text: "UART на 9600 бод, NMEA и команды CASIC.",
                    },
                    {
                      label: "DISPLAY",
                      title: "JLX12864G-086",
                      text: "128×64 на контроллере ST7567, программный SPI, ШИМ-подсветка.",
                    },
                    {
                      label: "LIGHT",
                      title: "WS2812B и светодиоды",
                      text: "Адресная лента через FastLED, кнопки через OneButton.",
                    },
                    {
                      label: "POWER",
                      title: "Два аккумулятора 18650",
                      text: "Напряжение снимается через делитель на АЦП: 1250–2100 мВ пересчитываются в 0–100 %.",
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
            name: "Почему Arduino и PlatformIO",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Проект стал для меня входом в embedded, до этого я работал в вебе. Arduino и PlatformIO дают быстрый старт и много готовых библиотек: для новичка в embedded это самый быстрый путь.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "По ходу освоил C++ для микроконтроллеров, ESP32, FreeRTOS, шины и даташиты. В C++ помогал разбираться Claude Code.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "integrations",
            name: "Интеграции",
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
                  text: "Сторонние библиотеки работают с железом напрямую, а someday-* собирают их в модули с общими правилами.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "quality",
            name: "Качество и релизы",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Для someday-lib написал юнит-тесты на Unity, около 1800 строк, они запускаются прямо на устройстве. Отлаживать без железа помогают MockGps и mock-режим аккумулятора.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Остальное проверяли вручную, в три этапа.",
                },
              },
              {
                component: "ProjectCaseSteps",
                data: {
                  steps: [
                    {
                      title: "Стол",
                      text: "Собираем устройство и гоняем сценарии через Serial-консоль SerialCommander и моки",
                    },
                    {
                      title: "Полевой тест",
                      text: "Проверка на местности до игры",
                    },
                    {
                      title: "Игра",
                      text: "Финальная проверка на игре 2026 года",
                    },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Библиотеки версионируются git-тегами: someday-gps v2.1.0, Someday_RFID v1.1.0, остальные v1.0.x. Устройства закрепляют версию тегом или коммитом, поэтому новая версия библиотеки не меняет уже собранные прошивки.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "У всех библиотек есть README на русском, у RFID и SerialCommander ещё и на английском. README someday-gps занимает 670 строк.",
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
      name: "Сложности",
      blocks: [
        {
          component: "ProjectCaseChallenges",
          data: {
            items: [
              {
                id: "rfid-bus",
                name: "Одна шина RFID на несколько задач",
                rows: [
                  {
                    key: "problem",
                    text: "Несколько FreeRTOS-задач работали со считывателем PN532 через один UART, и ACK-ответы перемешивались.",
                  },
                  {
                    key: "solution",
                    text: "Поставил один мьютекс на весь драйвер Someday_RFID. Данные игрока пишутся на карту NDEF-записью через шаблонные write<T> и read<T>.",
                  },
                  {
                    key: "result",
                    text: "Проблему нашли на столе при отладке, до игры. На игре RFID работал стабильно.",
                  },
                ],
              },
              {
                id: "typed-rfid",
                name: "Типобезопасная запись на карту",
                rows: [
                  {
                    key: "problem",
                    text: "На RFID-карты игроков пишутся игровые данные, и прошивка не должна записать на карту то, что потом не прочитается.",
                  },
                  {
                    key: "solution",
                    text: "В someday-lib readData<T> и writeData<T> через SFINAE и static_assert принимают только сериализуемые POD-типы. После записи данные проверяются чтением.",
                  },
                  {
                    key: "result",
                    text: "Неподходящий тип не соберётся: ошибку видно при компиляции, а не на полигоне.",
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
      name: "Метрики и результаты",
      blocks: [
        {
          component: "ProjectCaseResults",
          data: {
            stats: [
              {
                value: "11",
                label: "библиотек драйверов someday-*",
              },
              {
                value: "6",
                label: "прошивок игровых устройств на них",
              },
              {
                value: "18–20 ч",
                label: "работы устройства от двух 18650",
              },
              {
                value: "~30",
                label: "игроков прошли квесты локации",
              },
            ],
          },
        },
        {
          component: "ProjectCaseText",
          data: {
            text: "На игре 2026 года команда выходила группировкой «Чистое небо» — игротехнической локацией с набором устройств на этих библиотеках, каждого по 2–3 экземпляра. Воронка квестов проводила игроков через работу с разными устройствами, и игроки хорошо отзывались и о локации, и об устройствах.",
          },
        },
        {
          component: "ProjectCaseText",
          data: {
            text: "Пришёл в embedded из веба и написал библиотеки драйверов, на которых устройства отработали на реальной игре. Сейчас я бы плотнее изучил теорию в начале и, возможно, взял бы C или Rust вместо Arduino: у Arduino ряд существенных ограничений при работе с контроллерами, а переписывать готовую экосистему теперь дорого.",
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
        "Готовите похожий проект с игровой электроникой? Возьму разработку ПО для устройств целиком",
      text: "Спроектирую архитектуру, напишу драйверы модулей и прошивки на C++ и FreeRTOS, протестирую и доведу до полевых испытаний: RFID, GPS, дисплеи, свет, Wi-Fi и BLE.",
    },
  },
  {
    component: "ProjectCaseNext",
    data: {},
  },
] satisfies ProjectBlock[];

export default someday;

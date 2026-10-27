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
        { key: "role", value: "Тимлид фронтенд-разработки" },
        {
          key: "team",
          value: "15 человек: 5 frontend, 4 backend, 2 дизайнера, 2 QA, PM и DevOps",
        },
        { key: "duration", value: "С июня 2026" },
        { key: "status", value: "В разработке, демо-сборка для заказчика" },
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
          title: "Архитектура и стек",
          text: "Выбрал Vue 3 и Capacitor вместо React Native, Flutter и натива. Написал регламенты: Tailwind без отдельных стилей, весь текст через i18n, без as и комментариев, тесты в формате AAA.",
        },
        {
          title: "Старт проекта",
          text: "Заложил проект: Capacitor с live-reload, Tailwind, Storybook, линтеры, pre-push, окружение через mise, README с запуском в эмуляторе и симуляторе.",
        },
        {
          title: "Код",
          text: "Колёса выбора времени и даты с бесшовной циклической прокруткой, маска телефона, аккордеон, i18n с локалью устройства, первые версии экранов проверки заказа и активного заказа.",
        },
        {
          title: "Команда и заказчик",
          text: "Ставил задачи и приоритеты ещё четырём разработчикам, ревьюил и сливал PR. Анимации, iOS-часть, сигналы и карты они писали по моим задачам. Приложение заказчику презентовал сам.",
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
            name: "Бизнес",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Hector — сервис личной охраны и машин с водителем в Европе и ОАЭ. Клиент заказывает охрану или машину, оплачивает заказ, следит за командой на карте, а в опасной ситуации нажимает SOS.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "У агентов охраны свой кабинет: дежурство, назначенные заказы и маршрут, отметка о прибытии, SOS-тревоги клиентов.",
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
                  text: "Приложения не было: это новый продукт по ТЗ заказчика, разработка с нуля с июня 2026.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Заказчику нужно, чтобы всё работало на iOS и Android, а iOS-устройств ни у кого в команде разработки нет. Вдобавок приложение работает с API устройства, например реагирует на двойной стук по задней крышке iPhone.",
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
            id: "flow",
            name: "Путь заказа",
            blocks: [
              {
                component: "ProjectCaseSteps",
                data: {
                  steps: [
                    {
                      title: "Конфигуратор",
                      text: "Охрана: число агентов, с оружием или без, дресс-код, кинолог K9, язык. Или машина с водителем. Маршрут, дата, длительность",
                    },
                    {
                      title: "Проверка",
                      text: "Клиент проверяет заказ и отправляет его менеджеру",
                    },
                    {
                      title: "Оплата",
                      text: "Счёт с разбивкой, таймлайн статусов, заказ можно отредактировать",
                    },
                    {
                      title: "Live-трекинг",
                      text: "Команда на карте с ETA, кнопка SOS под рукой",
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
            name: "Почему Vue и Capacitor",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Команда знала Vue, Flutter не знал никто, а React Native тянет ограничения для веба. Дизайн у Hector сложный: градиенты, стекло, прозрачности. Чистый CSS в WebView позволяет сделать всё, что нарисовали дизайнеры, а Capacitor даёт доступ к возможностям устройства.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "architecture",
            name: "Архитектура",
            blocks: [
              {
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "APP",
                      title: "Vue 3 SPA",
                      text: "В оболочке Capacitor на Android и iOS. Pinia хранит заказ, конфигуратор, назначенные заказы и сигналы.",
                    },
                    {
                      label: "NATIVE",
                      title: "Нативные плагины",
                      text: "Биометрия, secure storage для PIN, клавиатура, системная кнопка «Назад», safe area под вырезы iPhone.",
                    },
                    {
                      label: "API",
                      title: "REST бэкенда",
                      text: "Свой HTTP-клиент с интерцепторами. В демо API подменяет мок-сервер на miragejs, который повторяет контракт.",
                      code: ["auth", "configurator", "orders"],
                    },
                    {
                      label: "MAPS",
                      title: "Карты",
                      text: "OpenStreetMap: Leaflet для карты и live-трекинга, Photon и Nominatim для поиска адресов, OSRM для маршрута.",
                    },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Весь текст идёт через vue-i18n, локаль берётся с устройства, поэтому новый язык добавляется файлом. Мок-сервер повторяет контракт API, и фронтенд с демо не ждут бэкенд.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "signals",
            name: "Тихие сигналы",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Клиент назначает действие на двойной и тройной стук по задней крышке iPhone и на четыре кнопки виджета экрана блокировки. Для каждого сигнала задаётся, кому он уходит, что сделать и за какое время отреагировать: охраннику подойти, водителю подать машину, диспетчерской просто узнать.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Приложение ловит сигнал через URL-схему, в том числе при холодном старте. Пока это прототип, в демо-сборке он скрыт.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "security",
            name: "Безопасность данных",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "PIN хранится в защищённом хранилище устройства, вход по Face ID или отпечатку. Сессия держится на токене: при 401 приложение возвращает на экран входа. У клиента и агента раздельные маршруты.",
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
                  text: "Vitest и Vue Test Utils: 177 файлов, около 1700 тест-кейсов рядом с кодом, включая сервисы сессии, PIN, safe area и клавиатуры. Storybook с проверкой доступности. E2E на Playwright пишет другой разработчик по сценариям демо: вход, заказ от конфигуратора до завершения, SOS, профиль, кабинет агента.",
                },
              },
              {
                component: "ProjectCasePipeline",
                data: {
                  stages: [
                    { name: "pre-push", next: "тесты и линт изменённых файлов" },
                    { name: "Codemagic", next: "сборка iOS в облаке" },
                    { name: "TestFlight", next: "приложение на iPhone" },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Pre-push с тестами и линтом настроил я, Codemagic — DevOps команды. Android собирается подписанным bundle из Android Studio.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Работаем недельными спринтами с демо в конце каждого. Задачи в Jira, ветка на задачу, PR с ревью.",
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
                id: "ios",
                name: "iOS без iOS-устройств",
                rows: [
                  {
                    key: "problem",
                    text: "Всё должно работать на iOS, а iPhone и Mac для сборки и отладки ни у кого в команде нет.",
                  },
                  {
                    key: "solution",
                    text: "Сборку iOS вынесли в облако Codemagic: вариант под симулятор и подписанный .ipa с выгрузкой в TestFlight. Нативный проект патчится скриптом на каждой сборке, иначе приложение из Xcode 27+ закрывается сразу после запуска. Тестировали на облачных устройствах BrowserStack и через TestFlight.",
                  },
                  {
                    key: "result",
                    text: "Приложение дошло до демо под iOS и Android. В демо-сборке закрыты баги, которые видно только на iPhone: двойной тап приближал экран, шапка заезжала под строку состояния, низ шторки уходил под полоску «домой».",
                  },
                ],
              },
              {
                id: "visual",
                name: "Сложный визуал в WebView",
                rows: [
                  {
                    key: "problem",
                    text: "Градиенты, прозрачности, стеклянная шапка, шторка-параллакс, переходы между экранами: на iOS такой визуал постоянно ломается.",
                  },
                  {
                    key: "solution",
                    text: "Интро сделали на Lottie вместо видео: видео много весило и теряло качество. Переходы построили на View Transitions API. При подготовке демо собрали визуальные баги в один список и закрывали по одному.",
                  },
                  {
                    key: "result",
                    text: "Из примерно 20 визуальных багов демо закрыты все, кроме одного. Интерфейс в WebView выглядит как нативное приложение.",
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
                value: "26",
                label: "экранов для клиента и агента",
              },
              {
                value: "~1700",
                label: "тест-кейсов в 177 файлах",
              },
              {
                value: "55",
                label: "переиспользуемых компонентов",
              },
              {
                value: "2",
                label: "платформы из одного кода: iOS и Android",
              },
            ],
          },
        },
        {
          component: "ProjectCaseText",
          data: {
            text: "Приложение доведено до демо-сборки для заказчика. Бизнес-метрик пока нет: оно ещё не вышло в релиз.",
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseCta",
    data: {
      id: "cta",
      title: "Нужно мобильное приложение для iOS и Android со сложным дизайном?",
      text: "Подберу стек под команду, заложу проект и доведу приложение до демо на обеих платформах.",
    },
  },
  {
    component: "ProjectCaseNext",
    data: {},
  },
] satisfies ProjectBlock[];

export default hector;

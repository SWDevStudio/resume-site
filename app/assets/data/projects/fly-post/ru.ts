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
        { key: "role", value: "Fullstack-разработчик, вёл проект" },
        { key: "team", value: "Я и 2 фронтенд-разработчика" },
        { key: "duration", value: "Около 5 недель, март – апрель 2025" },
        { key: "status", value: "MVP сдан заказчику" },
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
          title: "Дизайн и UI-кит",
          text: "Макеты основных экранов для ПК и телефона в Figma и UI-кит: кнопки, поля, бейджи, карточки. Разработчики собирали экраны из моих компонентов.",
        },
        {
          title: "Архитектура и бэкенд",
          text: "Выбрал стек, описал контракт API в Swagger и написал REST API на NestJS. Настроил инфраструктуру: Docker, VPS и GitLab CI.",
        },
        {
          title: "Фронтенд",
          text: "Каркас на Vite и TypeScript, mock-сервер на MSW, локализация, формы входа и регистрации с кодом подтверждения, карта на Leaflet.",
        },
        {
          title: "Команда",
          text: "Собрал двух фронтенд-разработчиков, ставил им задачи в git issues, задал структуру проекта и код-стайл, ревьюил их код.",
        },
      ],
    },
  },
  {
    component: "ProjectCaseChapter",
    data: {
      id: "context",
      name: "Контекст и точка А",
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
                  text: "Частный заказчик запускал попутную доставку документов и мелких посылок в другой город или страну. Экипаж самолёта, стюардессы и пилоты, и так летит этим рейсом: он забирает почту в аэропорту, сдаёт её в месте назначения и получает за это деньги.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Для отправителя так быстрее курьерских служб, для экипажа это подработка. Сервис внутренний, доступ в него выдают.",
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
                  text: "До сервиса о такой доставке договаривались вручную, через знакомых и чаты. Проект начинали с нуля.",
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
                component: "ProjectCaseGoal",
                data: {
                  value: "MVP",
                  text: "в кратчайший срок и с небольшим бюджетом. Нагрузки небольшие, поэтому стек простой: Vue 3, NestJS и PostgreSQL.",
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
            name: "Путь посылки",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "В сервисе две роли: отправитель заводит посылку, курьер из экипажа берёт её на свой рейс.",
                },
              },
              {
                component: "ProjectCaseSteps",
                data: {
                  steps: [
                    {
                      title: "Отправление",
                      text: "Отправитель заводит посылку на отправление",
                    },
                    {
                      title: "Рейс",
                      text: "Курьер указывает свой рейс, например из Москвы в Париж",
                    },
                    {
                      title: "Аэропорт",
                      text: "Курьер забирает почту в аэропорту вылета",
                    },
                    {
                      title: "Доставка",
                      text: "Сдаёт посылку в месте назначения и получает деньги за доставку",
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
            name: "Архитектура",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "NestJS выбрал ради одного языка с фронтендом: TypeScript и общие типы контракта на обеих сторонах. Для команды из трёх человек на коротком сроке так быстрее.",
                },
              },
              {
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "CLIENT",
                      title: "SPA",
                      text: "Vue 3 на Vite, Pinia, Vue Router, Tailwind и daisyUI. Локализация заложена на vue-i18n, ru/en.",
                    },
                    {
                      label: "API",
                      title: "REST на NestJS",
                      text: "Контракт описан в Swagger, роли отправителя и курьера проверяются на guard'ах.",
                    },
                    {
                      label: "DATA",
                      title: "PostgreSQL",
                      text: "Основная база с бэкапами.",
                    },
                    {
                      label: "INFRA",
                      title: "Docker на VPS",
                      text: "Фронтенд, NestJS и PostgreSQL в контейнерах, GitLab CI собирает образы и выкатывает их на сервер.",
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
            name: "Карта и интерфейс",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Точки на карте видно сразу, даже когда их много. Карту собрал на Leaflet со своими SVG-метками, кластерами, кнопками зума и геолокации, а поиск адреса с подсказками работает через Nominatim из OpenStreetMap.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Путь заказа виден по шагам во вложенном сворачиваемом таймлайне статусов. В формах маски и валидация, код подтверждения вводится по 4 ячейкам с таймером повторной отправки.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "На телефоне навигация уходит в нижнее меню вкладок, таблица отправлений прокручивается вбок с закреплённой колонкой действий, панель деталей и карта открываются на весь экран.",
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
                    { label: "Telegram-бот · код входа", own: true },
                    { label: "Nominatim · OpenStreetMap", own: true, term: true },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Рейсы курьер вводит вручную, API расписаний не подключали. Выплаты курьерам через платёжный сервис планировали, в MVP их нет.",
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
                  text: "Сервис хранит персональные данные пользователей. Чувствительные поля шифруются в приложении до записи в базу, соединение идёт по HTTPS, база бэкапится. Вход по коду через Telegram-бота, доступ разграничен по ролям отправителя и курьера.",
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
                  text: "Три разработчика писали один фронтенд за несколько недель, поэтому правила задал сразу: структура папок описана в README, код-стайл проверяет ESLint, весь код проходит кросс-ревью.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Для бэкенда писали юнит-тесты, для фронтенда снапшот-тесты компонентов на Vitest и @vue/test-utils, их написание отдали ИИ-агентам.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "После переезда репозитория в GitLab настроили GitLab CI: он собирает Docker-образы и сам выкатывает их на VPS.",
                },
              },
              {
                component: "ProjectCasePipeline",
                data: {
                  stages: [
                    { name: "build", next: "Docker-образы" },
                    { name: "deploy", next: "VPS" },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Формального процесса не было: с заказчиком созванивались и переписывались напрямую, задачи разработчикам шли в git issues, без спринтов.",
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
                id: "parallel",
                name: "Фронтенд без бэкенда",
                rows: [
                  {
                    key: "problem",
                    text: "Срок сжатый, фронтенд должен был стартовать сразу, а бэкенда ещё не было.",
                  },
                  {
                    key: "solution",
                    text: "Отдал команде контракт API в Swagger, а на фронтенде в первую неделю поднял каркас и mock-сервер на MSW.",
                  },
                  {
                    key: "result",
                    text: "Двое разработчиков верстали по контракту, не дожидаясь API, бэкенд шёл параллельно. MVP собрали примерно за 5 недель.",
                  },
                ],
              },
              {
                id: "login",
                name: "Вход по телефону без SMS",
                rows: [
                  {
                    key: "problem",
                    text: "Номер телефона нужно подтверждать, а SMS-провайдер берёт деньги за каждое сообщение. Для MVP с небольшим бюджетом это важно.",
                  },
                  {
                    key: "solution",
                    text: "Код подтверждения приходит через Telegram-бота. На фронтенде маска номера, выбор роли, отправитель или курьер, и ввод кода по 4 ячейкам с таймером повторной отправки.",
                  },
                  {
                    key: "result",
                    text: "Бот бесплатный, а экипажи и так сидят в Telegram, поэтому код приходит туда, где им удобнее.",
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
                value: "~5 нед.",
                label: "на MVP, фронтенд и бэкенд параллельно",
              },
              {
                value: "3",
                label: "разработчика в команде",
              },
              {
                value: "2",
                label: "роли: отправитель и курьер",
              },
            ],
          },
        },
        {
          component: "ProjectCaseText",
          data: {
            text: "Заказчик принял MVP. До запуска проект не дошёл, поэтому метрик использования нет.",
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseCta",
    data: {
      id: "cta",
      title: "Нужен MVP за несколько недель или сервис с картой и ролями?",
      text: "Сделаю дизайн, фронтенд и бэкенд, при необходимости соберу команду и доведу MVP до сдачи.",
    },
  },
  {
    component: "ProjectCaseNext",
    data: {},
  },
] satisfies ProjectBlock[];

export default flyPost;

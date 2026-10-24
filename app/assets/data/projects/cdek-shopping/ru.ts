import type { ProjectBlock } from "../../../api/types/projectCase";

const cdekShopping = [
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
        { key: "role", value: "Middle frontend-разработчик" },
        { key: "team", value: "4 frontend, 8 backend, 2 QA и дизайнер" },
        { key: "duration", value: "2 года, 10.2021 – 10.2023" },
        { key: "status", value: "Сайт в проде, работу на проекте завершил" },
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
          title: "Личный кабинет",
          text: "Весь фронтенд кабинета на Vue 2 и Vuex: пять разделов в одном приложении без перезагрузок страниц. Все компоненты кабинета написал по макетам дизайнера команды.",
        },
        {
          title: "Vue внутри Blade",
          text: "Убедил команду подключить Vue 2 и придумал, как встроить SPA-кабинет в Laravel + Blade без отдельного фронтенд-проекта.",
        },
        {
          title: "Рефакторинг легаси",
          text: "Покрыл jQuery-код E2E-тестами на Cypress и визуальными эталонами, затем разбил файлы по 6 000+ строк на модули с юнит-тестами на Jest.",
        },
        {
          title: "Laravel и аналитика",
          text: "Blade-шаблоны, роуты и данные для кабинета в ответах API. Подключил Яндекс Метрику и проставил события. Ревьюил задачи других фронтенд-разработчиков.",
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
                  text: "CDEK.Shopping — агент по зарубежному шопингу от ООО «СДЭК.Маркет», сервиса группы СДЭК. Покупатели из России заказывают товары брендов из США, Европы и Азии: платят российской картой, цены сразу в рублях.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Таможню и логистику сервис берёт на себя, доставку везёт собственная логистическая компания. Если товара нет на витрине, можно оставить заявку на выкуп.",
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
                  text: "Бизнес требовал запуститься как можно скорее, поэтому новый сервис строили на кодовой базе CDEK Market: jQuery и Blade, файлы по 6 000+ строк. Личный кабинет в ней выглядел как привет из нулевых, и каждое действие перезагружало страницу.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Техдолг бизнесу был неинтересен, поэтому рефакторинг приходилось укладывать в те же сроки, что и запуск.",
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
                  text: "К запуску сервиса сделать интерактивный личный кабинет, в котором ни одно действие не перезагружает страницу. Пользователи CDEK.Shopping старого кабинета так и не увидели: они сразу начали работать в новом.",
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
            id: "account",
            name: "Личный кабинет",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Покупатель переходит между разделами кабинета без перезагрузки. На вкладках счётчики: сколько заказов ждёт оплаты и сколько товаров осталось без отзыва.",
                },
              },
              {
                component: "ProjectCaseSteps",
                data: {
                  steps: [
                    {
                      title: "Мои данные",
                      text: "Контакты с отдельной сменой email и телефона, данные для таможенного оформления",
                    },
                    {
                      title: "Заказы",
                      text: "Вкладки «Все», «Неоплаченные» и «По заявке на выкуп», фильтр, статус каждого товара, отдельная страница заказа",
                    },
                    {
                      title: "Мои баллы",
                      text: "Активные, начисленные и замороженные баллы, история начислений",
                    },
                    {
                      title: "Адрес доставки",
                      text: "Адрес по умолчанию, доставка до двери или до пункта выдачи",
                    },
                    {
                      title: "Отзывы",
                      text: "Товары, которые ждут отзыва, и уже написанные отзывы",
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
                  text: "Витрина осталась на серверном рендере, а кабинет работает как одностраничное приложение внутри того же сайта. Отдельный фронтенд-проект для этого не понадобился.",
                },
              },
              {
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "STOREFRONT",
                      title: "Витрина",
                      text: "Серверный рендер на Blade, интерактив на jQuery.",
                    },
                    {
                      label: "ACCOUNT",
                      title: "Личный кабинет",
                      text: "Vue 2 и Vuex. Бэкенд отдаёт контейнер #app, приложение разворачивается в нём, роутинг идёт через hash.",
                      code: ["account", "orderListing", "orderDetailsPage"],
                    },
                    {
                      label: "API",
                      title: "REST на Laravel",
                      text: "Кабинет получает данные через axios: профиль, заказы, баллы, доставку и отзывы.",
                      code: ["/api/v1/account", "/api/v1/loyalty", "/api/v1/customer"],
                    },
                    {
                      label: "SERVICES",
                      title: "Внешние сервисы",
                      text: "Оплата, маркетинговый трекер Mindbox, поиск Diginetica, Яндекс Метрика.",
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
            id: "components",
            name: "Компоненты кабинета",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Дизайн-систему компонентов продумывали вместе с дизайнером команды, именование по БЭМ. В кабинете 16 базовых UI-компонентов: кнопки, чекбокс, табы, селектор, фильтр, модальное окно, уведомление, тултип, пагинация и другие.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Из них собраны около 40 блоков разделов, иконки лежат в спрайте примерно из 30 штук. Кабинет сразу делал адаптивным, с отдельной мобильной навигацией.",
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
                    { label: "Яндекс Метрика · события", own: true },
                    { label: "Онлайн-оплата" },
                    { label: "Mindbox · маркетинговый трекер" },
                    { label: "Diginetica · поиск с автодополнением" },
                  ],
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
                  text: "Кабинет работает с персональными данными покупателей, в том числе с теми, что нужны для таможенного оформления. Чувствительные поля бэкенд отдаёт замаскированными, а в интерфейсе их целиком видно только по кнопке «Показать данные».",
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
                  text: "Перед рефакторингом сам покрыл критичные сценарии магазина E2E-тестами на Cypress и снял визуальные эталоны компонентов. Модули, которые появились после рефакторинга, покрыты юнит-тестами на Jest.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Каждая задача проходит CI-проверки и тестовый стенд, затем в плановую дату релиза попадает на препрод, идентичный боевому. После приёмки релиз выкатывается в прод без остановки сервиса, а при проблеме можно быстро откатиться на прошлую стабильную версию.",
                },
              },
              {
                component: "ProjectCasePipeline",
                data: {
                  stages: [
                    { name: "develop", next: "тестовый стенд" },
                    { name: "preprod", next: "приёмка" },
                    { name: "master", next: "прод без остановки" },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Работали двухнедельными спринтами с демо в конце каждого. Код-ревью проходила каждая задача, задачи других фронтенд-разработчиков ревьюил я.",
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
                id: "legacy",
                name: "Легаси-файлы по 6 000+ строк",
                rows: [
                  {
                    key: "problem",
                    text: "Клиентский код на jQuery лежал в файлах по 6 000+ строк. Написать юнит-тесты на такую лапшу было нереально, а трогать её без тестов опасно.",
                  },
                  {
                    key: "solution",
                    text: "Сначала покрыл критичные сценарии E2E-тестами на Cypress и снял визуальные эталоны, чтобы рефакторинг не сломал ни логику, ни вёрстку. Потом по принципам Refactoring.Guru выносил повторяющийся код в модули и дробил их дальше, пока не остались чистые функции, покрытые юнит-тестами на Jest.",
                  },
                  {
                    key: "result",
                    text: "Регрессионных багов стало на 37% меньше по отчётам QA. Фичи стали выходить быстрее, просрочка по спринтам упала.",
                  },
                ],
              },
              {
                id: "vue",
                name: "Vue 2 в проекте на jQuery",
                rows: [
                  {
                    key: "problem",
                    text: "Проект целиком написан на jQuery и Blade. Для интерактивного кабинета нужен был современный фреймворк, и команду предстояло убедить его подключить.",
                  },
                  {
                    key: "solution",
                    text: "Добился одобрения подключить Vue 2 в кабинет и встроил его без отдельного проекта: бэкенд отдаёт контейнер #app, приложение разворачивается в нём, роутинг идёт через hash. Кабинет должен был на живом примере показать, что на Vue писать проще и быстрее, чем поддерживать легаси.",
                  },
                  {
                    key: "result",
                    text: "Кабинет нового сервиса запустился на Vue 2 и Vuex и стал аргументом за уход с легаси: команда решила переписать проект на Nuxt.",
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
                value: "−37%",
                label: "регрессионных багов после рефакторинга",
              },
              {
                value: "5",
                label: "разделов кабинета в одном приложении",
              },
              {
                value: "16",
                label: "базовых UI-компонентов кабинета",
              },
              {
                value: "2 года",
                label: "на проекте",
              },
            ],
          },
        },
        {
          component: "ProjectCaseText",
          data: {
            text: "Покупатели CDEK.Shopping с первого дня работали в новом кабинете, а рефакторинг легаси сократил число регрессий и ускорил выпуск фич.",
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseCta",
    data: {
      id: "cta",
      title: "Нужен современный личный кабинет в легаси-проекте?",
      text: "Встрою интерактивный кабинет в существующий сайт без отдельного фронтенд-проекта, покрою легаси тестами и разберу его на модули.",
    },
  },
  {
    component: "ProjectCaseNext",
    data: {},
  },
] satisfies ProjectBlock[];

export default cdekShopping;
